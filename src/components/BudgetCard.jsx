import { useState, useEffect } from "react";
import api from "../services/api";
import { formatCurrency } from "../utils/currency";

// BudgetCard: shows the current month's budget vs spending,
// or a "Set budget" prompt if no budget exists yet.
// monthSpent is passed in from Dashboard (computed from the summary endpoint).
export default function BudgetCard({ monthSpent, currency }) {
  const [budget, setBudget] = useState(null); // null = no budget set for this month
  const [budgetInput, setBudgetInput] = useState("");
  const [showBudgetInput, setShowBudgetInput] = useState(false);

  useEffect(() => {
    fetchBudget();
  }, []);

  const fetchBudget = async () => {
    try {
      const now = new Date();
      const month = now.getMonth() + 1; // JS months are 0-indexed
      const year = now.getFullYear();
      const response = await api.get(`/api/budget?month=${month}&year=${year}`);
      if (response.status === 204 || !response.data) {
        setBudget(null);
      } else {
        setBudget(response.data);
      }
    } catch (err) {
      console.error("Failed to load budget", err);
      setBudget(null);
    }
  };

  const saveBudget = async () => {
    const amount = parseFloat(budgetInput);
    if (isNaN(amount) || amount <= 0) return;
    try {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      const response = await api.put(
        `/api/budget?month=${month}&year=${year}&budgetAmount=${amount}`,
      );
      setBudget(response.data);
      setShowBudgetInput(false);
      setBudgetInput("");
    } catch (err) {
      console.error("Failed to save budget", err);
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100">
      <p className="text-xs text-gray-400 mb-1">Monthly budget</p>

      {showBudgetInput ? (
        // Show input form when adding or editing a budget
        <div className="flex gap-2 items-center">
          <input
            type="number"
            placeholder="Amount"
            value={budgetInput}
            onChange={(e) => setBudgetInput(e.target.value)}
            className="w-20 border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-purple-400"
          />
          <button
            onClick={saveBudget}
            className="text-xs bg-purple-500 text-white px-2 py-1 rounded-lg hover:bg-purple-600"
          >
            Save
          </button>
        </div>
      ) : budget ? (
        // Show progress bar when a budget exists
        <>
          <p className="text-2xl font-medium text-purple-900">
            {formatCurrency(monthSpent, currency)} /{" "}
            {formatCurrency(budget.budgetAmount, currency)}
          </p>
          <div className="w-full bg-gray-100 rounded-full h-2 mt-2 overflow-hidden">
            <div
              className={`h-2 rounded-full ${
                monthSpent > budget.budgetAmount
                  ? "bg-red-500"
                  : "bg-purple-500"
              }`}
              style={{
                width: `${Math.min((monthSpent / budget.budgetAmount) * 100, 100)}%`,
              }}
            />
          </div>
          <button
            onClick={() => {
              setBudgetInput(budget.budgetAmount.toString());
              setShowBudgetInput(true);
            }}
            className="text-xs text-purple-500 hover:underline mt-2"
          >
            Edit budget
          </button>
        </>
      ) : (
        // No budget set yet — show prompt to create one
        <button
          onClick={() => setShowBudgetInput(true)}
          className="text-sm text-purple-500 hover:underline"
        >
          + Set budget
        </button>
      )}
    </div>
  );
}
