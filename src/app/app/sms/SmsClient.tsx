"use client";

import { useMemo, useState } from "react";

type Buyer = {
  id: string;
  name: string;
  phone?: string | null;
  tags?: string[]; // ✅ strings
};

type HistoryItem = {
  id: string;
  toPhone: string;
  body: string;
  status?: string | null;
  createdAt: string; // ISO string from server
};

type Props = {
  buyers?: Buyer[];
  tags?: string[];
  history?: HistoryItem[];
};

export function SmsClient({ buyers = [], tags = [], history = [] }: Props) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [selectedTag, setSelectedTag] = useState("");

  const filteredBuyers = useMemo(() => {
    if (!selectedTag) return buyers;
    return buyers.filter((b) => (b.tags ?? []).includes(selectedTag)); // ✅ FIX
  }, [buyers, selectedTag]);

  async function sendSms() {
    if (!message.trim()) {
      alert("Message cannot be empty");
      return;
    }

    try {
      setSending(true);

      const res = await fetch("/api/sms/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: message.trim(),
          tag: selectedTag || null,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to send SMS");

      alert(`Queued ${data?.count ?? 0} message(s) ✅`);
      setMessage("");
      window.location.reload();
    } catch (err: any) {
      alert(err?.message ?? "SMS failed");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Composer */}
      <div className="rounded-2xl border p-6 bg-white space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Send SMS Blast</h2>
          <p className="text-sm text-zinc-500">
            Send a message to buyers (optionally filtered by tag).
          </p>
        </div>

        <div className="grid gap-3">
          <div className="space-y-1">
            <label className="text-sm font-medium">Tag filter</label>
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="w-full rounded-md border p-2 text-sm"
            >
              <option value="">All buyers</option>
              {tags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>

            <div className="text-xs text-zinc-500">
              Targeting{" "}
              <span className="font-medium">{filteredBuyers.length}</span>{" "}
              buyer(s)
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Hey! I have an off-market deal…"
              className="w-full rounded-md border p-3 text-sm"
            />
          </div>

          <button
            onClick={sendSms}
            disabled={sending}
            className="w-full rounded-md bg-black text-white py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            {sending ? "Sending..." : "Send SMS"}
          </button>
        </div>
      </div>

      {/* Target preview */}
      <div className="rounded-2xl border bg-white overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <div className="text-sm font-medium">Target preview</div>
          <div className="text-xs text-zinc-500">
            {filteredBuyers.length} buyer(s)
          </div>
        </div>

        {filteredBuyers.length === 0 ? (
          <div className="p-8 text-sm text-zinc-500">
            No buyers match this filter.
          </div>
        ) : (
          <div className="divide-y">
            {filteredBuyers.slice(0, 25).map((b) => (
              <div
                key={b.id}
                className="p-4 flex items-center justify-between gap-4"
              >
                <div>
                  <div className="text-sm font-medium">{b.name}</div>
                  <div className="text-xs text-zinc-500">
                    {b.phone ?? "No phone"}
                  </div>
                </div>

                <div className="text-xs text-zinc-500">
                  {(b.tags ?? []).slice(0, 4).join(", ") || "No tags"}
                </div>
              </div>
            ))}

            {filteredBuyers.length > 25 ? (
              <div className="p-3 text-xs text-zinc-500">
                Showing first 25 of {filteredBuyers.length}
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* History */}
      <div className="rounded-2xl border bg-white overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <div className="text-sm font-medium">Recent sends</div>
          <div className="text-xs text-zinc-500">{history.length} item(s)</div>
        </div>

        {history.length === 0 ? (
          <div className="p-8 text-sm text-zinc-500">No SMS history yet.</div>
        ) : (
          <div className="divide-y">
            {history.map((h) => (
              <div key={h.id} className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="text-sm font-medium">{h.toPhone}</div>
                  <div className="text-xs text-zinc-500">
                    {new Date(h.createdAt).toLocaleString()}
                  </div>
                </div>

                <div className="mt-1 text-sm text-zinc-700 whitespace-pre-wrap">
                  {h.body}
                </div>

                {h.status ? (
                  <div className="mt-1 text-xs text-zinc-500">
                    Status: {h.status}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}