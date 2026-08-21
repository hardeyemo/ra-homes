"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSavedPropertiesStore } from "@/store/savedPropertiesStore";

// Keeps the small client-side UI store aligned with the signed-in account.
// Saved records themselves live in MongoDB and are never shared between users.
export function SavedPropertiesSync() {
  const { data: session, status } = useSession();
  const setSavedIds = useSavedPropertiesStore((state) => state.setSavedIds);
  const clear = useSavedPropertiesStore((state) => state.clear);

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user?.id) {
      clear();
      return;
    }

    let active = true;
    clear();

    fetch("/api/saved-properties")
      .then((response) => (response.ok ? response.json() : { propertyIds: [] }))
      .then((data) => {
        if (active) setSavedIds(data.propertyIds ?? []);
      })
      .catch(() => {
        if (active) setSavedIds([]);
      });

    return () => {
      active = false;
    };
  }, [session?.user?.id, status, clear, setSavedIds]);

  return null;
}
