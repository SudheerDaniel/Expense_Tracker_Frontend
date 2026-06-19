import api from "./api";

// get all expenses for the logged in user, paginated and optionally filtered
// page/size control pagination; from/to/category/paymentMethod are optional filters
export const getAllExpenses = async (
  page = 0,
  size = 50,
  from = null,
  to = null,
  category = null,
  paymentMethod = null,
  notes = null,
) => {
  let url = `/api/expenses?page=${page}&size=${size}`;
  if (from) url += `&from=${from}`;
  if (to) url += `&to=${to}`;
  if (category) url += `&category=${encodeURIComponent(category)}`;
  if (paymentMethod)
    url += `&paymentMethod=${encodeURIComponent(paymentMethod)}`;
  if (notes) url += `&notes=${encodeURIComponent(notes)}`;
  const response = await api.get(url);
  return response.data;
};

// add a new expense - sends the full expense object to the backend
export const addExpense = async (expense) => {
  const response = await api.post("/api/expenses", expense);
  return response.data;
};

//delete an expense by its id
export const deleteExpense = async (id) => {
  await api.delete(`/api/expenses/${id}`);
};

//update an expense by its id - sends the full updated expense object to the backend
export const updateExpense = async (id, expense) => {
  const response = await api.put(`/api/expenses/${id}`, expense);
  return response.data;
};

// filter expenses by category - returns an array of expenses that match the given category e.g. "Food", "Transport", "Entertainment"
export const getByCategory = async (category) => {
  const response = await api.get(`/api/expenses/category/${category}`);
  return response.data;
};

// filter expenses by merchant - returns an array of expenses that match the given merchant name e.g. "Starbucks", "Amazon", "Walmart"
export const getByMerchant = async (merchant) => {
  const response = await api.get(`/api/expenses/merchant/${merchant}`);
  return response.data;
};

// filter expenses by payment method - returns an array of expenses that match the given payment method e.g. "Credit Card", "Cash", "Debit Card"
export const getByPaymentMethod = async (method) => {
  const response = await api.get(`/api/expenses/paymentmethod/${method}`);
  return response.data;
};

// filter expenses by notes keyword - returns an array of expenses where the notes field contains the given keyword e.g. "lucky", "gift", "dinner"
export const getByNotesKeyword = async (keyword) => {
  const response = await api.get(`/api/expenses/notes?notes=${keyword}`);
  return response.data;
};

// filter expenses by sub category - returns an array of expenses that match the given subcategory e.g. "Groceries", "Dining Out", "Public Transit"
export const getBySubCategory = async (subCategory) => {
  const response = await api.get(`/api/expenses/subcategory/${subCategory}`);
  return response.data;
};
