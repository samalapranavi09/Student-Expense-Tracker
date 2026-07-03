import React, { useState, useEffect } from 'react';
import { useAuth, api } from '../context/AuthContext';
import Navbar from './Navbar';
import Visualizations from './Visualizations';
import TransactionList from './TransactionList';
import FinancialAdvisor from './FinancialAdvisor';
import ExpenseFormModal from './ExpenseFormModal';
import BudgetModal from './BudgetModal';
import SavingsGoals from './SavingsGoals';
import GoalModal from './GoalModal';
import { exportMonthlyReportToPDF } from '../utils/pdfExport';
import { PlusCircle, FileText, PiggyBank, IndianRupee, Target, Sparkles, RefreshCw } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [advisorData, setAdvisorData] = useState(null);
  
  const [kpis, setKpis] = useState({ totalSpentMonth: 0, totalBudgetMonth: 0, netSavingsMonth: 0 });
  const [refreshToggle, setRefreshToggle] = useState(false);
  const [loading, setLoading] = useState(true);

  // Modals management
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState(null);

  const triggerRefresh = () => {
    setRefreshToggle(prev => !prev);
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Parallel fetches for speed and responsiveness
      const [expRes, budRes, advRes] = await Promise.all([
        api.get('/expenses'),
        api.get('/budgets'),
        api.get('/advisor/tips')
      ]);

      setExpenses(expRes.data);
      setBudgets(budRes.data);
      setAdvisorData(advRes.data);

      calculateKPIs(expRes.data, budRes.data);
    } catch (err) {
      console.error('Error fetching dashboard statistics:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [refreshToggle]);

  const calculateKPIs = (allExpenses, allBudgets) => {
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // 1-12
    const currentYear = today.getFullYear();

    // 1. Month Expenses
    const currentMonthExpenses = allExpenses.filter(exp => {
      const expDate = new Date(exp.date);
      return (expDate.getMonth() + 1) === currentMonth && expDate.getFullYear() === currentYear;
    });
    const monthlySpend = currentMonthExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

    // 2. Month Budget Limit
    const currentMonthBudgets = allBudgets.filter(b => b.month === currentMonth && b.year === currentYear);
    const monthlyBudgetLimit = currentMonthBudgets.reduce((sum, b) => sum + parseFloat(b.limit_amount), 0);

    // 3. Balance Savings
    const monthlySavings = monthlyBudgetLimit - monthlySpend;

    setKpis({
      totalSpentMonth: monthlySpend,
      totalBudgetMonth: monthlyBudgetLimit,
      netSavingsMonth: monthlySavings
    });
  };

  const handleEditExpense = (expense) => {
    setExpenseToEdit(expense);
    setExpenseModalOpen(true);
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense record?')) return;
    try {
      await api.delete(`/expenses/${id}`);
      triggerRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting expense item');
    }
  };

  const handleDownloadPDF = () => {
    exportMonthlyReportToPDF(user, expenses, budgets, advisorData);
  };

  return (
    <div className="app-container">
      <Navbar />

      <main className="dashboard-container">
        {/* Dashboard Title Header */}
        <div className="dashboard-header">
          <div className="dashboard-title">
            <h1>Finance Hub</h1>
            <p>Welcome back, {user?.name}! Check your financial grades and insights.</p>
          </div>

          <div className="dashboard-actions">
            <button 
              className="btn btn-secondary" 
              style={{ padding: '0.55rem' }} 
              onClick={triggerRefresh}
              title="Refresh all records"
            >
              <RefreshCw size={18} />
            </button>
            <button className="btn btn-primary" onClick={() => { setExpenseToEdit(null); setExpenseModalOpen(true); }}>
              <PlusCircle size={18} /> Log Expense
            </button>
            <button className="btn btn-success" onClick={() => setBudgetModalOpen(true)}>
              <Target size={18} /> Set Budget
            </button>
            <button className="btn btn-purple" onClick={handleDownloadPDF} disabled={expenses.length === 0}>
              <FileText size={18} /> Export PDF
            </button>
          </div>
        </div>

        {/* KPI Metrics Dashboard Grid */}
        <div className="kpi-grid">
          {/* Total Spend */}
          <div className="glass-card kpi-card spend">
            <div className="kpi-icon-wrapper">
              <IndianRupee size={24} />
            </div>
            <div className="kpi-meta">
              <p>Monthly Spend</p>
              <h3 className="kpi-value">₹{kpis.totalSpentMonth.toFixed(2)}</h3>
            </div>
          </div>

          {/* Remaining Budget */}
          <div className="glass-card kpi-card budget">
            <div className="kpi-icon-wrapper">
              <Target size={24} />
            </div>
            <div className="kpi-meta">
              <p>Active Budget limit</p>
              <h3 className="kpi-value">₹{kpis.totalBudgetMonth.toFixed(2)}</h3>
            </div>
          </div>

          {/* Balance Savings */}
          <div className="glass-card kpi-card alerts" style={{
            borderColor: kpis.netSavingsMonth < 0 ? 'rgba(248, 113, 113, 0.25)' : 'rgba(16, 185, 129, 0.25)',
            boxShadow: kpis.netSavingsMonth < 0 ? '0 0 12px rgba(248, 113, 113, 0.1)' : '0 0 12px rgba(16, 185, 129, 0.1)'
          }}>
            <div className="kpi-icon-wrapper" style={{
              color: kpis.netSavingsMonth < 0 ? 'var(--danger)' : 'var(--accent-neon)',
              backgroundColor: kpis.netSavingsMonth < 0 ? 'rgba(248, 113, 113, 0.1)' : 'rgba(16, 185, 129, 0.1)'
            }}>
              <PiggyBank size={24} />
            </div>
            <div className="kpi-meta">
              <p>Net Savings Margin</p>
              <h3 className="kpi-value" style={{ color: kpis.netSavingsMonth < 0 ? 'var(--danger)' : 'var(--accent-neon)' }}>
                ₹{kpis.netSavingsMonth.toFixed(2)}
              </h3>
            </div>
          </div>
        </div>

        {/* Charts analytics section */}
        <div style={{ marginBottom: '2rem' }}>
          <Visualizations expenses={expenses} budgets={budgets} />
        </div>

        {/* Main Grid: Left Column (Advisor + Transactions) , Right Column (Sticky Quick tips & info) */}
        <div className="dashboard-grid">
          <div className="left-column">
            {/* Rule-Based AI Card */}
            <FinancialAdvisor refreshTrigger={refreshToggle} />

            {/* List Table */}
            <TransactionList 
              expenses={expenses} 
              onEditClick={handleEditExpense} 
              onDeleteClick={handleDeleteExpense} 
            />
          </div>

          {/* Right Column (Goals + Meta info) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <SavingsGoals refreshTrigger={refreshToggle} onNewGoal={() => setGoalModalOpen(true)} />

            <div className="glass-card" style={{ height: 'fit-content' }}>
              <h4 style={{ fontSize: '1rem', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Sparkles size={16} style={{ color: 'var(--accent-purple)' }} />
                Academic Project Summary
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '0.8rem' }}>
                This student financial auditor & rule-based savings tool was developed for evaluation in the CSE department at **Vardhaman College of Engineering**.
              </p>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '0.8rem' }}>
                <div style={{ marginBottom: '0.3rem' }}>🏫 **College**: Vardhaman</div>
                <div style={{ marginBottom: '0.3rem' }}>🔬 **Branch**: Computer Science</div>
                <div>💻 **Tech**: React / Node.js / MySQL</div>
              </div>
            </div>

            <div className="glass-card" style={{ height: 'fit-content', borderLeft: '3px solid var(--border-focus)' }}>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                💡 Advisor Tips Quick Fact
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                The Rule Engine analyzes your spending in the **last 7 days** as well as **monthly budget limits** to score which savings tip has the highest contextual priority! Add more categories to test its advice.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Expense Form popup */}
      <ExpenseFormModal 
        isOpen={expenseModalOpen}
        onClose={() => { setExpenseModalOpen(false); setExpenseToEdit(null); }}
        onSubmitSuccess={triggerRefresh}
        expenseToEdit={expenseToEdit}
        expenses={expenses}
        budgets={budgets}
      />

      {/* Budget Limit Setup popup */}
      <BudgetModal 
        isOpen={budgetModalOpen}
        onClose={() => setBudgetModalOpen(false)}
        onSubmitSuccess={triggerRefresh}
      />

      {/* Goal Setup popup */}
      <GoalModal
        isOpen={goalModalOpen}
        onClose={() => setGoalModalOpen(false)}
        onSubmitSuccess={triggerRefresh}
      />
    </div>
  );
};

export default Dashboard;
