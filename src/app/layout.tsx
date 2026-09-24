import type { Metadata } from 'next';
import NavigationHeader from '@/app/_components/NavigationHeader';
import Footer from '@/app/_components/Footer';
import { AuthProvider, AuthGuard } from '../context/AuthContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'TutorHQ',
  description: 'Academic Management Portal for tracking students, daily tuition logs, exams, and payment receipts.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50/50 flex flex-col font-sans text-slate-800" id="main-applet-root" suppressHydrationWarning>
        <AuthProvider>
          <NavigationHeader />
          <main className="flex-grow max-w-7xl w-full mx-auto px-2 sm:px-6 lg:px-8 py-2.5 sm:py-6 flex flex-col min-h-0 relative">
            <AuthGuard>
              {children}
            </AuthGuard>
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
