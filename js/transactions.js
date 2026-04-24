export function addTransactionEntry(transactions, transaction) {
  return [...transactions, transaction];
}

export function removeTransactionEntry(transactions, id) {
  return transactions.filter(tx => tx.id !== id);
}

export function filterTransactionsByMonth(transactions, year, month) {
  return transactions
    .filter(tx => {
      const date = new Date(tx.date);
      return date.getFullYear() === year && date.getMonth() === month;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

export function filterTransactionsByType(transactions, type) {
  if (type === 'all') return transactions;
  return transactions.filter(tx => tx.type === type);
}

export function groupExpensesByCategory(transactions) {
  return transactions.reduce((acc, tx) => {
    if (tx.type !== 'expense') return acc;
    acc[tx.cat] = (acc[tx.cat] || 0) + tx.amount;
    return acc;
  }, {});
}

export function calculateTotals(transactions) {
  const incomeTransactions = transactions.filter(tx => tx.type === 'income');
  const expenseTransactions = transactions.filter(tx => tx.type === 'expense');
  const income = incomeTransactions.reduce((sum, tx) => sum + tx.amount, 0);
  const expense = expenseTransactions.reduce((sum, tx) => sum + tx.amount, 0);

  return {
    income,
    expense,
    net: income - expense,
    incomeCount: incomeTransactions.length,
    expenseCount: expenseTransactions.length,
  };
}
