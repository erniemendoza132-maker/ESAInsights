"use client"

export default function ManageBillingButton() {
  const handleClick = async () => {
    const res = await fetch("/api/stripe/portal", { method: "POST" })
    const data = await res.json()

    if (data?.url) {
      window.location.href = data.url
    } else {
      alert("Could not open billing portal.")
    }
  }

  return (
    <button
      onClick={handleClick}
      className="mt-6 rounded-lg bg-black px-4 py-2 text-white"
    >
      Manage Billing
    </button>
  )
}