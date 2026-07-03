import { Construction } from "lucide-react";
import { Button } from "../ui/button";
import { Link } from "react-router";

export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-5 text-center">
      <span className="flex size-16 items-center justify-center rounded-md border-2 border-border bg-block-amber shadow-brutal">
        <Construction className="size-7" />
      </span>
      <div className="space-y-1">
        <h2 className="font-display">{title}</h2>
        <p className="text-muted-foreground">
          Halaman ini sedang kami siapkan. Segera hadir di RapiKasir.
        </p>
      </div>
      <Button asChild className="press-scale border-2 border-border shadow-brutal-sm">
        <Link to="/">Kembali ke Dashboard</Link>
      </Button>
    </div>
  );
}
