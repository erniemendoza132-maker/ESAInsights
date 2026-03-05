import Link from "next/link";

export default function HomePage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <h1 className="text-4xl font-semibold tracking-tight">
        Turn leads into buyer-ready deals.
      </h1>

      <p className="mt-4 text-lg text-zinc-600 max-w-2xl">
        Import leads, run deal math, generate a clean deal sheet,
        and text it to investors — all in one workflow.
      </p>

      <div className="mt-6 flex gap-4">
        <Link
          href="/pricing"
          className="rounded-xl bg-zinc-900 px-5 py-3 text-sm font-medium text-white hover:bg-zinc-800"
        >
          View Pricing
        </Link>
        <a
          href="#"
          className="rounded-xl border px-5 py-3 text-sm font-medium hover:bg-zinc-50"
        >
          Learn More
        </a>
      </div>
    </section>
  );
}