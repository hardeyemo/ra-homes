"use client";

import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/constants";

export const FloatingWhatsApp = () => {
  return (
    <motion.a
      href={whatsappLink("Hello RA Homes & Properties, I'd like to know more about your listings.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with RA Homes on WhatsApp"
      initial={{ opacity: 0, scale: 0.7, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.4, ease: "easeOut" }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-[#25D366] text-white h-14 px-5 rounded-full shadow-lg shadow-black/20"
    >
      <MessageCircle className="w-6 h-6 shrink-0" />
      <span className="hidden sm:inline text-sm font-medium whitespace-nowrap">Chat on WhatsApp</span>
    </motion.a>
  );
};
