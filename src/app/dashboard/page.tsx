"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/components/context/UserContext";
import { useRouter } from "next/navigation";
import ViewAllExpensesModal from "./ViewAllExpensesModal"; // ⬅︎ import
import {
  LogOut,
  Plus,
  Eye,
  Trash2,
  DollarSign,
  TrendingUp,
  PiggyBank,
  CreditCard,
  Bell,
  Calendar,
  Target,
  Wallet,
  BarChart3,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

/* ---------- interfaces (unchanged) ---------- */
interface Expense {
  id: string;
  email: string;
  reason: string;
  category: string;
  description: string;
  amount: number;
  createdAt: string;
  cycle: boolean;
}
interface Notification {
  id: string;
  email: string;
  message: string;
  createdAt: string;
}
interface User {
  name: string;
  email: string;
  income: string;
  totalSavings: number;
  totalInvestment: number;
  monthSavings: number;
  monthInvestment: number;
  monthExpensesNecessity: number;
  monthExpensesDiscretionary: number;
}

export default function Dashboard() {
  const router = useRouter();
  const {
    username,
    userincome,
    email,
    isHydrated,
    setUserincome,
    clearUser,
  } = useUser();

  const [user, setUser] = useState<User | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [payAmount, setPayAmount] = useState("");
  const [showAll, setShowAll] = useState(false); // ⬅︎ modal toggle

  /* ---------- auth guard ---------- */
  useEffect(() => {
    if (isHydrated && !email) router.push("/login");
  }, [isHydrated, email, router]);

  /* ---------- fetch userData ---------- */
  useEffect(() => {
    if (!isHydrated || !email) return;
    fetch("/api/userData", {
      method: "POST",
      body: JSON.stringify({ email }),
    })
      .then((r) => r.json())
      .then((data) => {
        setUser(data.user);
        setExpenses(Array.isArray(data.expenses) ? data.expenses : []);
        setNotifications(
          Array.isArray(data.notifications) ? data.notifications : []
        );
      });
  }, [isHydrated, email]);

  /* ---------- helpers ---------- */
  const logout = () => {
    clearUser();
    router.push("/login");
  };

  const handleDelete = async (id: string, type: "expense" | "notification") => {
    const endpoint =
      type === "expense" ? "/api/deleteExpense" : "/api/deleteNotification";
    await fetch(endpoint, {
      method: "POST",
      body: JSON.stringify({ id, email }),
    });
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    window.location.reload();
  };

  const handlePayday = async () => {
    if (!payAmount || Number(payAmount) <= 0) return alert("Invalid amount");

    const res = await fetch("/api/payDay", {
      method: "POST",
      body: JSON.stringify({ email, newIncome: Number(payAmount) }),
    });
    const data = await res.json();
    if (!res.ok || data.error) return alert(data.error || "Payday failed");

    setUserincome(data.income);
    setPayAmount("");
    window.location.reload();
  };

  /* ---------- guards ---------- */
  if (!isHydrated)
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-lg font-medium text-gray-700">Loading…</div>
        </div>
      </div>
    );
  if (!email) return null;

  /* ---------- max‑limit math ---------- */
  const income = Number(userincome);
  const slab =
    income <= 20000
      ? [65, 5, 15, 15]
      : income <= 50000
      ? [55, 10, 15, 20]
      : income <= 100000
      ? [45, 10, 15, 30]
      : income <= 200000
      ? [40, 10, 10, 40]
      : [35, 10, 10, 45];
  const [nec, dis, sav, inv] = slab.map((p) => Math.round((p / 100) * income));

  const currentMonthExpenses = expenses.filter((e) => e.cycle);

  /* ---------- render ---------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* modal */}
      {showAll && (
        <ViewAllExpensesModal
          expenses={expenses}
          onClose={() => setShowAll(false)}
        />
      )}

      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-500">
                  Welcome back, {username}!
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Income Card */}
        <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium opacity-90">Monthly Income</h2>
              <p className="text-3xl font-bold">₹{income.toLocaleString()}</p>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-full">
              <Wallet className="w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Budget Limits */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-blue-600" />
            Monthly Budget Limits
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-red-50 p-4 rounded-xl border border-red-200">
              <div className="flex items-center justify-between mb-2">
                <CreditCard className="w-5 h-5 text-red-600" />
                <span className="text-xs text-red-600 font-medium">
                  NECESSITY
                </span>
              </div>
              <p className="text-xl font-bold text-red-700">
                ₹{nec.toLocaleString()}
              </p>
            </div>
            <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
              <div className="flex items-center justify-between mb-2">
                <CreditCard className="w-5 h-5 text-orange-600" />
                <span className="text-xs text-orange-600 font-medium">
                  DISCRETIONARY
                </span>
              </div>
              <p className="text-xl font-bold text-orange-700">
                ₹{dis.toLocaleString()}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-xl border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <PiggyBank className="w-5 h-5 text-green-600" />
                <span className="text-xs text-green-600 font-medium">
                  SAVINGS
                </span>
              </div>
              <p className="text-xl font-bold text-green-700">
                ₹{sav.toLocaleString()}
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span className="text-xs text-blue-600 font-medium">
                  INVESTMENTS
                </span>
              </div>
              <p className="text-xl font-bold text-blue-700">
                ₹{inv.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Financial Overview */}
        {user && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">
                  Total Savings
                </h3>
                <PiggyBank className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                ₹{user.totalSavings.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Monthly: ₹{user.monthSavings.toLocaleString()}
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">
                  Total Investments
                </h3>
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                ₹{user.totalInvestment.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Monthly: ₹{user.monthInvestment.toLocaleString()}
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">
                  Monthly Expenses
                </h3>
                <CreditCard className="w-5 h-5 text-red-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                ₹
                {(
                  user.monthExpensesNecessity + user.monthExpensesDiscretionary
                ).toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Necessity: ₹{user.monthExpensesNecessity.toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {/* Expenses Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-600" />
              This Month&apos;s Expenses
            </h3>
            <button
              onClick={() => setShowAll(true)}
              className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors duration-200"
            >
              <Eye className="w-4 h-4" />
              <span>View All</span>
            </button>
          </div>

          <div className="space-y-4">
            {currentMonthExpenses.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No expenses recorded this month</p>
              </div>
            ) : (
              currentMonthExpenses.map((e) => (
                <div
                  key={e.id}
                  className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {e.reason}
                        </h4>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            e.category === "necessity"
                              ? "bg-red-100 text-red-800"
                              : "bg-orange-100 text-orange-800"
                          }`}
                        >
                          {e.category}
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900 mb-2">
                        ₹{e.amount.toLocaleString()}
                      </p>
                      <p className="text-gray-600 mb-2">{e.description}</p>
                      <p className="text-sm text-gray-500">{e.createdAt}</p>
                    </div>
                    <button
                      className="flex items-center space-x-1 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-lg transition-colors duration-200"
                      onClick={() => handleDelete(e.id, "expense")}
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <Bell className="w-5 h-5 mr-2 text-blue-600" />
            Notifications
          </h3>

          <div className="space-y-4">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No new notifications</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <AlertCircle className="w-5 h-5 text-blue-600" />
                        <p className="text-gray-900">{n.message}</p>
                      </div>
                      <p className="text-sm text-gray-500">{n.createdAt}</p>
                    </div>
                    <button
                      className="flex items-center space-x-1 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-lg transition-colors duration-200"
                      onClick={() => handleDelete(n.id, "notification")}
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Action Buttons and Payday */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Add Expense Button */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h3>
            <button
              onClick={() => router.push("/addExpense")}
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5" />
              <span>Add New Expense</span>
            </button>
          </div>

          {/* Payday Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-green-600" />
              Payday
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount Received
                </label>
                <input
                  type="number"
                  min="1"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  placeholder="Enter amount in ₹"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <button
                onClick={handlePayday}
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:-translate-y-0.5"
              >
                <CheckCircle className="w-5 h-5" />
                <span>Submit Payday</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
