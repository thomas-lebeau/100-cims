"use client";

import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";

function connect() {
  signIn("strava", { callbackUrl: "/settings/strava" });
}

export default function LinkStrava() {
  return (
    <div className="space-y-6">
      <Button onClick={connect} variant="default">
        Link Strava
      </Button>
    </div>
  );
}
