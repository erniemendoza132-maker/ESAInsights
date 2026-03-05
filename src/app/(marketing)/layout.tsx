import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-semibold">
            DealFlow
          </Link>

          <div className="flex items-center gap-3">
            <SignedOut>
              <Link
                href="/sign-in"
                className="rounded-lg border px-3 py-1.5 hover:bg-zinc-50"
              >
                Sign in
              </Link>

              <Link
                href="/sign-up"
                className="rounded-lg bg-zinc-900 px-3 py-1.5 text-white hover:bg-zinc-800"
              >
                Get started
              </Link>
            </SignedOut>

            <SignedIn>
              <Link
                href="/app"
                className="rounded-lg bg-zinc-900 px-3 py-1.5 text-white hover:bg-zinc-800"
              >
                Go to dashboard
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </header>

      <main>{children}</main>
    </>
  );
}
