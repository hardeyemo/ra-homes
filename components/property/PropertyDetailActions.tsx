"use client";

import { Heart, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useSavedPropertiesStore } from "@/store/savedPropertiesStore";

type PropertyDetailActionsProps = {
  propertyId: string;
  propertyTitle: string;
};

export function PropertyDetailActions({ propertyId, propertyTitle }: PropertyDetailActionsProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const isSaved = useSavedPropertiesStore((state) => state.isSaved(propertyId));
  const setSaved = useSavedPropertiesStore((state) => state.setSaved);

  const share = async () => {
    const shareData = { title: propertyTitle, url: window.location.href };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }
      await navigator.clipboard.writeText(shareData.url);
      toast.success("Property link copied.");
    } catch (error) {
      if ((error as DOMException).name !== "AbortError") {
        toast.error("We couldn't share this property. Please try again.");
      }
    }
  };

  const toggleSaved = async () => {
    if (!session?.user?.id) {
      toast.info("Sign in to save properties to your account.");
      router.push("/login");
      return;
    }

    const nextSavedState = !isSaved;
    setSaved(propertyId, nextSavedState);

    try {
      const response = await fetch(
        nextSavedState ? "/api/saved-properties" : `/api/saved-properties?propertyId=${encodeURIComponent(propertyId)}`,
        nextSavedState
          ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ propertyId }) }
          : { method: "DELETE" }
      );
      if (!response.ok) throw new Error("Unable to update saved property");
    } catch {
      setSaved(propertyId, !nextSavedState);
      toast.error("We couldn't update your saved properties. Please try again.");
    }
  };

  return (
    <div className="flex gap-2">
      <button type="button" onClick={() => void share()} className="inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-surface px-3 text-sm font-medium hover:bg-parchment">
        <Share2 className="h-4 w-4" /> <span className="hidden sm:inline">Share</span>
      </button>
      <button type="button" onClick={() => void toggleSaved()} className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-surface hover:bg-parchment" aria-label={isSaved ? "Remove from saved" : "Save property"}>
        <Heart className={`h-4 w-4 ${isSaved ? "fill-clay text-clay" : ""}`} />
      </button>
    </div>
  );
}
