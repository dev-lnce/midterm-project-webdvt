/**
 * formatCurrency.js
 *
 * A shared utility for displaying monetary values throughout the app.
 * Using Intl.NumberFormat ensures the ₱ symbol, thousand separators,
 * and decimal places are all handled correctly by the browser's
 * internationalization engine — no manual string-building needed.
 *
 * Currency: PHP (Philippine Peso)
 * Locale:   en-PH  → formats as "₱1,234.56"
 */

const phpFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Formats a numeric amount as Philippine Peso currency string.
 * @param {number} amount - The raw numeric value to format.
 * @returns {string} e.g. "₱1,234.56"
 */
export function formatCurrency(amount) {
  return phpFormatter.format(amount);
}
