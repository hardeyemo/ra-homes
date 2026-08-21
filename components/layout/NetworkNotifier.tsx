"use client";

import { useEffect } from "react";
import { Signal, WifiOff } from "lucide-react";
import { toast } from "sonner";

const OFFLINE_TOAST_ID = "ra-network-offline";
const SLOW_TOAST_ID = "ra-network-slow";

type NetworkConnection = EventTarget & {
  effectiveType?: string;
};

// Browser connection events are the reliable way to detect no connection.
// Some browsers also expose effectiveType; when they do, we politely warn
// about 2G-quality connections without treating them as an error.
export const NetworkNotifier = () => {
  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: NetworkConnection }).connection;
    let connectionWasOffline = !navigator.onLine;

    const showSlowConnectionWarning = () => {
      const isSlow = connection?.effectiveType === "slow-2g" || connection?.effectiveType === "2g";
      if (!navigator.onLine || !isSlow) {
        toast.dismiss(SLOW_TOAST_ID);
        return;
      }

      toast.warning("Your connection is slow", {
        id: SLOW_TOAST_ID,
        description: "Some images and updates may take a little longer to load.",
        icon: <Signal className="h-4 w-4" />,
        duration: 6_000,
      });
    };

    const handleOffline = () => {
      connectionWasOffline = true;
      toast.dismiss(SLOW_TOAST_ID);
      toast.error("You are offline", {
        id: OFFLINE_TOAST_ID,
        description: "Check your internet connection. We will let you know when you are back online.",
        icon: <WifiOff className="h-4 w-4" />,
        duration: Infinity,
      });
    };

    const handleOnline = () => {
      toast.dismiss(OFFLINE_TOAST_ID);
      if (connectionWasOffline) {
        toast.success("Connection restored", {
          description: "You are back online.",
          icon: <Signal className="h-4 w-4" />,
        });
      }
      connectionWasOffline = false;
      showSlowConnectionWarning();
    };

    if (!navigator.onLine) handleOffline();
    else showSlowConnectionWarning();

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    connection?.addEventListener("change", showSlowConnectionWarning);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
      connection?.removeEventListener("change", showSlowConnectionWarning);
      toast.dismiss(OFFLINE_TOAST_ID);
      toast.dismiss(SLOW_TOAST_ID);
    };
  }, []);

  return null;
};
