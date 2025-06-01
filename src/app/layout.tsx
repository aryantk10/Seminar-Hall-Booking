import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Providers } from '@/components/Providers';
import EnvironmentIndicator from '@/components/shared/EnvironmentIndicator';

export const metadata: Metadata = {
  title: 'Hall Hub - Seminar Hall Booking',
  description: 'Book seminar halls efficiently with Hall Hub.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}>
        <Providers>
          {children}
          <Toaster />
          <EnvironmentIndicator />
        </Providers>
      </body>
    </html>
  );
}
