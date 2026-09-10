"use client";

import { useState } from "react";
import Image from "next/image";
import { Loader2, UploadCloud, X } from "lucide-react";
import { uploadImageToCloudinary, CLOUDINARY_CONFIGURED } from "@/lib/cloudinary";

interface Props {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  label?: string;
}

export const ImageUploader = ({ images, onChange, maxImages = 12, label = "Photos" }: Props) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList) return;
    setError(null);

    const files = Array.from(fileList).slice(0, maxImages - images.length);
    if (files.length === 0) return;

    setUploading(true);
    setProgress({ done: 0, total: files.length });

    const uploaded: string[] = [];
    for (const file of files) {
      try {
        const url = await uploadImageToCloudinary(file);
        uploaded.push(url);
      } catch (err) {
        setError(err instanceof Error ? err.message : "One of your photos failed to upload.");
      }
      setProgress((p) => (p ? { ...p, done: p.done + 1 } : null));
    }

    onChange([...images, ...uploaded].slice(0, maxImages));
    setUploading(false);
    setProgress(null);
  };

  const removeImage = (index: number) => onChange(images.filter((_, i) => i !== index));

  if (!CLOUDINARY_CONFIGURED) {
    return (
      <div className="border border-dashed border-line bg-parchment/40 p-4 text-xs text-ink/50">
        Image upload isn't configured yet — the RA team needs to set
        <code> NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME</code> and <code>NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET</code>.
      </div>
    );
  }

  return (
    <div>
      <label
        htmlFor="image-uploader-input"
        className={`flex flex-col items-center justify-center gap-2 border border-dashed border-line bg-parchment/40 h-28 text-ink/50 transition-colors ${
          images.length >= maxImages || uploading ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:border-clay hover:text-clay"
        }`}
      >
        {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UploadCloud className="w-5 h-5" />}
        <span className="text-xs font-mono uppercase tracking-widest">
          {uploading
            ? `Uploading ${progress?.done ?? 0}/${progress?.total ?? 0}...`
            : images.length >= maxImages
            ? `${maxImages} photo limit reached`
            : `Click to upload ${label.toLowerCase()}`}
        </span>
      </label>
      <input
        id="image-uploader-input"
        type="file"
        accept="image/*"
        multiple
        disabled={images.length >= maxImages || uploading}
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />

      {error && <p className="mt-2 text-xs text-clay-dark">{error}</p>}

      {images.length > 0 && (
        <div className="mt-3 grid grid-cols-4 sm:grid-cols-6 gap-2">
          {images.map((src, i) => (
            <div key={src + i} className="relative aspect-square border border-line">
              {/* Upload sources can be external, so preview them without server optimization. */}
              <Image src={src} alt={`Upload ${i + 1}`} fill unoptimized sizes="(max-width: 640px) 25vw, 16vw" className="object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                aria-label="Remove photo"
                className="absolute top-1 right-1 h-5 w-5 bg-ink/80 text-parchment flex items-center justify-center"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
