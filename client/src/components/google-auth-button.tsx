import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function GoogleAuthButton() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/auth/google/status", { signal: controller.signal })
      .then((response) => response.ok ? response.json() : { enabled: false })
      .then((data) => setEnabled(data.enabled === true))
      .catch(() => {});
    return () => controller.abort();
  }, []);

  if (!enabled) return null;

  return (
    <div className="mb-6 space-y-4">
      <Button
        type="button"
        variant="outline"
        className="w-full gap-3"
        onClick={() => window.location.assign("/api/auth/google")}
        data-testid="button-google-sign-in"
      >
        <svg aria-hidden="true" viewBox="0 0 48 48" className="h-5 w-5">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z" transform="translate(0 4)" />
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.73 7.18l7.65 5.93c4.47-4.13 7.12-10.2 7.12-17.58Z" transform="translate(0 0)" />
          <path fill="#FBBC05" d="M10.53 28.59a14.4 14.4 0 0 1 0-9.18l-7.98-6.2a23.98 23.98 0 0 0 0 21.58l7.98-6.2Z" transform="translate(0 4)" />
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.91-5.82l-7.65-5.93c-2.13 1.43-4.86 2.28-8.26 2.28-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.2C6.51 42.62 14.62 48 24 48Z" transform="translate(0 0)" />
        </svg>
        Continuer avec Google
      </Button>
      <div className="relative flex items-center">
        <span className="flex-1 border-t" />
        <span className="px-3 text-xs text-muted-foreground">ou avec votre adresse e-mail</span>
        <span className="flex-1 border-t" />
      </div>
    </div>
  );
}
