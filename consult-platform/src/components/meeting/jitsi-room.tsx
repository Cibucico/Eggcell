"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type JitsiApi = { dispose: () => void; addListener: (event: string, fn: () => void) => void };
type JitsiCtor = new (domain: string, options: Record<string, unknown>) => JitsiApi;

declare global {
  interface Window {
    JitsiMeetExternalAPI?: JitsiCtor;
  }
}

/**
 * The video meeting, embedded in the page. Loads Jitsi's meeting script,
 * then opens the room with the token the server signed for this person.
 */
export function JitsiRoom({
  scriptUrl,
  domain,
  roomName,
  token,
  displayName,
  subject,
  leaveHref,
}: {
  scriptUrl: string;
  domain: string;
  roomName: string;
  token: string;
  displayName: string;
  subject: string;
  leaveHref: string;
}) {
  const container = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading");

  useEffect(() => {
    let api: JitsiApi | null = null;
    let cancelled = false;

    const start = () => {
      if (cancelled || !container.current || !window.JitsiMeetExternalAPI) return;
      api = new window.JitsiMeetExternalAPI(domain, {
        roomName,
        jwt: token,
        parentNode: container.current,
        width: "100%",
        height: "100%",
        userInfo: { displayName },
        configOverwrite: {
          subject,
          prejoinConfig: { enabled: true },
          disableDeepLinking: true,
          startWithAudioMuted: true,
          enableWelcomePage: false,
          toolbarButtons: [
            "microphone",
            "camera",
            "desktop",
            "chat",
            "raisehand",
            "reactions",
            "participants-pane",
            "tileview",
            "select-background",
            "settings",
            "fullscreen",
            "hangup",
          ],
        },
        interfaceConfigOverwrite: { SHOW_JITSI_WATERMARK: false, MOBILE_APP_PROMO: false },
      });
      api.addListener("readyToClose", () => router.push(leaveHref));
      setState("ready");
    };

    if (window.JitsiMeetExternalAPI) {
      start();
    } else {
      const script = document.createElement("script");
      script.src = scriptUrl;
      script.async = true;
      script.onload = start;
      script.onerror = () => setState("failed");
      document.body.appendChild(script);
    }
    return () => {
      cancelled = true;
      api?.dispose();
    };
  }, [scriptUrl, domain, roomName, token, displayName, subject, leaveHref, router]);

  return (
    <div className="relative h-[78vh] min-h-[28rem] overflow-hidden rounded-brand border border-line bg-deep">
      {state !== "ready" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center text-deep-fg">
          {state === "loading" ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-accent" aria-hidden />
              <p>Opening the meeting room…</p>
            </>
          ) : (
            <p>
              The meeting room could not load. Check your internet connection and refresh the page.
            </p>
          )}
        </div>
      )}
      <div ref={container} className="h-full w-full" />
    </div>
  );
}
