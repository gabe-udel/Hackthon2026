import './globals.css';
import Link from 'next/link';
import { User, Leaf } from 'lucide-react';

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
          <div className="text-2xl font-extrabold text-green-600 mb-10 tracking-tight">
            Savor
          </div>
          
          <nav className="flex flex-col space-y-2 flex-1">
            <Link href="/" className="p-3 hover:bg-green-50 rounded-lg transition-colors font-medium">
              Dashboard
            </Link>
            <Link href="/inventory" className="p-3 hover:bg-green-50 rounded-lg transition-colors font-medium">
              My Pantry
            </Link>
            <Link href="/recipes" className="p-3 hover:bg-green-50 rounded-lg transition-colors font-medium">
              AI Recipes
            </Link>
            <Link href="/sustainability" className="p-3 hover:bg-green-50 rounded-lg transition-colors font-medium flex items-center gap-2">
              <Leaf className="w-4 h-4 text-green-500" />
              Sustainability
            </Link>
          </nav>

          <div className="py-6 border-t border-b space-y-4">
            <Link href="/user" className="flex items-center gap-3 p-3 hover:bg-green-50 rounded-lg transition-colors font-medium text-slate-700 hover:text-green-700">
              <User className="w-5 h-5" />
              <span>User Profile</span>
            </Link>
          </div>

          <div className="pt-6 border-t text-xs text-slate-400">
            Hackathon 2026 • Abby & Team
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