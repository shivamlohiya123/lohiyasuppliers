"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed");
      } else {
        router.push("/login?registered=1");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-500 mt-1">Sign up — you&apos;ll complete business details next</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border p-8 shadow-sm">
          {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">{error}</div>}
          <div className="space-y-4">
            {[
              { name: "name", label: "Full Name", required: true },
              { name: "email", label: "Email", type: "email", required: true },
              { name: "password", label: "Password", type: "password", required: true },
            ].map((field) => (
              <div key={field.name}>
                <label className="text-sm font-medium text-gray-700 block mb-1">{field.label}</label>
                <input
                  type={field.type || "text"}
                  required={field.required}
                  value={form[field.name as keyof typeof form]}
                  onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            ))}
          </div>
          <button type="submit" disabled={loading}
            className="w-full mt-6 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 disabled:opacity-50">
            {loading ? "Creating Account..." : "Create Account"}
          </button>
          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-brand-600 font-medium hover:underline">Sign In</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
