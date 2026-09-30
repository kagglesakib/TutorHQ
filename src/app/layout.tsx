import type { Metadata } from 'next';
import NavigationHeader from '@/app/_components/NavigationHeader';
import Footer from '@/app/_components/Footer';
import { AuthProvider, AuthGuard } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
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
    <html lang="en" suppressHydrationWarning className="dark">
      <body className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200" id="main-applet-root" suppressHydrationWarning>
        <ThemeProvider>
          <AuthProvider>
            <NavigationHeader />
            <main className="flex-grow w-full flex flex-col relative">
              <AuthGuard>
                {children}
              </AuthGuard>
            </main>
            <Footer />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
