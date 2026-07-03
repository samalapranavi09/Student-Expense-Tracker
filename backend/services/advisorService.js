const mongoose = require('mongoose');
const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const Category = require('../models/Category');

/**
 * AI Advisor Engine - Analyzes spending habits and generates custom saving tips.
 * 
 * @param {string} userId - The user ID
 * @returns {Promise<Object>} An object containing general insights and exactly 3 actionable saving tips.
 */
async function generateSavingTips(userId) {
  try {
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();
    
    // 7 days ago date string
    const sevenDaysAgoDate = new Date();
    sevenDaysAgoDate.setDate(sevenDaysAgoDate.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgoDate.toISOString().split('T')[0];

    // 1. Fetch last 7 days of expenses
    const recentExpenses = await Expense.find({
      user_id: userId,
      date: { $gte: sevenDaysAgoStr }
    }).populate('category_id', 'name');

    // 2. Fetch current month's budget
    const budgets = await Budget.find({
      user_id: userId,
      month: currentMonth,
      year: currentYear
    }).populate('category_id', 'name');

    // Aggregate actual spend for each budget category
    const datePrefix = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
    
    // Convert to budgetComp array for rule engine
    const budgetComp = await Promise.all(budgets.map(async (b) => {
      const expenses = await Expense.find({
        user_id: userId,
        category_id: b.category_id._id,
        date: { $regex: `^${datePrefix}` }
      });
      const actualSpend = expenses.reduce((sum, exp) => sum + exp.amount, 0);
      
      return {
        category_id: b.category_id._id,
        category_name: b.category_id ? b.category_id.name : 'Unknown',
        limit_amount: b.limit_amount,
        actual_spend: actualSpend
      };
    }));

    // --- ANALYZING RECENT 7-DAY EXPENSES ---
    let totalRecentSpent = 0;
    const recentCategorySpent = {};

    recentExpenses.forEach(exp => {
      const amount = exp.amount;
      totalRecentSpent += amount;
      
      const cat = exp.category_id ? exp.category_id.name : 'Others';
      recentCategorySpent[cat] = (recentCategorySpent[cat] || 0) + amount;
    });

    // Identify highest spending category in the last 7 days
    let highest7DayCategory = 'None';
    let highest7DayAmount = 0;

    Object.keys(recentCategorySpent).forEach(cat => {
      if (recentCategorySpent[cat] > highest7DayAmount) {
        highest7DayAmount = recentCategorySpent[cat];
        highest7DayCategory = cat;
      }
    });

    // --- RULE ENGINE FOR SAVING TIPS ---
    const tipsList = [];

    // Rule 1: No Budgets Created
    if (budgetComp.length === 0) {
      tipsList.push({
        title: '📈 Budget Planner Needed',
        tip: 'You haven\'t set any budget limits for this month yet! Setting limits for key categories like Food and Entertainment gives you financial boundaries and can increase your savings by 20%.',
        priority: 100 // Maximum priority so they see this first
      });
    }

    // Rule 2: Budget Overrun (100% exceeded)
    budgetComp.forEach(budget => {
      const limit = budget.limit_amount;
      const actual = budget.actual_spend;
      if (actual > limit) {
        const excess = (actual - limit).toFixed(2);
        tipsList.push({
          title: `🚨 Overrun inside "${budget.category_name}"`,
          tip: `You have exceeded your monthly budget for "${budget.category_name}" by ₹${excess}. We advise pausing all discretionary spending in this category immediately!`,
          priority: 95
        });
      }
    });

    // Rule 3: Near Budget limit (80% - 100%)
    budgetComp.forEach(budget => {
      const limit = budget.limit_amount;
      const actual = budget.actual_spend;
      const percentage = (actual / limit) * 100;
      if (actual >= 0.8 * limit && actual <= limit) {
        tipsList.push({
          title: `⚠️ Near Limit inside "${budget.category_name}"`,
          tip: `You have exhausted ${percentage.toFixed(0)}% of your ₹${limit.toFixed(2)} budget for "${budget.category_name}". Switch to cheap alternatives to keep from breaking your budget.`,
          priority: 85
        });
      }
    });

    // Rule 4: High Food Spending in 7 Days (> 40% of total)
    if (totalRecentSpent > 0 && recentCategorySpent['Food']) {
      const foodRatio = (recentCategorySpent['Food'] / totalRecentSpent) * 100;
      if (foodRatio > 40) {
        tipsList.push({
          title: '🍔 Cook at Home & Meal Prep',
          tip: `Food represents ${foodRatio.toFixed(0)}% of your weekly spending! Packing lunches for college and preparing simple dinners at home instead of eating out can save up to ₹1000 a week.`,
          priority: 80
        });
      }
    }

    // Rule 5: Entertainment Spend is High (> 25% of total)
    if (totalRecentSpent > 0 && recentCategorySpent['Entertainment']) {
      const entRatio = (recentCategorySpent['Entertainment'] / totalRecentSpent) * 100;
      if (entRatio > 25) {
        tipsList.push({
          title: '🎬 Leverage Student Discounts',
          tip: `Entertainment is consuming ${entRatio.toFixed(0)}% of your weekly cash flow. Always look for student discounts at cinemas, Spotify Student, or explore free recreation events on campus!`,
          priority: 75
        });
      }
    }

    // Rule 6: Books & Academics is high
    if (totalRecentSpent > 0 && recentCategorySpent['Books & Academics']) {
      tipsList.push({
        title: '📚 Rent or Buy Used Textbooks',
        tip: 'Academic material costs add up quickly. Try checking local library catalogs, renting textbooks online, or negotiating second-hand purchases with Vardhaman seniors.',
        priority: 70
      });
    }

    // Rule 7: Transport expenses are high
    if (totalRecentSpent > 0 && recentCategorySpent['Transport']) {
      tipsList.push({
        title: '🚲 Carpool or Use Transit',
        tip: 'Fuel and commute costs can be heavy on a student wallet. Coordinate with classmates for carpools to Vardhaman College or take advantage of cheap student bus passes.',
        priority: 65
      });
    }

    // Default general advice to guarantee at least 3 tips are always present
    tipsList.push({
      title: '💡 Small Expenses Matter',
      tip: 'Daily ₹50 micro-purchases (like canteens, energy drinks, and vending snacks) add up to ₹1500 a month! Review your small recurring spends and trim them.',
      priority: 20
    });

    tipsList.push({
      title: '🏆 The 50/30/20 Budgeting Rule',
      tip: 'Aim to divide your student income: 50% for absolute essentials (rent, tuition materials), 30% for lifestyle choices (canteen visits, movies), and 20% for future savings.',
      priority: 15
    });

    tipsList.push({
      title: '🏦 Build an Emergency Fund',
      tip: 'Try setting aside a small percentage of your allowance every month. Having a buffer keeps you safe from unexpected expenses, like urgent laptop or phone repairs.',
      priority: 10
    });

    // 3. Sort by priority desc and take top 3
    tipsList.sort((a, b) => b.priority - a.priority);
    const top3Tips = tipsList.slice(0, 3);

    // 4. Build custom response payload
    return {
      insights: {
        totalSpentLast7Days: totalRecentSpent.toFixed(2),
        highestCategory7Days: highest7DayCategory,
        highestCategoryAmount: highest7DayAmount.toFixed(2),
        activeBudgetsCount: budgetComp.length
      },
      tips: top3Tips.map(item => ({ title: item.title, tip: item.tip }))
    };

  } catch (error) {
    console.error('Error in advisorService.generateSavingTips:', error.message);
    throw error;
  }
}

async function generateFinancialScore(userId) {
  try {
    const SavingsGoal = require('../models/SavingsGoal');
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();
    const datePrefix = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;

    let score = 10; // Base score

    const budgets = await Budget.find({ user_id: userId, month: currentMonth, year: currentYear });
    const expenses = await Expense.find({ user_id: userId, date: { $regex: `^${datePrefix}` } });
    
    const totalLimit = budgets.reduce((sum, b) => sum + b.limit_amount, 0);
    const totalSpend = expenses.reduce((sum, e) => sum + e.amount, 0);

    let withinBudget = false;
    if (totalLimit > 0 && totalSpend <= totalLimit) {
      score += 30;
      withinBudget = true;
    }

    const goals = await SavingsGoal.find({ user_id: userId });
    const hasSaved = goals.some(g => g.current_amount > 0);
    if (hasSaved) {
      score += 30;
    }

    let noOverspending = true;
    if (budgets.length > 0) {
      for (const b of budgets) {
        const catExpenses = expenses.filter(e => e.category_id && e.category_id.toString() === b.category_id.toString());
        const catSpend = catExpenses.reduce((sum, e) => sum + e.amount, 0);
        if (catSpend > b.limit_amount) {
          noOverspending = false;
          break;
        }
      }
      if (noOverspending) {
        score += 20;
      }
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentExpenses = await Expense.find({ user_id: userId, date: { $gte: sevenDaysAgo.toISOString().split('T')[0] } });
    
    const distinctDays = new Set(recentExpenses.map(e => e.date.split('T')[0])).size;
    const consistentTracking = distinctDays >= 3;
    if (consistentTracking) {
      score += 20;
    }

    let rank = 'Needs Work';
    if (score >= 80) rank = 'Excellent';
    else if (score >= 60) rank = 'Good';
    else if (score >= 40) rank = 'Fair';

    return {
      score: Math.min(score, 100),
      rank,
      breakdown: { withinBudget, hasSaved, noOverspending, consistentTracking }
    };
  } catch (err) {
    console.error('Error generating financial score:', err.message);
    throw err;
  }
}

async function handleChatbotQuery(userId, query) {
  try {
    const q = query.toLowerCase();
    
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();
    const datePrefix = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
    
    const expenses = await Expense.find({ user_id: userId, date: { $regex: `^${datePrefix}` } }).populate('category_id', 'name');
    const totalSpend = expenses.reduce((sum, e) => sum + e.amount, 0);

    let reply = "I'm your AI advisor. Try asking me how to reduce spending in categories like Food, Entertainment, or Transport!";

    if (q.includes('food') || q.includes('eat') || q.includes('meal')) {
      const foodSpend = expenses.filter(e => e.category_id && e.category_id.name === 'Food').reduce((sum, e) => sum + e.amount, 0);
      const budgets = await Budget.find({ user_id: userId, month: currentMonth, year: currentYear }).populate('category_id', 'name');
      const foodBudget = budgets.find(b => b.category_id && b.category_id.name === 'Food');
      
      if (foodBudget && foodBudget.limit_amount > 0) {
        const ratio = ((foodSpend / foodBudget.limit_amount) * 100).toFixed(0);
        reply = `You spent ${ratio}% of your budget on food. Try meal planning and reduce outside food.`;
      } else {
        reply = `You spent ₹${foodSpend.toFixed(2)} on food this month. Try meal planning and reduce outside food.`;
      }
    } 
    else if (q.includes('entertainment') || q.includes('movie') || q.includes('fun')) {
      const entSpend = expenses.filter(e => e.category_id && e.category_id.name === 'Entertainment').reduce((sum, e) => sum + e.amount, 0);
      const budgets = await Budget.find({ user_id: userId, month: currentMonth, year: currentYear }).populate('category_id', 'name');
      const entBudget = budgets.find(b => b.category_id && b.category_id.name === 'Entertainment');

      if (entBudget && entBudget.limit_amount > 0) {
        const ratio = ((entSpend / entBudget.limit_amount) * 100).toFixed(0);
        reply = `You spent ${ratio}% of your budget on entertainment. Look for free campus events or student discounts to cut this down!`;
      } else {
        reply = `You spent ₹${entSpend.toFixed(2)} on entertainment. Look for free campus events or student discounts to cut this down!`;
      }
    }
    else if (q.includes('budget') || q.includes('limit') || q.includes('overspend')) {
      const budgets = await Budget.find({ user_id: userId, month: currentMonth, year: currentYear });
      if (budgets.length === 0) {
        reply = "You don't have any active budget limits set. Setting limits is the best way to control overspending!";
      } else {
        reply = `You are tracking ${budgets.length} budget limits. Keep a close eye on the Dashboard alerts to avoid overrunning them.`;
      }
    }
    else if (q.includes('save') || q.includes('goal')) {
      reply = "To save more, try the 50/30/20 rule: 50% for needs, 30% for wants, and 20% strictly to your Savings Goals!";
    }

    return { reply };
  } catch (err) {
    console.error('Error handling chat query:', err.message);
    throw err;
  }
}

module.exports = {
  generateSavingTips,
  generateFinancialScore,
  handleChatbotQuery
};
