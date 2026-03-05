"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function BuyersToolbar({
  q,
  tag,
  tags,
  count,
}: {
  q: string;
  tag: string;
  tags: string[];
  count: number;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(q);
  const [selectedTag, setSelectedTag] = useState(tag);

  function apply() {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (selectedTag.trim()) params.set("tag", selectedTag.trim());
    router.push(`/app/buyers?${params.toString()}`);
  }

  function clear() {
    setQuery("");
    setSelectedTag("");
    router.push("/app/buyers");
  }

  return (
    <div className="rounded-2xl border p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-zinc-700">
          Showing <span className="font-medium">{count}</span> buyer(s)
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <input
            className="w-full rounded-xl border px-3 py-2 text-sm md:w-72"
            placeholder="Search name / phone / email / market..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            className="w-full rounded-xl border bg-white px-3 py-2 text-sm md:w-56"
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
          >
            <option value="">All tags</option>
            {tags.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <button
            onClick={apply}
            className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
          >
            Apply
          </button>
          <button
            onClick={clear}
            className="rounded-xl border px-4 py-2 text-sm hover:bg-zinc-50"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}