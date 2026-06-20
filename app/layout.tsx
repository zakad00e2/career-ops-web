import type { Metadata } from 'next';
import { Geist_Mono } from 'next/font/google';
import localFont from 'next/font/local';
import { TooltipProvider } from '@/components/ui/tooltip';
import './globals.css';
import { cn } from "@/lib/utils";

const thmanyah = localFont({
  variable: '--font-sans',
  src: [
    { path: './fonts/thmanyahsans-Light.woff2', weight: '300', style: 'normal' },
    { path: './fonts/thmanyahsans-Regular.woff2', weight: '400', style: 'normal' },
    { path: './fonts/thmanyahsans-Medium.woff2', weight: '500', style: 'normal' },
  ],
  display: 'swap',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
});

export const metadata: Metadata = {
  title: 'Career-Ops',
  description: 'مسار البحث عن وظيفة بالذكاء الاصطناعي',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={cn("font-sans", thmanyah.variable)} data-scroll-behavior="smooth">
      <body className={`${thmanyah.variable} ${geistMono.variable} font-sans`}>
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
