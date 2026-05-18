import type { Metadata } from 'next';
import { MedievalSharp } from 'next/font/google';
import './globals.css';

const medieval = MedievalSharp({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: '任务日志 - RPG 待办列表',
  description: '将你的任务变成一场史诗冒险',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`h-full antialiased ${medieval.variable}`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>{children}</body>
    </html>
  );
}
