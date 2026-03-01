import './globals.css';
import Link from 'next/link';
import { User } from 'lucide-react';
import SidebarNav from '@/components/sidebar-nav';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex bg-slate-50 min-h-screen text-slate-900 font-sans">
        
        {/* 1. SIDEBAR (The Navigation "Nerve Center") */}
        <aside className="w-64 bg-white border-r flex flex-col p-6 sticky top-0 h-screen">
          <div className="flex items-center gap-1 text-5xl font-black text-green-600 mb-10 tracking-tight">
            <img src="/savorLogo.png" alt="Savor" className="w-12 h-12 rounded-lg -my-2" />
            Savor
          </div>
          
          <SidebarNav />

          <div className="py-6 border-t border-b space-y-4">
            <Link href="/user" className="flex items-center gap-3 p-3 hover:bg-green-50 rounded-lg transition-colors font-medium text-slate-700 hover:text-green-700">
              <User className="w-5 h-5" />
              <span>User Profile</span>
            </Link>
          </div>

          <div className="pt-6 border-t text-xs text-slate-400">
            Henhacks 2026
          </div>
        </aside>

        {/* 2. MAIN CONTENT (Where your page.tsx files will load) */}
        <main className="flex-1 p-10 overflow-y-auto">
          {children}
        </main>

      </body>
    </html>
  );
}