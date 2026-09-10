"use client";

import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";

export function HomeHighlights({ amenities }: { amenities: string[] }) {
  if (!amenities.length) return null;

  return (
    <section className="mt-12 border-t border-line pt-9 sm:mt-14 sm:pt-11">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-clay">
            <Sparkles className="h-3.5 w-3.5" /> Included features
          </p>
          <h2 className="mt-3 font-display text-3xl leading-tight sm:text-4xl">Home highlights</h2>
        </div>
        <p className="text-sm text-ink/55">{amenities.length} selected {amenities.length === 1 ? "feature" : "features"}</p>
      </div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.05 } },
        }}
        className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2"
      >
        {amenities.map((amenity) => (
          <motion.div
            key={amenity}
            variants={{
              hidden: { opacity: 0, y: 12 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="group flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/60 hover:shadow-md sm:px-5"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gold/15 text-gold-dark transition-colors group-hover:bg-gold group-hover:text-ink">
              <Check className="h-4 w-4 stroke-[2.5]" />
            </span>
            <span className="text-sm font-semibold tracking-tight text-ink sm:text-[15px]">{amenity}</span>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
