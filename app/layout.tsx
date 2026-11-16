import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { ThemeProvider } from '@/components/theme-provider';
import { MotionProvider } from '@/components/motion-provider';
import { AppToaster } from '@/components/app-toaster';
import { ConfirmProvider } from '@/components/patterns/confirm-dialog';
import { LanguageProvider } from '@/lib/i18n/language-context';
import { cn } from '@/lib/utils';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'TaskFlow — Collaborative Task Management',
    template: '%s · TaskFlow',
  },
  description:
    'A calm, fast Kanban workspace with real-time team analytics. Plan, track and ship together.',
  applicationName: 'TaskFlow',
  appleWebApp: { title: 'TaskFlow', capable: true, statusBarStyle: 'default' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F9F9FB' },
    { media: '(prefers-color-scheme: dark)', color: '#0E0E12' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={cn(GeistSans.variable, GeistMono.variable)}>
      <body className="font-sans">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <LanguageProvider>
            <MotionProvider>
              <ConfirmProvider>
                <div className="min-h-[100dvh] bg-background">{children}</div>
              </ConfirmProvider>
              <AppToaster />
            </MotionProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
