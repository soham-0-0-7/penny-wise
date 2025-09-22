"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/components/context/UserContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

const CATEGORY_OPTIONS = [
  "expense (necessity)",
  "expense (discretionary)",
  "savings",
  "investment",
] as const;

export default function AddExpensePage() {
  const { email, isHydrated } = useUser();
  const router = useRouter();

  const [form, setForm] = useState({
    reason: "",
    category: "" as (typeof CATEGORY_OPTIONS)[number] | "",
    description: "",
    amount: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🔒 Redirect to login if not authenticated
  useEffect(() => {
    if (isHydrated && !email) router.push("/login");
  }, [isHydrated, email, router]);

  if (!isHydrated) return null;
  if (!email) return null; // waiting for redirect

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { reason, category, description, amount } = form;

    if (!reason || !category || !description || !amount) {
      setError("All fields are required");
      setIsSubmitting(false);
      return;
    }
    if (Number(amount) < 1) {
      setError("Amount must be at least 1");
      setIsSubmitting(false);
      return;
    }
    if (!email) {
      setError("User email missing in context");
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/addExpense", {
        method: "POST",
        body: JSON.stringify({
          reason,
          category,
          description,
          amount: Number(amount),
          email,
        }),
      });

      if (!res.ok) {
        const txt = await res.text();
        setError(txt || "Server error");
        setIsSubmitting(false);
        return;
      }

      const data: { error?: string; success?: true } = await res.json();
      if (data.error) {
        setError(data.error);
        setIsSubmitting(false);
        return;
      }

      setSuccess("Entry added successfully!");
      setError("");
      setForm({ reason: "", category: "", description: "", amount: "" });
    } catch (err) {
      setError("Network error. Please try again. - " + err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "expense (necessity)":
        return "🏠";
      case "expense (discretionary)":
        return "🛍️";
      case "savings":
        return "💰";
      case "investment":
        return "📈";
      default:
        return "📊";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "expense (necessity)":
        return "from-red-500 to-red-600";
      case "expense (discretionary)":
        return "from-orange-500 to-orange-600";
      case "savings":
        return "from-green-500 to-green-600";
      case "investment":
        return "from-blue-500 to-blue-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Add New Entry
          </h1>
          <p className="text-gray-600">
            Track your expenses, savings, and investments
          </p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-red bg-opacity-20 rounded-lg p-3 mr-4">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    Financial Entry
                  </h2>
                  <p className="text-blue-100 text-sm">
                    Add your financial transaction
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard"
                className="bg-red bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
              >
                ← Dashboard
              </Link>
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-8">
            <div className="space-y-6">
              {/* Reason Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason / Title
                </label>
                <input
                  name="reason"
                  type="text"
                  placeholder="e.g., Monthly groceries, Emergency fund, Stock investment"
                  value={form.reason}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Category Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <div className="relative">
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white"
                  >
                    <option value="">Select a category</option>
                    {CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {getCategoryIcon(opt)} {opt}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
                {form.category && (
                  <div className="mt-2">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white bg-gradient-to-r ${getCategoryColor(
                        form.category
                      )}`}
                    >
                      {getCategoryIcon(form.category)} {form.category}
                    </span>
                  </div>
                )}
              </div>

              {/* Description Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  placeholder="Add more details about this transaction..."
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                />
              </div>

              {/* Amount Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-lg">₹</span>
                  </div>
                  <input
                    name="amount"
                    type="number"
                    min={1}
                    step="0.01"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={handleChange}
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
                <svg
                  className="w-5 h-5 text-red-400 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {success && (
              <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
                <svg
                  className="w-5 h-5 text-green-400 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-green-800">{success}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="mt-8 flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Adding...
                  </div>
                ) : (
                  "Add Entry"
                )}
              </button>
              <Link
                href="/dashboard"
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>

        {/* Quick Stats Card */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Tips
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start">
              <div className="bg-blue-100 rounded-lg p-2 mr-3">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Be Specific</p>
                <p className="text-xs text-gray-600">
                  Use clear, descriptive reasons for better tracking
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-green-100 rounded-lg p-2 mr-3">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Track Regularly
                </p>
                <p className="text-xs text-gray-600">
                  Add entries as soon as transactions occur
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
