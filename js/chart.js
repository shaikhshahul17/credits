import { formatCurrency } from './format.js';

const RADIUS = 50;
const CENTER = 60;
const GAP = 0.03;

export function drawDonut(arcsContainer, legendContainer, expenses, colors) {
  arcsContainer.innerHTML = '';

  const total = expenses.reduce((sum, tx) => sum + tx.amount, 0);
  if (total === 0) {
    legendContainer.innerHTML = '<div style="font-size:12px;color:var(--ink3)">No expenses yet</div>';
    return { total: 0, legend: [] };
  }

  const byCategory = expenses.reduce((acc, tx) => {
    acc[tx.cat] = (acc[tx.cat] || 0) + tx.amount;
    return acc;
  }, {});

  const sorted = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
  let startAngle = -Math.PI / 2;
  const legendItems = [];

  sorted.forEach(([category, amount]) => {
    const portion = amount / total;
    const angle = portion * Math.PI * 2 - GAP;
    const endAngle = startAngle + angle;
    const x1 = CENTER + RADIUS * Math.cos(startAngle);
    const y1 = CENTER + RADIUS * Math.sin(startAngle);
    const x2 = CENTER + RADIUS * Math.cos(endAngle);
    const y2 = CENTER + RADIUS * Math.sin(endAngle);
    const largeArc = angle > Math.PI ? 1 : 0;
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `M ${x1} ${y1} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${x2} ${y2}`);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', colors[category] || '#888');
    path.setAttribute('stroke-width', '18');
    path.setAttribute('stroke-linecap', 'butt');
    arcsContainer.appendChild(path);
    legendItems.push({ category, amount });
    startAngle = endAngle + GAP;
  });

  legendContainer.innerHTML = legendItems.slice(0, 5).map(item => {
    return `
      <div class="legend-item">
        <div class="legend-dot" style="background:${colors[item.category] || '#888'}"></div>
        <span>${item.category}</span>
        <span>${formatCurrency(item.amount)}</span>
      </div>`;
  }).join('');

  return { total, legend: legendItems };
}
