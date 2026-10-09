import { Lock } from "lucide-react";

/** Fail closed until a reviewed server-side authorization mechanism exists. */
export function AdminGate() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-admin-bg px-5 font-sans text-admin-foreground">
      <div className="w-full max-w-sm rounded-lg border-2 border-admin-border bg-admin-surface p-8">
        <h1 className="flex items-center gap-2 font-display text-xl font-bold">
          <Lock className="size-5" /> Akses admin ditutup sementara
        </h1>
        <p className="mt-4 text-sm text-admin-foreground/70">
          Hubungi pengelola RapiKasir untuk kebutuhan administrasi.
        </p>
        <a href="/" className="mt-5 inline-block text-sm underline">Kembali ke RapiKasir</a>
      </div>
    </div>
  );
}
