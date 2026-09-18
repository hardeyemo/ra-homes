import { Play } from "lucide-react";

export const PropertyVideos = ({ videos, title }: { videos: string[]; title: string }) => {
  if (!videos.length) return null;
  return (
    <section aria-labelledby="property-videos" className="mt-6">
      <div className="mb-3 flex items-center gap-2"><Play className="h-4 w-4 text-clay" /><h2 id="property-videos" className="font-display text-2xl">Property videos</h2></div>
      <div className="grid gap-4 lg:grid-cols-2">
        {videos.map((video, index) => <div key={`${video}-${index}`} className="overflow-hidden rounded-2xl border border-line bg-ink">
          <video controls preload="metadata" className="aspect-video w-full" aria-label={`${title} video ${index + 1}`}><source src={video} />Your browser does not support this video.</video>
        </div>)}
      </div>
    </section>
  );
};
