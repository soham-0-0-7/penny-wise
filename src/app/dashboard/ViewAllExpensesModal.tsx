"use client";

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

interface Props {
  expenses: Expense[];
  onClose: () => void;
}

/**
 * Professional expense modal with enhanced UI
 */
export default function ViewAllExpensesModal({ expenses, onClose }: Props) {
  // Format date for better readability
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Format amount with proper currency formatting
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  // Get category color
  const getCategoryColor = (category: string) => {
    const colors = {
      Food: "bg-orange-100 text-orange-800",
      Transport: "bg-blue-100 text-blue-800",
      Entertainment: "bg-purple-100 text-purple-800",
      Shopping: "bg-pink-100 text-pink-800",
      Bills: "bg-red-100 text-red-800",
      Healthcare: "bg-green-100 text-green-800",
      Education: "bg-indigo-100 text-indigo-800",
      Other: "bg-gray-100 text-gray-800",
    };
    return (
      colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800"
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Enhanced backdrop with blur */}
      <div
        className="absolute inset-0 bg-grey-200 bg-opacity-50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Enhanced modal box */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">All Expenses</h2>
              <p className="text-blue-100 mt-1">
                {expenses.length} expense{expenses.length !== 1 ? "s" : ""}{" "}
                found
              </p>
            </div>
            <button
              onClick={onClose}
              className="bg-red bg-opacity-20 hover:bg-opacity-30 rounded-lg p-2 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {expenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <svg
                className="w-16 h-16 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-lg font-medium">No expenses found</p>
              <p className="text-sm">Start by adding your first expense</p>
            </div>
          ) : (
            <div className="p-6">
              <div className="space-y-4">
                {expenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
                  >
                    {/* Top row */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {expense.reason}
                        </h3>
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                              expense.category
                            )}`}
                          >
                            {expense.category}
                          </span>
                          {expense.cycle && (
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                              Recurring
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          {formatAmount(expense.amount)}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {formatDate(expense.createdAt)}
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    {expense.description && (
                      <div className="bg-gray-50 rounded-lg p-3 mt-3">
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {expense.description}
                        </p>
                      </div>
                    )}

                    {/* Bottom metadata */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                      <div className="flex items-center text-xs text-gray-500">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        {expense.email}
                      </div>
                      <div className="text-xs text-gray-400">
                        ID: {expense.id.substring(0, 8)}...
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Total:{" "}
              {formatAmount(
                expenses.reduce((sum, expense) => sum + expense.amount, 0)
              )}
            </div>
            <button
              onClick={onClose}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
