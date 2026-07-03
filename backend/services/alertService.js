const Budget = require('../models/Budget');
const Category = require('../models/Category');
const Expense = require('../models/Expense');
const Alert = require('../models/Alert');

/**
 * Checks if the user's spending in a category has crossed 80% or 100% of their monthly budget.
 * Automatically inserts an alert in the Alerts table if limits are breached.
 * 
 * @param {string} userId The user's ID
 * @param {string} categoryId The category's ID
 * @param {string} dateString The expense date (YYYY-MM-DD)
 */
async function checkBudgetAndAlert(userId, categoryId, dateString) {
  try {
    const date = new Date(dateString);
    const month = date.getMonth() + 1; // 1-12
    const year = date.getFullYear();

    // 1. Fetch budget limit for this category/month/year
    const budget = await Budget.findOne({ user_id: userId, category_id: categoryId, month, year });

    if (!budget) {
      return; // No budget set, nothing to exceed
    }

    const budgetLimit = budget.limit_amount;

    // 2. Fetch category details
    const category = await Category.findById(categoryId);
    const categoryName = category ? category.name : 'Category';

    // 3. Sum total expenses in this category for this month
    // We can use aggregation to match the YYYY-MM substring of the date string
    const datePrefix = `${year}-${String(month).padStart(2, '0')}`;
    const expenses = await Expense.find({
      user_id: userId,
      category_id: categoryId,
      date: { $regex: `^${datePrefix}` }
    });
    
    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const percentage = (totalSpent / budgetLimit) * 100;

    // Helper: Check if an alert already exists to prevent duplicate notifications
    const checkAlertExists = async (messageSnippet) => {
      // Check last 24 hours
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      
      const existingAlert = await Alert.findOne({
        user_id: userId,
        message: { $regex: messageSnippet, $options: 'i' },
        created_at: { $gte: oneDayAgo }
      });
      return !!existingAlert;
    };

    // 4. Overspent Trigger (>= 100%)
    if (totalSpent > budgetLimit) {
      const overrun = (totalSpent - budgetLimit).toFixed(2);
      const msg = `⚠️ BUDGET EXCEEDED: You have spent ₹${totalSpent.toFixed(2)} on "${categoryName}", exceeding your monthly budget of ₹${budgetLimit.toFixed(2)} by ₹${overrun}!`;
      
      const snippet = `exceeding your monthly budget of ₹${budgetLimit.toFixed(2)}`;
      const exists = await checkAlertExists(snippet);
      if (!exists) {
        await Alert.create({ user_id: userId, message: msg });
        console.log(`[ALERT] Logged overspent alert for User ${userId} inside "${categoryName}"`);
      }
    } 
    // 5. Warning Trigger (>= 80%)
    else if (totalSpent >= 0.8 * budgetLimit) {
      const msg = `🔔 BUDGET WARNING: You have spent ₹${totalSpent.toFixed(2)} (${percentage.toFixed(0)}%) of your ₹${budgetLimit.toFixed(2)} budget for "${categoryName}". Take care for the rest of this month!`;
      
      const snippet = `(${percentage.toFixed(0)}%) of your ₹${budgetLimit.toFixed(2)} budget`;
      const exists = await checkAlertExists(snippet);
      if (!exists) {
        await Alert.create({ user_id: userId, message: msg });
        console.log(`[ALERT] Logged Warning alert for User ${userId} inside "${categoryName}"`);
      }
    }
  } catch (error) {
    console.error('Error in alertService.checkBudgetAndAlert:', error.message);
  }
}

module.exports = {
  checkBudgetAndAlert
};
