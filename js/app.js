import { loadTransactions, saveTransactions } from './storage.js';
import { formatCurrency, formatDate, getMonthLabel, getTodayISO } from './format.js';
import { drawDonut } from './chart.js';
import {
  addTransactionEntry,
  removeTransactionEntry,
  filterTransactionsByMonth,
  filterTransactionsByType,
  calculateTotals,
} from './transactions.js';

const CAT_COLORS = {
  Food: '#c8623a',
  Transport: '#3a7a5a',
  Shopping: '#8b5cf6',
  Health: '#e85a5a',
  Entertainment: '#f59e0b',
  Utilities: '#3b82f6',
  Salary: '#10b981',
  Freelance: '#06b6d4',
  Other: '#6b7280',
};

const CAT_EMOJI = {
  Food: '🍜',
  Transport: '🚗',
  Shopping: '🛍',
  Health: '💊',
  Entertainment: '🎬',
  Utilities: '💡',
  Salary: '💼',
  Freelance: '💻',
  Other: '📦',
};

let txType = 'income';
let activeFilter = 'all';
const viewMonth = new Date();
viewMonth.setDate(1);
let transactions = loadTransactions();

const dom = {
  prevMonth: document.getElementById('prev-month'),
  nextMonth: document.getElementById('next-month'),
  curMonthLabel: document.getElementById('cur-month-label'),
  headerMonthLabel: document.getElementById('header-month-label'),
  totalIncome: document.getElementById('total-income'),
  totalExpense: document.getElementById('total-expense'),
  netBalance: document.getElementById('net-balance'),
  incomeCount: document.getElementById('income-count'),
  expenseCount: document.getElementById('expense-count'),
  balanceNote: document.getElementById('balance-note'),
  donutArcs: document.getElementById('donut-arcs'),
  donutLegend: document.getElementById('donut-legend'),
  donutCenterNum: document.getElementById('donut-center-num'),
  recentList: document.getElementById('recent-list'),
  allList: document.getElementById('all-list'),
  catBreakdown: document.getElementById('cat-breakdown'),
  btnIncome: document.getElementById('btn-income'),
  btnExpense: document.getElementById('btn-expense'),
  addTransaction: document.getElementById('add-transaction'),
  desc: document.getElementById('inp-desc'),
  amount: document.getElementById('inp-amount'),
  category: document.getElementById('inp-cat'),
  date: document.getElementById('inp-date'),
  filterButtons: document.querySelectorAll('.filter-btn'),
};

function setType(type) {
  txType = type;
  dom.btnIncome.classList.toggle('active', type === 'income');
  dom.btnExpense.classList.toggle('active', type === 'expense');
  dom.category.value = type === 'income' ? 'Salary' : 'Food';
}

function changeMonth(delta) {
  viewMonth.setMonth(viewMonth.getMonth() + delta);
  render();
}

function getMonthTransactions() {
  return filterTransactionsByMonth(transactions, viewMonth.getFullYear(), viewMonth.getMonth());
}

function buildTransactionCard(tx) {
  return `
    <div class="tx-item">
      <div class="tx-icon ${tx.type}">${CAT_EMOJI[tx.cat] || '📦'}</div>
      <div class="tx-desc">
        <div class="tx-name">${tx.desc}</div>
        <div class="tx-meta">${tx.cat} · ${formatDate(tx.date)}</div>
      </div>
      <div class="tx-amount ${tx.type}">${tx.type === 'income' ? '+' : '-'}${formatCurrency(tx.amount)}</div>
      <button class="tx-del" data-id="${tx.id}" type="button" title="Delete">✕</button>
    </div>`;
}

function renderSummary(monthTransactions) {
  const totals = calculateTotals(monthTransactions);
  dom.totalIncome.textContent = formatCurrency(totals.income);
  dom.totalExpense.textContent = formatCurrency(totals.expense);
  dom.netBalance.textContent = formatCurrency(Math.abs(totals.net));
  dom.incomeCount.textContent = `${totals.incomeCount} transaction${totals.incomeCount !== 1 ? 's' : ''}`;
  dom.expenseCount.textContent = `${totals.expenseCount} transaction${totals.expenseCount !== 1 ? 's' : ''}`;
  dom.balanceNote.textContent = totals.net >= 0 ? 'Surplus this month' : 'Deficit this month';
}

function renderDonut(monthTransactions) {
  const expenseTx = monthTransactions.filter(tx => tx.type === 'expense');
  const { total } = drawDonut(dom.donutArcs, dom.donutLegend, expenseTx, CAT_COLORS);
  dom.donutCenterNum.textContent = total === 0 ? '—' : total >= 1000 ? `₹${(total / 1000).toFixed(1)}k` : formatCurrency(Math.round(total));
}

function renderBreakdown(monthTransactions) {
  const expenseTx = monthTransactions.filter(tx => tx.type === 'expense');
  const total = expenseTx.reduce((sum, tx) => sum + tx.amount, 0);

  if (total === 0) {
    dom.catBreakdown.innerHTML = '<div class="empty-state"><div class="es-icon">📊</div>No expenses yet</div>';
    return;
  }

  const grouped = expenseTx.reduce((acc, tx) => {
    acc[tx.cat] = (acc[tx.cat] || 0) + tx.amount;
    return acc;
  }, {});

  const sorted = Object.entries(grouped).sort((a, b) => b[1] - a[1]);
  dom.catBreakdown.innerHTML = sorted
    .map(([cat, amount]) => {
      const percent = Math.round((amount / total) * 100);
      return `
        <div class="progress-item">
          <div class="progress-row">
            <div class="progress-cat">${CAT_EMOJI[cat] || '📦'} ${cat}</div>
            <div class="progress-val">${formatCurrency(amount)} · ${percent}%</div>
          </div>
          <div class="progress-track">
            <div class="progress-fill" style="width:${percent}%;background:${CAT_COLORS[cat] || '#888'}"></div>
          </div>
        </div>`;
    })
    .join('');
}

function renderRecentList(monthTransactions) {
  const recent = monthTransactions.slice(0, 6);
  dom.recentList.innerHTML = recent.length
    ? recent.map(buildTransactionCard).join('')
    : '<div class="empty-state"><div class="es-icon">🧾</div>No transactions yet</div>';
}

function renderAllList(monthTransactions) {
  const filtered = filterTransactionsByType(monthTransactions, activeFilter);
  dom.allList.innerHTML = filtered.length
    ? filtered.map(buildTransactionCard).join('')
    : '<div class="empty-state"><div class="es-icon">📋</div>No transactions found</div>';
}

function render() {
  const label = getMonthLabel(viewMonth);
  dom.curMonthLabel.textContent = label;
  dom.headerMonthLabel.textContent = label.toUpperCase();

  const monthTransactions = getMonthTransactions();
  renderSummary(monthTransactions);
  renderDonut(monthTransactions);
  renderRecentList(monthTransactions);
  renderBreakdown(monthTransactions);
  renderAllList(monthTransactions);
}

function addTransaction() {
  const desc = dom.desc.value.trim();
  const amount = parseFloat(dom.amount.value);
  const cat = dom.category.value;
  const dateValue = dom.date.value || getTodayISO();

  if (!desc) {
    window.alert('Please enter a description.');
    return;
  }

  if (!amount || amount <= 0) {
    window.alert('Please enter a valid amount.');
    return;
  }

  transactions = addTransactionEntry(transactions, {
    id: Date.now(),
    type: txType,
    desc,
    amount,
    cat,
    date: dateValue,
  });

  saveTransactions(transactions);
  dom.desc.value = '';
  dom.amount.value = '';
  dom.date.value = '';
  render();
}

function deleteTransaction(event) {
  const button = event.target.closest('.tx-del');
  if (!button) return;
  const id = Number(button.dataset.id);
  transactions = removeTransactionEntry(transactions, id);
  saveTransactions(transactions);
  render();
}

function setFilter(filter) {
  activeFilter = filter;
  dom.filterButtons.forEach(button => {
    button.classList.toggle('active', button.dataset.filter === filter);
  });
  renderAllList(getMonthTransactions());
}

function attachEventListeners() {
  dom.prevMonth.addEventListener('click', () => changeMonth(-1));
  dom.nextMonth.addEventListener('click', () => changeMonth(1));
  dom.btnIncome.addEventListener('click', () => setType('income'));
  dom.btnExpense.addEventListener('click', () => setType('expense'));
  dom.addTransaction.addEventListener('click', addTransaction);
  dom.allList.addEventListener('click', deleteTransaction);
  dom.filterButtons.forEach(button => {
    button.addEventListener('click', () => setFilter(button.dataset.filter));
  });
}

function initialize() {
  dom.date.value = getTodayISO();
  setType(txType);
  attachEventListeners();
  render();
}

initialize();
