"use client";

import { useState } from "react";
import Image from "next/image";

export const PropertyGallery = ({ images, title }: { images: string[]; title: string }) => {
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="relative aspect-[16/10] border border-line overflow-hidden">
        <Image src={images[active]} alt={title} fill className="object-cover" priority />
      </div>
      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-4 sm:grid-cols-5 gap-3">
          {images.map((img, i) => (
            <button
              key={img + i}
              onClick={() => setActive(i)}
              className={`relative aspect-square overflow-hidden border ${
                active === i ? "border-clay" : "border-line"
              }`}
            >
              <Image src={img} alt={`${title} ${i + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
