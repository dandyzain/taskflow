import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileQuestion, ArrowLeft, LayoutDashboard } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center pastel-mesh-bg p-4">
      <div className="max-w-md w-full bg-card/80 backdrop-blur-xl border border-border/70 rounded-3xl p-8 text-center shadow-pastel space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-pastel-lavender/50 text-pastel-lavender-text border border-purple-200/50 flex items-center justify-center mx-auto shadow-xs">
          <FileQuestion className="w-8 h-8 text-primary" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold tracking-wider uppercase text-primary/70 bg-primary/10 px-3 py-1 rounded-full">
            Error 404
          </span>
          <h1 className="text-2xl font-bold text-foreground">Halaman Tidak Ditemukan</h1>
          <p className="text-sm text-muted-foreground">
            Board atau halaman yang Anda cari tidak ada atau mungkin sudah dihapus.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="outline" className="rounded-xl border-border/80">
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Beranda
            </Link>
          </Button>
          <Button asChild className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs">
            <Link href="/workspace/ws_demo" className="flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" />
              Buka Workspace
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
