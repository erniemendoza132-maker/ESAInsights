import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

const nav = [
  { href: "/app", label: "Dashboard" },
  { href: "/app/leads", label: "Leads" },
  { href: "/app/lists", label: "Lists" },
  { href: "/app/analyzer", label: "Deal Analyzer" },
  { href: "/app/deal-sheets", label: "Deal Sheets" },
  { href: "/app/buyers", label: "Buyers" },
  { href: "/app/sms", label: "SMS" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden w-64 border-r bg-zinc-50 md:block">
          <div className="px-5 py-4 border-b">
            <Link href="/app" className="font-semibold tracking-tight">
              ESA Insights
            </Link>
            <div className="mt-1 text-xs text-zinc-500">
              Wholesale CRM 
            </div>
          </div>

          <nav className="p-3">
            <div className="space-y-1">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-xl px-3 py-2 text-sm text-zinc-700 hover:bg-white hover:text-zinc-900"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>

          <div className="mt-auto p-4 text-xs text-zinc-500">
            © {new Date().getFullYear()} ESA Insights 
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1">
          {/* Top bar */}
          <header className="flex items-center justify-between border-b px-4 py-3 md:px-6">
            <div className="text-sm text-zinc-600">
              Dashboard
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="text-sm text-zinc-600 hover:text-zinc-900 underline"
              >
                Site
              </Link>
              <UserButton afterSignOutUrl="/" />
            </div>
          </header>

          <main className="px-4 py-6 md:px-6">{children}</main>
        </div>
      </div>
    </div>
  );
}