"use client";

import { useEffect, useState } from "react";
import Welcome from "@/components/Welcome";
import Home from "@/components/Home";
import { clearPending, getPending, getProfile, resetDevice, type Profile } from "@/lib/storage";

export default function Page() {
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    // Device check: has this browser already signed up? (localStorage, no server call)
    /* eslint-disable react-hooks/set-state-in-effect -- reading device storage after mount */
    setProfile(getProfile());
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */

    // Retry a sign-up that could not reach the server last time.
    const pending = getPending();
    if (pending) {
      fetch("/api/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(pending),
      })
        .then((r) => r.ok && clearPending())
        .catch(() => {});
    }
  }, []);

  if (!ready) return <div className="splash" aria-hidden="true" />;

  if (!profile) return <Welcome onDone={setProfile} />;

  return (
    <Home
      profile={profile}
      onReset={() => {
        resetDevice();
        setProfile(null);
      }}
    />
  );
}
