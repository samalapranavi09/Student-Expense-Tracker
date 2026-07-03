import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { PieChart, BarChart3, HelpCircle, TrendingUp } from 'lucide-react';

// Register ChartJS modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Visualizations = ({ expenses, budgets }) => {
  
  // --- 1. PREPARING DATA FOR DOUGHNUT CHART (Expense by Category) ---
  // Summing up expenses by category name
  const expensesByCategory = {};
  expenses.forEach(exp => {
    const cat = exp.category_name || 'Others';
    const amount = parseFloat(exp.amount) || 0;
    expensesByCategory[cat] = (expensesByCategory[cat] || 0) + amount;
  });

  const doughnutLabels = Object.keys(expensesByCategory);
  const doughnutValues = Object.values(expensesByCategory);

  const hasExpenseData = doughnutValues.length > 0;

  // Harmonious Modern HSL/Neon Color Palette
  const chartColors = [
    'rgba(99, 102, 241, 0.75)',  // Indigo
    'rgba(16, 185, 129, 0.75)',  // Emerald
    'rgba(139, 92, 246, 0.75)',  // Purple
    'rgba(244, 63, 94, 0.75)',   // Rose
    'rgba(6, 182, 212, 0.75)',   // Cyan
    'rgba(245, 158, 11, 0.75)',  // Amber
    'rgba(107, 114, 128, 0.75)'  // Gray
  ];

  const chartBorders = [
    'rgba(99, 102, 241, 1)',
    'rgba(16, 185, 129, 1)',
    'rgba(139, 92, 246, 1)',
    'rgba(244, 63, 94, 1)',
    'rgba(6, 182, 212, 1)',
    'rgba(245, 158, 11, 1)',
    'rgba(107, 114, 128, 1)'
  ];

  const doughnutData = {
    labels: doughnutLabels,
    datasets: [
      {
        data: doughnutValues,
        backgroundColor: chartColors.slice(0, doughnutLabels.length),
        borderColor: chartBorders.slice(0, doughnutLabels.length),
        borderWidth: 1,
        hoverOffset: 6
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#E5E7EB',
          font: { family: 'Inter', size: 11 },
          boxWidth: 12,
          padding: 8
        }
      },
      tooltip: {
        backgroundColor: 'rgba(22, 28, 45, 0.95)',
        titleColor: '#FFFFFF',
        bodyColor: '#E5E7EB',
        borderColor: 'rgba(255, 255, 255, 0.08)',
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (context) => ` ₹${context.raw.toFixed(2)}`
        }
      }
    },
    cutout: '60%'
  };

  // --- 2. PREPARING DATA FOR BAR CHART (Budget vs Actual) ---
  // We check only the current month/year for active budgets and sum up their actual spend
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  // Get budgets for the current month
  const activeBudgets = budgets.filter(b => b.month === currentMonth && b.year === currentYear);
  const barLabels = activeBudgets.map(b => b.category_name);
  const budgetLimits = activeBudgets.map(b => parseFloat(b.limit_amount));
  
  // Calculate total monthly spend for each budget's category
  const actualSpends = activeBudgets.map(b => {
    return expenses
      .filter(exp => {
        const expDate = new Date(exp.date);
        return exp.category_id === b.category_id && 
               (expDate.getMonth() + 1) === currentMonth && 
               expDate.getFullYear() === currentYear;
      })
      .reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  });

  const hasBudgetData = activeBudgets.length > 0;

  const barData = {
    labels: barLabels,
    datasets: [
      {
        label: 'Budget Limit',
        data: budgetLimits,
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        borderColor: 'rgba(255, 255, 255, 0.25)',
        borderWidth: 1,
        borderRadius: 4
      },
      {
        label: 'Actual Spend',
        data: actualSpends,
        backgroundColor: actualSpends.map((spend, idx) => {
          const limit = budgetLimits[idx];
          return spend > limit ? 'rgba(248, 113, 113, 0.85)' : 'rgba(16, 185, 129, 0.85)';
        }),
        borderColor: actualSpends.map((spend, idx) => {
          const limit = budgetLimits[idx];
          return spend > limit ? 'rgba(248, 113, 113, 1)' : 'rgba(16, 185, 129, 1)';
        }),
        borderWidth: 1,
        borderRadius: 4
      }
    ]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#E5E7EB',
          font: { family: 'Inter', size: 11 },
          boxWidth: 12
        }
      },
      tooltip: {
        backgroundColor: 'rgba(22, 28, 45, 0.95)',
        titleColor: '#FFFFFF',
        bodyColor: '#E5E7EB',
        borderColor: 'rgba(255, 255, 255, 0.08)',
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (context) => ` ${context.dataset.label}: ₹${context.raw.toFixed(2)}`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#9CA3AF', font: { family: 'Inter', size: 10 } }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#9CA3AF', font: { family: 'Inter', size: 10 } }
      }
    }
  };

  // --- 3. PREPARING DATA FOR WEEKLY PATTERN BAR CHART ---
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const last7DaysLabels = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    last7DaysLabels.push(daysOfWeek[d.getDay()]);
  }

  const last7DaysSpends = Array(7).fill(0);
  
  expenses.forEach(exp => {
    const expDate = new Date(exp.date);
    // Normalize dates to midnight to calculate difference accurately
    const todayMidnight = new Date();
    todayMidnight.setHours(0,0,0,0);
    const expMidnight = new Date(exp.date);
    expMidnight.setHours(0,0,0,0);
    
    const timeDiff = todayMidnight.getTime() - expMidnight.getTime();
    const diffDays = Math.round(timeDiff / (1000 * 3600 * 24));
    
    if (diffDays >= 0 && diffDays < 7) {
      const index = 6 - diffDays;
      if (index >= 0 && index < 7) {
        last7DaysSpends[index] += parseFloat(exp.amount) || 0;
      }
    }
  });

  const weeklyPatternData = {
    labels: last7DaysLabels,
    datasets: [
      {
        label: 'Daily Spend',
        data: last7DaysSpends,
        backgroundColor: 'rgba(139, 92, 246, 0.75)', // Purple
        borderColor: 'rgba(139, 92, 246, 1)',
        borderWidth: 1,
        borderRadius: 4
      }
    ]
  };

  const hasWeeklyData = last7DaysSpends.some(val => val > 0);

  return (
    <div className="charts-grid">
      {/* Category distribution doughnut */}
      <div className="glass-card">
        <h4 className="chart-card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <PieChart size={18} style={{ color: 'var(--primary)' }} />
          Expenses by Category
        </h4>
        <div className="chart-canvas-container">
          {hasExpenseData ? (
            <Doughnut data={doughnutData} options={doughnutOptions} />
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
              <HelpCircle size={24} style={{ opacity: 0.5, marginBottom: '0.4rem' }} />
              <p style={{ fontSize: '0.85rem' }}>No expenses registered yet. Add some below to see charts!</p>
            </div>
          )}
        </div>
      </div>

      {/* Budget vs spend bar */}
      <div className="glass-card">
        <h4 className="chart-card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BarChart3 size={18} style={{ color: 'var(--accent-neon)' }} />
          Budget vs. Actual Spend
        </h4>
        <div className="chart-canvas-container">
          {hasBudgetData ? (
            <Bar data={barData} options={barOptions} />
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
              <HelpCircle size={24} style={{ opacity: 0.5, marginBottom: '0.4rem' }} />
              <p style={{ fontSize: '0.85rem' }}>No budgets set for this month. Set a budget in the controls above!</p>
            </div>
          )}
        </div>
      </div>
      {/* Weekly Spending Pattern */}
      <div className="glass-card">
        <h4 className="chart-card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TrendingUp size={18} style={{ color: 'var(--accent-purple)' }} />
          Weekly Spending Pattern
        </h4>
        <div className="chart-canvas-container">
          {hasWeeklyData ? (
            <Bar data={weeklyPatternData} options={barOptions} />
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
              <HelpCircle size={24} style={{ opacity: 0.5, marginBottom: '0.4rem' }} />
              <p style={{ fontSize: '0.85rem' }}>No expenses logged in the last 7 days.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Visualizations;
