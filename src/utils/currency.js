const CURRENCY_KEY = "preferredCurrency";
export function getPreferredCurrency() {
  return localStorage.getItem(CURRENCY_KEY) || "USD";
}

export function setPreferredCurrency(currency) {
  localStorage.setItem(CURRENCY_KEY, currency);
}

export function formatCurrency(amount, currency = getPreferredCurrency()) {
  const localeMap = {
    USD: "en-US",
    INR: "en-IN",
    GBP: "en-GB",
  };

  const locale = localeMap[currency] || "en-US";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
}
