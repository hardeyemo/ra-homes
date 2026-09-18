"use client";

import { useId, useState } from "react";
import { FileVideo, Loader2, UploadCloud, X } from "lucide-react";
import { CLOUDINARY_CONFIGURED, uploadVideoToCloudinary } from "@/lib/cloudinary";

interface Props {
  videos: string[];
  onChange: (videos: string[]) => void;
  maxVideos?: number;
}

const ACCEPTED_TYPES = new Set(["video/mp4", "video/webm"]);
const ACCEPTED_EXTENSIONS = new Set(["mp4", "webm"]);
const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024;

function isAcceptedVideo(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();
  // Some mobile browsers leave File.type empty for an otherwise-valid file.
  return ACCEPTED_TYPES.has(file.type.toLowerCase()) || Boolean(extension && ACCEPTED_EXTENSIONS.has(extension));
}

export const VideoUploader = ({ videos, onChange, maxVideos = 3 }: Props) => {
  const inputId = useId();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList) return;
    setError(null);
    const selected = Array.from(fileList).slice(0, maxVideos - videos.length);
    const files = selected.filter((file) => isAcceptedVideo(file) && file.size > 0 && file.size <= MAX_FILE_SIZE_BYTES);
    if (files.length !== selected.length) setError("Each video must be an MP4 or WebM file smaller than 100 MB.");
    if (!files.length) return;

    setUploading(true);
    setProgress({ done: 0, total: files.length });
    const uploaded: string[] = [];
    for (const file of files) {
      try {
        uploaded.push(await uploadVideoToCloudinary(file));
      } catch (err) {
        setError(err instanceof Error ? err.message : "One of your videos failed to upload.");
      }
      setProgress((current) => (current ? { ...current, done: current.done + 1 } : null));
    }
    onChange([...videos, ...uploaded].slice(0, maxVideos));
    setUploading(false);
    setProgress(null);
  };

  if (!CLOUDINARY_CONFIGURED) {
    return <div className="border border-dashed border-line bg-parchment/40 p-4 text-xs text-ink/50">Video upload isn&apos;t configured yet. The Cloudinary unsigned preset must allow MP4 and WebM video uploads.</div>;
  }

  return (
    <div>
      <label htmlFor={inputId} className={`flex h-28 flex-col items-center justify-center gap-2 border border-dashed border-line bg-parchment/40 text-ink/50 transition-colors ${videos.length >= maxVideos || uploading ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:border-clay hover:text-clay"}`}>
        {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <UploadCloud className="h-5 w-5" />}
        <span className="text-xs font-mono uppercase tracking-widest">{uploading ? `Uploading ${progress?.done ?? 0}/${progress?.total ?? 0}...` : videos.length >= maxVideos ? `${maxVideos} video limit reached` : "Click to upload video"}</span>
      </label>
      <input
        id={inputId}
        type="file"
        accept="video/mp4,video/webm,.mp4,.webm"
        multiple
        disabled={videos.length >= maxVideos || uploading}
        onChange={(event) => {
          void handleFiles(event.target.files);
          // Allow retrying the same file after a failed Cloudinary upload.
          event.currentTarget.value = "";
        }}
        className="hidden"
      />
      <p className="mt-2 text-xs text-ink/55">MP4 or WebM, up to 100 MB each. Up to {maxVideos} videos.</p>
      {error && <p className="mt-2 text-xs text-clay-dark">{error}</p>}
      {videos.length > 0 && <div className="mt-3 grid gap-3 sm:grid-cols-2">{videos.map((src, index) => (
        <div key={`${src}-${index}`} className="relative overflow-hidden border border-line bg-ink">
          <video src={src} controls preload="metadata" className="aspect-video w-full" aria-label={`Uploaded video ${index + 1}`} />
          <button type="button" onClick={() => onChange(videos.filter((_, itemIndex) => itemIndex !== index))} aria-label={`Remove video ${index + 1}`} className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-ink/80 text-parchment hover:bg-ink"><X className="h-4 w-4" /></button>
          <div className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded bg-ink/75 px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-parchment"><FileVideo className="h-3 w-3" /> Video {index + 1}</div>
        </div>
      ))}</div>}
    </div>
  );
};
