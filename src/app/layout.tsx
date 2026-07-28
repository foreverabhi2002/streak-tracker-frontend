import { HeaderNav } from "@/components/HeaderNav";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { Metadata } from "next";
import Link from "next/link";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Learn In Public Streak Tracker",
  description: "Track your learning journey and share your progress.",
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ]
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen flex flex-col">
            <header className="border-b border-border bg-background">
              <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="font-bold text-lg text-foreground">
                  🔥 Learn In Public
                </Link>
                <div className="flex items-center gap-4">
                  <HeaderNav />
                  <ThemeToggle />
                </div>
              </div>
            </header>
            <main className="flex-1 max-w-5xl w-full mx-auto p-4">
              {children}
            </main>
          </div>
          <Toaster position="bottom-right" theme="system" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
