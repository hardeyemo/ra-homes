"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Images, Play, X } from "lucide-react";

type Props = { images: string[]; title: string; instagramVideoUrl?: string; instagramVideoThumbnailUrl?: string };

export const PropertyGallery = ({ images, title, instagramVideoUrl, instagramVideoThumbnailUrl }: Props) => {
  const [active, setActive] = useState<number | null>(null);
  const visibleImages = images.slice(0, 5);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (active === null) return;
      if (event.key === "Escape") setActive(null);
      if (event.key === "ArrowLeft") setActive((current) => current === null ? null : (current - 1 + images.length) % images.length);
      if (event.key === "ArrowRight") setActive((current) => current === null ? null : (current + 1) % images.length);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active, images.length]);

  if (!images.length) return null;
  const open = (index: number) => setActive(index);
  const close = () => setActive(null);
  const activeIsInstagramThumbnail = active !== null && images[active] === instagramVideoThumbnailUrl && Boolean(instagramVideoUrl);

  return (
    <>
      <section aria-label={`${title} photos`} className="relative overflow-hidden rounded-2xl bg-ink sm:rounded-3xl">
        <div className="grid h-[300px] grid-cols-2 gap-1 sm:h-[460px] lg:h-[560px]">
          <div className={`relative col-span-2 overflow-hidden ${images.length > 1 ? "sm:col-span-1" : "sm:col-span-2"}`}>
            <button onClick={() => open(0)} className="absolute inset-0 h-full w-full" aria-label="Open photo 1">
              <Image src={images[0]} alt={`${title}, photo 1`} fill priority sizes="(max-width: 640px) 100vw, 60vw" className="object-cover transition duration-500 hover:scale-[1.03]" />
            </button>
          </div>
          {images.length > 1 && <div className="hidden grid-cols-2 grid-rows-2 gap-1 sm:grid">
            {visibleImages.slice(1).map((image, offset) => {
              const index = offset + 1;
              const isLast = index === visibleImages.length - 1;
              const isInstagramThumbnail = image === instagramVideoThumbnailUrl && Boolean(instagramVideoUrl);
              return <div key={`${image}-${index}`} className="relative overflow-hidden">
                <button onClick={() => open(index)} className="absolute inset-0 h-full w-full" aria-label={`Open photo ${index + 1}`}>
                  <Image src={image} alt={isInstagramThumbnail ? `${title} video preview` : `${title}, photo ${index + 1}`} fill sizes="30vw" className="object-cover transition duration-500 hover:scale-[1.04]" />
                </button>
                {isInstagramThumbnail && <a href={instagramVideoUrl} target="_blank" rel="noopener noreferrer" aria-label={`Watch ${title} video on Instagram`} className="group absolute inset-0 z-10 grid place-items-center bg-ink/10 transition-colors hover:bg-ink/25"><span className="grid h-14 w-14 place-items-center rounded-full bg-white text-ink shadow-[0_10px_24px_rgba(0,0,0,0.28)] transition-transform duration-300 group-hover:scale-110"><Play className="ml-0.5 h-6 w-6 fill-current" aria-hidden /></span><span className="sr-only">Watch on Instagram</span></a>}
                {!isInstagramThumbnail && isLast && images.length > visibleImages.length && <span className="absolute inset-0 grid place-items-center bg-ink/55 text-sm font-semibold text-parchment"><Images className="mr-2 h-5 w-5" /> View all {images.length} photos</span>}
              </div>;
            })}
          </div>}
        </div>
        <button onClick={() => open(0)} className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-lg bg-surface/95 px-3 py-2 text-sm font-semibold text-ink shadow-lg backdrop-blur sm:hidden"><Images className="h-4 w-4" /> {images.length} photos</button>
      </section>

      {active !== null && <div role="dialog" aria-modal="true" aria-label={`${title} photo viewer`} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 sm:p-8">
        <button type="button" onClick={close} className="absolute inset-0 cursor-default" aria-label="Close photo viewer" />
        <div className="absolute left-4 top-4 z-20 text-sm font-semibold text-white sm:left-8 sm:top-8">{active + 1} / {images.length}</div>
        <button type="button" onClick={close} className="absolute right-4 top-4 z-20 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:right-8 sm:top-8" aria-label="Close photo viewer"><X /></button>
        {images.length > 1 && <button type="button" onClick={() => setActive((active - 1 + images.length) % images.length)} className="absolute left-3 z-30 grid h-12 w-12 place-items-center rounded-full border border-white/80 bg-white text-ink shadow-[0_8px_24px_rgba(0,0,0,0.32)] transition-all hover:scale-105 hover:border-gold hover:bg-gold sm:left-8" aria-label="Previous photo"><ChevronLeft className="h-6 w-6" strokeWidth={2.5} /></button>}
        <div className="relative z-10 h-full w-full max-w-6xl"><Image src={images[active]} alt={activeIsInstagramThumbnail ? `${title} video preview` : `${title}, photo ${active + 1}`} fill sizes="100vw" className="object-contain" priority />
          {activeIsInstagramThumbnail && <a href={instagramVideoUrl} target="_blank" rel="noopener noreferrer" aria-label={`Watch ${title} video on Instagram`} className="group absolute inset-0 z-20 grid place-items-center bg-black/10 transition-colors hover:bg-black/25"><span className="grid h-16 w-16 place-items-center rounded-full bg-white text-ink shadow-[0_12px_30px_rgba(0,0,0,0.3)] transition-transform duration-300 group-hover:scale-110 sm:h-20 sm:w-20"><Play className="ml-1 h-7 w-7 fill-current sm:h-8 sm:w-8" aria-hidden /></span><span className="sr-only">Watch on Instagram</span></a>}
        </div>
        {images.length > 1 && <button type="button" onClick={() => setActive((active + 1) % images.length)} className="absolute right-3 z-30 grid h-12 w-12 place-items-center rounded-full border border-white/80 bg-white text-ink shadow-[0_8px_24px_rgba(0,0,0,0.32)] transition-all hover:scale-105 hover:border-gold hover:bg-gold sm:right-8" aria-label="Next photo"><ChevronRight className="h-6 w-6" strokeWidth={2.5} /></button>}
      </div>}
    </>
  );
};
