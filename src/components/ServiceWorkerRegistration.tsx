"use client";

import { useEffect } from "react";

/** Registers the offline service worker (public/sw.js). A no-op if the browser lacks support. */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((error) => {
        console.error("Service worker registration failed", error);
      });
    }
  }, []);

  return null;
}
