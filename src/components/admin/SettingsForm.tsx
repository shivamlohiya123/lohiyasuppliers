"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const SETTING_FIELDS = [
  { key: "site_name", label: "Site Name", type: "text" },
  { key: "site_tagline", label: "Tagline", type: "text" },
  { key: "contact_email", label: "Contact Email", type: "email" },
  { key: "contact_phone", label: "Contact Phone", type: "text" },
  { key: "contact_address", label: "Address", type: "text" },
  { key: "gst_number", label: "GST Number", type: "text" },
  { key: "shipping_flat_rate", label: "Shipping Rate (₹)", type: "number" },
  { key: "free_shipping_threshold", label: "Free Shipping Above (₹)", type: "number" },
  { key: "tax_rate", label: "Tax Rate (%)", type: "number" },
  { key: "currency", label: "Currency", type: "text" },
    { key: "business_hours", label: "Business Hours", type: "text" },
  ];

export function SettingsForm({ settings }: { settings: Record<string, string> }) {
  const router = useRouter();
  const [form, setForm] = useState(settings);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 3000);
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-6 max-w-2xl space-y-4">
      {SETTING_FIELDS.map((field) => (
        <div key={field.key}>
          <label className="text-sm font-medium text-gray-700 block mb-1">{field.label}</label>
          <input
            type={field.type}
            value={form[field.key] || ""}
            onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      ))}
      <div className="flex items-center gap-3 pt-4">
        <button type="submit" disabled={loading}
          className="px-6 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-50">
          {loading ? "Saving..." : "Save Settings"}
        </button>
        {saved && <span className="text-sm text-green-600">✓ Settings saved!</span>}
      </div>
    </form>
  );
}
