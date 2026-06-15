import api from "../services/api";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllExpenses, deleteExpense } from "../services/expenseService";
import { logout } from "../services/authService";
import AddExpenseForm from "../components/AddExpenseForm";

export default function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchNotes, setSearchNotes] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterPayment, setFilterPayment] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchExpenses();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [expenses, searchNotes, filterCategory, filterPayment]);

  const fetchExpenses = async () => {
    try {
      const data = await getAllExpenses();
      setExpenses(data);
    } catch (err) {
      setError("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...expenses];
    if (searchNotes) {
      result = result.filter((e) =>
        e.notes?.toLowerCase().includes(searchNotes.toLowerCase()),
      );
    }
    if (filterCategory) {
      result = result.filter((e) => e.category === filterCategory);
    }
    if (filterPayment) {
      result = result.filter((e) => e.paymentMethod === filterPayment);
    }
    setFilteredExpenses(result);
  };

  const handleDelete = async (id) => {
    try {
      await deleteExpense(id);
      setExpenses(expenses.filter((e) => e.id !== id));
    } catch (err) {
      setError("Failed to delete expense");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const total = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const thisMonth = filteredExpenses
    .filter((e) => {
      const d = new Date(e.date);
      const now = new Date();
      return (
        d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, e) => sum + e.amount, 0);

  const categories = [
    ...new Set(expenses.map((e) => e.category).filter(Boolean)),
  ];
  const paymentMethods = [
    ...new Set(expenses.map((e) => e.paymentMethod).filter(Boolean)),
  ];

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

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-xs text-gray-400 mb-1">Total spent</p>
            <p className="text-2xl font-medium text-purple-900">
              ${total.toFixed(2)}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-xs text-gray-400 mb-1">This month</p>
            <p className="text-2xl font-medium text-purple-900">
              ${thisMonth.toFixed(2)}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-xs text-gray-400 mb-1">Total expenses</p>
            <p className="text-2xl font-medium text-purple-900">
              {filteredExpenses.length}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-100 mb-4">
          <div className="flex gap-3 flex-wrap">
            <input
              type="text"
              placeholder="Search by notes..."
              value={searchNotes}
              onChange={(e) => setSearchNotes(e.target.value)}
              className="flex-1 min-w-36 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
            />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:border-purple-400"
            >
              <option value="">All categories</option>
              {categories.map((c) => (
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
              {paymentMethods.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-purple-500 text-white text-sm px-4 py-2 rounded-lg hover:bg-purple-600"
            >
              + Add expense
            </button>
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

          {filteredExpenses.length === 0 ? (
            <div className="px-4 py-12 text-center text-gray-400 text-sm">
              No expenses found. Add your first expense.
            </div>
          ) : (
            filteredExpenses.map((expense) => (
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

      {showAddForm && (
        <AddExpenseForm
          onClose={() => {
            setShowAddForm(false);
            setEditingExpense(null);
          }}
          onExpenseAdded={fetchExpenses}
          expense={editingExpense}
        />
      )}
    </div>
  );
}
