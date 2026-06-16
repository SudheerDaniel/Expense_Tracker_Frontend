import { useState } from "react";
import { addExpense, updateExpense } from "../services/expenseService";
import api from "../services/api";

export default function AddExpenseForm({ onClose, onExpenseAdded, expense }) {
  const isEditing = !!expense;
  const [form, setForm] = useState({
    itemDescription: expense?.itemDescription || "",
    amount: expense?.amount || "",
    date: expense?.date || "",
    category: expense?.category || "",
    subCategory: expense?.subCategory || "",
    merchant: expense?.merchant || "",
    paymentMethod: expense?.paymentMethod || "",
    notes: expense?.notes || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [receiptFile, setReceiptFile] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!form.itemDescription.trim()) {
      return "Item description is required";
    }
    if (!form.amount || parseFloat(form.amount) <= 0) {
      return "Amount must be greater than zero";
    }
    if (!form.date) {
      return "Date is required";
    }
    return null; // null means no errors
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    //run frontend validation before hitting the API
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    setError("");
    try {
      let receiptUrl = expense?.receiptUrl || null;

      //if a file was selected, upload it first and get the URL
      if (receiptFile) {
        const formData = new FormData();
        formData.append("file", receiptFile);
        const uploadResponse = await api.post("/api/s3/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        receiptUrl = uploadResponse.data;
      }
      if (isEditing) {
        await updateExpense(expense.id, {
          ...form,
          amount: parseFloat(form.amount),
          receiptUrl,
        });
      } else {
        await addExpense({
          ...form,
          amount: parseFloat(form.amount),
          receiptUrl,
        });
      }
      onExpenseAdded();
      onClose();
    } catch (err) {
      setError("Failed to save expense. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <p className="text-base font-medium text-purple-900">
            {isEditing ? "Edit expense" : "Add expense"}
          </p>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-2 gap-4"
          noValidate
        >
          <div className="col-span-2">
            <label className="text-xs font-medium text-gray-600 block mb-1.5">
              Item description
            </label>
            <input
              name="itemDescription"
              value={form.itemDescription}
              onChange={handleChange}
              placeholder="e.g. Grocery shopping"
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1.5">
              Amount
            </label>
            <input
              name="amount"
              type="number"
              step="0.01"
              value={form.amount}
              onChange={handleChange}
              placeholder="0.00"
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1.5">
              Date
            </label>
            <input
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1.5">
              Category
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:border-purple-400"
            >
              <option value="">Select category</option>
              <option>Food</option>
              <option>Transport</option>
              <option>Entertainment</option>
              <option>Utilities</option>
              <option>Shopping</option>
              <option>Health</option>
              <option>Subscriptions</option>
              <option>Personal Finance</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1.5">
              Sub category
            </label>
            <input
              name="subCategory"
              value={form.subCategory}
              onChange={handleChange}
              placeholder="e.g. Groceries"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1.5">
              Merchant
            </label>
            <input
              name="merchant"
              value={form.merchant}
              onChange={handleChange}
              placeholder="e.g. Amazon"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1.5">
              Payment method
            </label>
            <select
              name="paymentMethod"
              value={form.paymentMethod}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:border-purple-400"
            >
              <option value="">Select method</option>
              <option>Cash</option>
              <option>Credit card</option>
              <option>Debit card</option>
              <option>UPI</option>
              <option>Bank transfer</option>
            </select>
          </div>

          <div className="col-span-2">
            <label className="text-xs font medium text-gray-600 block mb-1.5">
              Receipt
            </label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setReceiptFile(e.target.files[0])}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
            />
          </div>

          <div className="col-span-2">
            <label className="text-xs font-medium text-gray-600 block mb-1.5">
              Notes
            </label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Any additional notes..."
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400 resize-none"
            />
          </div>

          <div className="col-span-2 flex gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-200 rounded-lg py-2.5 text-sm text-gray-500 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-2 bg-purple-500 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-purple-600 disabled:opacity-50 px-8"
            >
              {loading
                ? "Saving..."
                : isEditing
                  ? "Update expense"
                  : "Save expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
