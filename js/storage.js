const STORAGE_KEY = 'spendly_tx';

export function loadTransactions() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch (error) {
    console.error('Failed to load transactions', error);
    return [];
  }
}

export function saveTransactions(transactions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}
