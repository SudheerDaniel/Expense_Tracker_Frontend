import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllExpenses, deleteExpense } from "../services/expenseService";
import { logout } from "../services/authService";
import api from "../services/api";
import AddExpenseForm from "../components/AddExpenseForm";
import BudgetCard from "../components/BudgetCard";

export default function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [allCategories, setAllCategories] = useState([]);
  const [allPaymentMethods, setAllPaymentMethods] = useState([]);
  const [searchNotes, setSearchNotes] = useState("");
  const [totalElements, setTotalElements] = useState(0);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterPayment, setFilterPayment] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState("thisMonth");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [summary, setSummary] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchMonthSpent();
  }, []);

  useEffect(() => {
    const { from, to } = getDateRange();
    setPage(0);
    fetchExpenses(0);
  }, [
    dateRange,
    customFrom,
    customTo,
    filterCategory,
    filterPayment,
    searchNotes,
  ]); // this triggers the fetchExpenses to watch the filters

  useEffect(() => {
    const { from, to } = getDateRange();
    fetchFilterOptions(from, to);
  }, [dateRange, customFrom, customTo]);

  useEffect(() => {
    fetchExpenses(page);
  }, [page]);

  useEffect(() => {
    fetchSummary();
  }, [dateRange, filterCategory, filterPayment]);

  const fetchExpenses = async (pageNum = page) => {
    try {
      const { from, to } = getDateRange();
      const data = await getAllExpenses(
        pageNum,
        50,
        from,
        to,
        filterCategory || null,
        filterPayment || null,
        searchNotes || null,
      );
      setExpenses(data.content); // array of expense objects for this page
      setTotalElements(data.totalElements); // total matching records across all pages
      setTotalPages(data.totalPages); // store total pages for pagination control
    } catch (err) {
      setError("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const { from, to } = getDateRange();
      if (!from || !to) return;

      //build query string, including optional category/paymentMethod filters
      let url = `/api/expenses/summary?from=${from}&to=${to}`;
      if (filterCategory) {
        url += `&category=${encodeURIComponent(filterCategory)}`;
      }
      if (filterPayment) {
        url += `&paymentMethod=${encodeURIComponent(filterPayment)}`;
      }

      const response = await api.get(url);
      setSummary(response.data);
    } catch (err) {
      console.error("Failed to load summary", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteExpense(id);
      setExpenses(expenses.filter((e) => e.id !== id));
      fetchMonthSpent();
    } catch (err) {
      setError("Failed to delete expense");
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const fetchFilterOptions = async (from, to) => {
    try {
      const data = await getAllExpenses(0, 1000, from, to, null, null, null);
      setAllCategories([
        ...new Set(data.content.map((e) => e.category).filter(Boolean)),
      ]);
      setAllPaymentMethods([
        ...new Set(data.content.map((e) => e.paymentMethod).filter(Boolean)),
      ]);
    } catch (err) {
      console.error("Failed to load filter options", err);
    }
  };

  const getDateRange = () => {
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    if (dateRange === "lifetime") {
      return { from: "2000-01-01", to: today };
    }

    if (dateRange == "thisMonth") {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from: firstDay.toISOString().split("T")[0], to: today };
    }
    if (dateRange === "lastMonth") {
      const firstDayLastMonth = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1,
      );
      const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      return {
        from: firstDayLastMonth.toISOString().split("T")[0],
        to: lastDayLastMonth.toISOString().split("T")[0],
      };
    }
    if (dateRange === "last7Days") {
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(now.getDate() - 7);
      return { from: sevenDaysAgo.toISOString().split("T")[0], to: today };
    }
    if (dateRange === "last2Weeks") {
      const twoWeeksAgo = new Date(now);
      twoWeeksAgo.setDate(now.getDate() - 14);
      return { from: twoWeeksAgo.toISOString().split("T")[0], to: today };
    }
    if (dateRange === "custom") {
      return { from: customFrom, to: customTo };
    }
    return { from: today, to: today };
  };

  const [monthSpent, setMonthSpent] = useState(0);

  const fetchMonthSpent = async () => {
    try {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .split("T")[0];
      const today = now.toISOString().split("T")[0];
      const response = await api.get(
        `/api/expenses/summary?from=${firstDay}&to=${today}`,
      );
      setMonthSpent(response.data.totalSpent);
    } catch (err) {
      console.error("Failed to load month spending", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-purple-50 flex items-center justify-center">
        <p className="text-purple-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-purple-50">
      <div className="bg-purple-500 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <svg
              className="w-4 h-4 text-purple-500"
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
          <span className="text-white font-medium">Expense Tracker</span>
        </div>
        <button
          onClick={handleLogout}
          className="bg-white/20 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-white/30"
        >
          Sign out
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-xs text-gray-400 mb-1">Total spent</p>
            <p className="text-2xl font-medium text-purple-900">
              ${summary ? summary.totalSpent.toFixed(2) : "0.00"}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-xs text-gray-400 mb-1">Top category</p>
            <p className="text-2xl font-medium text-purple-900">
              {summary && Object.keys(summary.byCategory).length > 0
                ? Object.entries(summary.byCategory).sort(
                    (a, b) => b[1] - a[1],
                  )[0][0]
                : "-"}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-xs text-gray-400 mb-1">Expenses in range</p>
            <p className="text-2xl font-medium text-purple-900">
              {totalElements} {/* it will show the current page only */}
            </p>
          </div>
          <BudgetCard monthSpent={monthSpent} />
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-100 mb-4">
          {/* Date range - primary filter */}
          <div className="flex gap-2 flex-wrap mb-3">
            {[
              { key: "lifetime", label: "Lifetime" },
              { key: "thisMonth", label: "This month" },
              { key: "lastMonth", label: "Last month" },
              { key: "last7Days", label: "Last 7 days" },
              { key: "last2Weeks", label: "Last 2 weeks" },
              { key: "custom", label: "Custom" },
            ].map((opt) => (
              <button
                key={opt.key}
                onClick={() => setDateRange(opt.key)}
                className={`text-sm px-3 py-1.5 rounded-lg border ${
                  dateRange === opt.key
                    ? "bg-purple-500 text-white border-purple-500"
                    : "border-gray-200 text-gray-600 hover:border-purple-300"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {dateRange === "custom" && (
            <div className="flex gap-2 mb-3">
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
              />
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
              />
              <button
                onClick={fetchSummary}
                disabled={!customFrom || !customTo}
                className="text-sm px-3 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Apply
              </button>
            </div>
          )}

          {/* Secondary filters */}
          <div className="flex gap-3 flex-wrap">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:border-purple-400"
            >
              <option value="">All categories</option>
              {allCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              value={filterPayment}
              onChange={(e) => setFilterPayment(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:border-purple-400"
            >
              <option value="">All payment methods</option>
              {allPaymentMethods.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowAddForm(true)}
              className="ml-auto bg-purple-500 text-white text-sm px-4 py-2 rounded-lg hover:bg-purple-600"
            >
              + Add expense
            </button>
            <input
              type="text"
              placeholder="Search notes"
              value={searchNotes}
              onChange={(e) => setSearchNotes(e.target.value)}
              className="w-40 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-5 px-4 py-3 bg-purple-50 border-b border-gray-100">
            {["Item", "Category", "Merchant", "Date", "Amount"].map((h) => (
              <span key={h} className="text-xs font-medium text-gray-400">
                {h}
              </span>
            ))}
          </div>

          {expenses.length === 0 ? (
            <div className="px-4 py-12 text-center text-gray-400 text-sm">
              No expenses found. Add your first expense.
            </div>
          ) : (
            expenses.map((expense) => (
              <div key={expense.id}>
                <div
                  className="grid grid-cols-5 px-4 py-3 border-b border-gray-50 items-center cursor-pointer hover:bg-purple-50/50"
                  onClick={() =>
                    setExpandedId(expandedId === expense.id ? null : expense.id)
                  }
                >
                  <span className="text-sm font-medium text-gray-800">
                    {expense.itemDescription}
                  </span>
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full inline-block w-fit">
                    {expense.category || "—"}
                  </span>
                  <span className="text-sm text-gray-500">
                    {expense.merchant || "—"}
                  </span>
                  <span className="text-sm text-gray-500">{expense.date}</span>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-purple-900">
                      ${expense.amount.toFixed(2)}
                    </span>
                    <div
                      className="flex gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => {
                          setEditingExpense(expense);
                          setShowAddForm(true);
                        }}
                        className="text-xs border border-gray-200 px-2 py-1 rounded text-gray-500 hover:border-gray-300"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="text-xs border border-red-200 px-2 py-1 rounded text-red-500 hover:bg-red-50"
                      >
                        Del
                      </button>
                    </div>
                  </div>
                </div>

                {expandedId === expense.id && (
                  <div className="px-4 py-3 bg-purple-50/40 border-b border-gray-100 grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Sub category</p>
                      <p className="text-sm text-gray-700">
                        {expense.subCategory || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">
                        Payment method
                      </p>
                      <p className="text-sm text-gray-700">
                        {expense.paymentMethod || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Notes</p>
                      <p className="text-sm text-gray-700">
                        {expense.notes || "—"}
                      </p>
                    </div>
                    {expense.receiptUrl && (
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Receipt</p>
                        <button
                          onClick={async () => {
                            const key = expense.receiptUrl.split("/").pop();
                            const response = await api.get(
                              `/api/s3/presigned-url?key=${key}`,
                            );
                            window.open(response.data, "_blank");
                          }}
                          className="text-sm text-purple-600 hover:underline"
                        >
                          View receipt
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-4">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 0))}
          disabled={page === 0}
          className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-purple-300 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <span className="text-sm text-gray-400">
          Page {page + 1} of {Math.max(totalPages, 1)}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
          disabled={page >= totalPages - 1}
          className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-purple-300 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>

      {showAddForm && (
        <AddExpenseForm
          onClose={() => {
            setShowAddForm(false);
            setEditingExpense(null);
          }}
          onExpenseAdded={() => {
            fetchExpenses();
            fetchMonthSpent();
          }}
          expense={editingExpense}
        />
      )}
    </div>
  );
}
