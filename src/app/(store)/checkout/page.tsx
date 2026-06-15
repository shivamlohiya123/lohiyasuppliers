"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

export default function CheckoutPage() {
  const { data: session } = useSession();
  const { items, subtotal, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [form, setForm] = useState({
    fullName: session?.user?.name || "",
    email: session?.user?.email || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    paymentMethod: "UPI",
    notes: "",
  });

  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [settings, setSettings] = useState({ shippingRate: 99, freeShippingThreshold: 2000, taxRate: 0.18 });

  useEffect(() => {
    fetch("/api/settings/public").then((r) => r.json()).then(setSettings).catch(() => {});
  }, []);

  const shipping = subtotal >= settings.freeShippingThreshold ? 0 : settings.shippingRate;
  const discountedSubtotal = Math.max(0, subtotal - discount);
  const tax = discountedSubtotal * settings.taxRate;
  const total = discountedSubtotal + shipping + tax;
  const taxPercent = Math.round(settings.taxRate * 100);

  async function applyCoupon() {
    setCouponError("");
    const res = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: couponCode, subtotal }),
    });
    const data = await res.json();
    if (res.ok) setDiscount(data.discount);
    else { setDiscount(0); setCouponError(data.error); }
  }

  useEffect(() => {
    if (items.length === 0 && !orderPlaced) {
      router.push("/cart");
    }
  }, [items.length, orderPlaced, router]);

  if (items.length === 0 && !orderPlaced) {
    return null;
  }

  if (orderPlaced) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
        <p className="text-gray-600 mb-2">Order Number: <strong>{orderNumber}</strong></p>
        <p className="text-gray-500 text-sm mb-6">We&apos;ll send you a confirmation email shortly.</p>
        <Link href="/products" className="px-6 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700">
          Continue Shopping
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity, price: i.price })),
          subtotal: discountedSubtotal,
          tax,
          shipping,
          discount,
          total,
          shippingAddress: form,
          paymentMethod: form.paymentMethod,
          notes: form.notes,
          guestName: form.fullName,
          guestEmail: form.email,
          guestPhone: form.phone,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setOrderNumber(data.orderNumber);
        clearCart();
        setOrderPlaced(true);
      }
    } catch {
      alert("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border p-6">
            <h2 className="font-bold text-lg mb-4">Shipping Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { name: "fullName", label: "Full Name", required: true },
                { name: "email", label: "Email", type: "email", required: true },
                { name: "phone", label: "Phone", required: true },
                { name: "address", label: "Address", required: true, full: true },
                { name: "city", label: "City", required: true },
                { name: "state", label: "State", required: true },
                { name: "pincode", label: "Pincode", required: true },
              ].map((field) => (
                <div key={field.name} className={field.full ? "sm:col-span-2" : ""}>
                  <label className="text-sm font-medium text-gray-700 block mb-1">{field.label}</label>
                  <input
                    type={field.type || "text"}
                    required={field.required}
                    value={form[field.name as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border p-6">
            <h2 className="font-bold text-lg mb-4">Payment Method</h2>
            <div className="space-y-2">
              {["UPI", "Bank Transfer", "COD", "Credit/Debit Card"].map((method) => (
                <label key={method} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value={method}
                    checked={form.paymentMethod === method}
                    onChange={() => setForm({ ...form, paymentMethod: method })}
                    className="text-brand-600"
                  />
                  <span className="text-sm font-medium">{method}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6 h-fit sticky top-24">
          <h2 className="font-bold text-lg mb-4">Order Summary</h2>
          {items.map((item) => (
            <div key={item.productId} className="flex justify-between text-sm py-2 border-b border-gray-50">
              <span className="text-gray-600">{item.name} × {item.quantity}</span>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
          <div className="mt-4 flex gap-2">
            <input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="Coupon code"
              className="flex-1 px-3 py-2 border rounded-lg text-sm" />
            <button type="button" onClick={applyCoupon} className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50">Apply</button>
          </div>
          {couponError && <p className="text-xs text-red-500 mt-1">{couponError}</p>}
          {discount > 0 && <p className="text-xs text-green-600 mt-1">Coupon applied: -{formatPrice(discount)}</p>}
          <div className="space-y-2 mt-4 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
            {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatPrice(discount)}</span></div>}
            <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span>{shipping === 0 ? "FREE" : formatPrice(shipping)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">GST ({taxPercent}%)</span><span>{formatPrice(tax)}</span></div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t"><span>Total</span><span>{formatPrice(total)}</span></div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 disabled:opacity-50"
          >
            {loading ? "Placing Order..." : "Place Order"}
          </button>
        </div>
      </form>
    </div>
  );
}
