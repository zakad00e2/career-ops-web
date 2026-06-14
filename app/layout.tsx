import type { Metadata } from 'next';
import { Geist_Mono, Inter } from 'next/font/google';
import { TooltipProvider } from '@/components/ui/tooltip';
import './globals.css';
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
});

export const metadata: Metadata = {
  title: 'Career-Ops',
  description: 'AI-powered job search pipeline',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("dark", "font-sans", inter.variable)} data-scroll-behavior="smooth">
      <body className={`${inter.variable} ${geistMono.variable} font-sans`}>
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
