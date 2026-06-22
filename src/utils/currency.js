// Detects the user's locale from the browser and formats the amount
// in the appropriate currency (INR for India, USD for US, etc.)
export function formatCurrency(amount) {
  const locale = navigator.language || "en-US";

  const currencyMap = {
    "en-IN": "INR",
    "hi-IN": "INR",
    "en-US": "USD",
    "en-GB": "GBP",
  };

  const currency = currencyMap[locale] || "USD";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
}
