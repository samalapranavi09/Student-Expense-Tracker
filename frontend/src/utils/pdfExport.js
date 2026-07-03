import { jsPDF } from 'jspdf';

/**
 * Generates a beautifully formatted PDF financial report and triggers a browser download.
 * 
 * @param {Object} user - Authenticated user details
 * @param {Array} expenses - List of user expenses
 * @param {Array} budgets - List of user budgets
 * @param {Object} advisorData - Rule-based AI tips and insights
 */
export const exportMonthlyReportToPDF = (user, expenses, budgets, advisorData) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Helper to remove emojis and unsupported unicode characters that break jsPDF's WinAnsi encoding
  const cleanText = (str) => {
    if (!str) return '';
    // Strip emojis and high-surrogate characters. Also replace ₹ with Rs. to be safe.
    return str
      .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
      .replace(/[\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2300}-\u{23FF}\u{2B50}⭐⚠️🚨🍔🎬📚🚲💡🏆🏦📈]/gu, '')
      .replace(/₹/g, 'Rs. ')
      .replace(/[^\x00-\x7F\xA0-\xFF]/g, '') // Remove any remaining non-WinAnsi chars
      .replace(/\s+/g, ' ')
      .trim();
  };

  const today = new Date();
  const currentMonthStr = today.toLocaleString('default', { month: 'long' });
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  // --- CALCULATION HELPER ---
  // Filter expenses for this current month
  const monthlyExpenses = expenses.filter(exp => {
    const expDate = new Date(exp.date);
    return (expDate.getMonth() + 1) === currentMonth && expDate.getFullYear() === currentYear;
  });

  const totalMonthlySpend = monthlyExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

  // Filter budgets for current month
  const monthlyBudgets = budgets.filter(b => b.month === currentMonth && b.year === currentYear);
  const totalMonthlyBudget = monthlyBudgets.reduce((sum, b) => sum + parseFloat(b.limit_amount), 0);
  const netSavings = totalMonthlyBudget - totalMonthlySpend;

  // --- DRAWING STYLING TOKENS ---
  const primaryColor = [11, 15, 25];       // Dark Slate Navy
  const accentColor = [79, 70, 229];       // Indigo Purple
  const greenColor = [16, 185, 129];       // Emerald Success
  const grayColor = [107, 114, 128];       // Light Gray

  // --- PAGE HEADER BLOCK ---
  // Header Banner Background
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 32, 'F');

  // School Header
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('VARDHAMAN COLLEGE OF ENGINEERING', 15, 12);
  
  doc.setFontSize(10);
  doc.setFont('Helvetica', 'normal');
  doc.text('DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING | SUMMER PROJECT', 15, 17);

  // Report Title
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(16, 185, 129); // Emerald neon title
  doc.text('STUDENT FINANCIAL AUDIT REPORT & AI SAVING RECOMMENDATIONS', 15, 25);

  // --- METADATA PANEL ---
  let y = 42;
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('Student Credentials:', 15, y);

  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(50, 50, 50);
  doc.text(`Name: ${cleanText(user.name)}`, 15, y + 5);
  doc.text(`Email: ${user.email}`, 15, y + 10);

  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('Audit Parameters:', 120, y);
  
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(50, 50, 50);
  doc.text(`Reporting Period: ${currentMonthStr} ${currentYear}`, 120, y + 5);
  doc.text(`Export Timestamp: ${today.toLocaleDateString()} ${today.toLocaleTimeString()}`, 120, y + 10);

  // Separator Line
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(15, y + 15, 195, y + 15);

  // --- METRICS METERS BLOCK (Summary Cards) ---
  y = y + 23;
  // Spend Card
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(15, y, 55, 18, 2, 2, 'F');
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
  doc.text('TOTAL MONTH SPEND', 18, y + 5);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(220, 53, 69); // Red
  doc.text(`Rs. ${totalMonthlySpend.toFixed(2)}`, 18, y + 12);

  // Budget Card
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(77, y, 55, 18, 2, 2, 'F');
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
  doc.text('ACTIVE BUDGET CAP', 80, y + 5);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]); // Indigo
  doc.text(`Rs. ${totalMonthlyBudget.toFixed(2)}`, 80, y + 12);

  // Net Savings Card
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(140, y, 55, 18, 2, 2, 'F');
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
  doc.text('NET SAVINGS OR MARGIN', 143, y + 5);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(greenColor[0], greenColor[1], greenColor[2]); // Green
  doc.text(`Rs. ${netSavings.toFixed(2)}`, 143, y + 12);

  // --- TRANSCRIPT TABLE BLOCK ---
  y = y + 26;
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('Itemized Transaction Registry (Current Month)', 15, y);

  y = y + 4;
  // Header line
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(15, y, 180, 7, 'F');
  
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('Date', 18, y + 4.5);
  doc.text('Category', 45, y + 4.5);
  doc.text('Description', 85, y + 4.5);
  doc.text('Amount', 175, y + 4.5);

  y = y + 7;
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(50, 50, 50);

  if (monthlyExpenses.length === 0) {
    doc.text('No expenses recorded during this billing cycle.', 18, y + 5);
    y = y + 10;
  } else {
    // Slice to fit page or handle pagination
    // For single page safety on college demos, show first 12 items
    const visibleExpenses = monthlyExpenses.slice(0, 12);
    visibleExpenses.forEach((exp, idx) => {
      // Alternating background colors
      if (idx % 2 === 1) {
        doc.setFillColor(248, 249, 250);
        doc.rect(15, y, 180, 6.5, 'F');
      }
      doc.setTextColor(50, 50, 50);
      doc.text(new Date(exp.date).toLocaleDateString(), 18, y + 4.5);
      doc.text(cleanText(exp.category_name || 'Others'), 45, y + 4.5);
      
      const desc = exp.description || 'N/A';
      const truncatedDesc = desc.length > 38 ? desc.substring(0, 35) + '...' : desc;
      doc.text(cleanText(truncatedDesc), 85, y + 4.5);
      
      doc.text(`Rs. ${parseFloat(exp.amount).toFixed(2)}`, 175, y + 4.5);
      y = y + 6.5;
    });

    if (monthlyExpenses.length > 12) {
      doc.setFont('Helvetica', 'italic');
      doc.setTextColor(120, 120, 120);
      doc.text(`* Showing first 12 of ${monthlyExpenses.length} transactions. View all entries in your live student portal.`, 15, y + 4.5);
      y = y + 7;
    }
  }

  // --- AI RECOMMENDATIONS PANEL ---
  y = y + 6;
  doc.setDrawColor(139, 92, 246); // Purple outline
  doc.setFillColor(250, 248, 255); // Indigo faint wash
  doc.setLineWidth(0.4);
  doc.roundedRect(15, y, 180, 52, 2, 2, 'FD');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(139, 92, 246);
  doc.text(cleanText('⭐ Rule-Based AI Financial Advisor Saving Tips'), 20, y + 6);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(80, 80, 80);

  if (advisorData && advisorData.tips && advisorData.tips.length > 0) {
    let tipY = y + 13;
    advisorData.tips.forEach((tip, idx) => {
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(50, 50, 50);
      doc.text(cleanText(`${idx + 1}. ${tip.title}`), 20, tipY);
      
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(90, 90, 90);
      
      // Word wrap utility for jsPDF
      const textLines = doc.splitTextToSize(cleanText(tip.tip), 168);
      doc.text(textLines, 20, tipY + 4.5);
      
      tipY = tipY + (4.5 + (textLines.length * 3.5));
    });
  } else {
    doc.text('AI engine does not have enough transactions to evaluate advice. Please register more expenses.', 20, y + 13);
  }

  // --- FOOTER BLOCK ---
  doc.setFont('Helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
  doc.text('This is a simulated AI Advisor feedback report designed for academic grading in the CSE department at Vardhaman College of Engineering.', 15, 287);
  doc.text('Page 1 of 1', 188, 287);

  // Save report with dynamic filename
  doc.save(`VCE_Finance_Report_${user.name.replace(/\s+/g, '_')}_${currentMonthStr}_${currentYear}.pdf`);
};
