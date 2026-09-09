"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Images, X } from "lucide-react";

type Props = { images: string[]; title: string };

export const PropertyGallery = ({ images, title }: Props) => {
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

  return (
    <>
      <section aria-label={`${title} photos`} className="relative overflow-hidden rounded-2xl bg-ink sm:rounded-3xl">
        <div className="grid h-[300px] grid-cols-2 gap-1 sm:h-[460px] lg:h-[560px]">
          <button onClick={() => open(0)} className={`relative col-span-2 overflow-hidden ${images.length > 1 ? "sm:col-span-1" : "sm:col-span-2"}`} aria-label="Open photo 1">
            <Image src={images[0]} alt={title} fill priority sizes="(max-width: 640px) 100vw, 60vw" className="object-cover transition duration-500 hover:scale-[1.03]" />
          </button>
          {images.length > 1 && <div className="hidden grid-cols-2 grid-rows-2 gap-1 sm:grid">
            {visibleImages.slice(1).map((image, offset) => {
              const index = offset + 1;
              const isLast = index === visibleImages.length - 1;
              return <button key={`${image}-${index}`} onClick={() => open(index)} className="relative overflow-hidden" aria-label={`Open photo ${index + 1}`}>
                <Image src={image} alt={`${title}, photo ${index + 1}`} fill sizes="30vw" className="object-cover transition duration-500 hover:scale-[1.04]" />
                {isLast && images.length > visibleImages.length && <span className="absolute inset-0 grid place-items-center bg-ink/55 text-sm font-semibold text-parchment"><Images className="mr-2 h-5 w-5" /> View all {images.length} photos</span>}
              </button>;
            })}
          </div>}
        </div>
        <button onClick={() => open(0)} className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-lg bg-surface/95 px-3 py-2 text-sm font-semibold text-ink shadow-lg backdrop-blur sm:hidden"><Images className="h-4 w-4" /> {images.length} photos</button>
      </section>

      {active !== null && <div role="dialog" aria-modal="true" aria-label={`${title} photo viewer`} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 sm:p-8">
        <div className="absolute left-4 top-4 text-sm font-semibold text-white sm:left-8 sm:top-8">{active + 1} / {images.length}</div>
        <button onClick={() => setActive(null)} className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:right-8 sm:top-8" aria-label="Close photo viewer"><X /></button>
        {images.length > 1 && <button onClick={() => setActive((active - 1 + images.length) % images.length)} className="absolute left-3 z-10 grid h-12 w-12 place-items-center rounded-full bg-white/15 text-white hover:bg-white/25 sm:left-8" aria-label="Previous photo"><ChevronLeft /></button>}
        <div className="relative h-full w-full max-w-6xl"><Image src={images[active]} alt={`${title}, photo ${active + 1}`} fill sizes="100vw" className="object-contain" priority /></div>
        {images.length > 1 && <button onClick={() => setActive((active + 1) % images.length)} className="absolute right-3 z-10 grid h-12 w-12 place-items-center rounded-full bg-white/15 text-white hover:bg-white/25 sm:right-8" aria-label="Next photo"><ChevronRight /></button>}
      </div>}
    </>
  );
};
