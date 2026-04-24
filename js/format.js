export function formatCurrency(amount) {
  return '₹' + amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatDate(value) {
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
}

export function getMonthLabel(date) {
  return date.toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });
}

export function getTodayISO() {
  return new Date().toISOString().slice(0, 10);
}
