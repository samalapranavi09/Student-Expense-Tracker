# 🎓 Student Expense Tracker & AI Financial Advisor
### Vardhaman College of Engineering | Department of Computer Science & Engineering (CSE)
**Summer Project Portfolio | Developer Handbook & Setup Guide**

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![MySQL](https://img.shields.io/badge/mysql-4479A1.svg?style=for-the-badge&logo=mysql&logoColor=white)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)

---

## 📌 Project Overview
This full-stack web application is designed to help college students track their daily expenditures, establish monthly budget limits per category, receive instant warning notifications if overspending occurs, and benefit from a **Rule-Based AI Financial Advisor** that translates spending behavior into actionable savings tips.

---

## 📂 Final Folder Structure

```
d:\Food expense tracker\
├── database/
│   └── schema.sql              # MySQL Tables and Default Category seeds
├── backend/
│   ├── config/
│   │   └── db.js               # Database Connection Pool (mysql2/promise)
│   ├── middleware/
│   │   └── auth.js             # JWT Security Middleware
│   ├── routes/
│   │   ├── auth.js             # /api/auth (Login & Register)
│   │   ├── expenses.js         # /api/expenses (Expense CRUD)
│   │   ├── budgets.js          # /api/budgets (Upsert Budget Limits)
│   │   ├── categories.js       # /api/categories (System & Custom Categories)
│   │   ├── alerts.js           # /api/alerts (Real-time Warnings)
│   │   └── advisor.js          # /api/advisor (AI Rules Engine)
│   ├── services/
│   │   ├── alertService.js     # Real-time Budget Breach Tracker
│   │   └── advisorService.js   # Weekly Spending & AI Rules Evaluator
│   ├── .env                    # Secret credentials (DB & JWT key)
│   ├── .env.example            # Environment variables template
│   ├── package.json            # Node Dependencies
│   └── server.js               # Express API entry point
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── AlertCenter.jsx       # Real-time notification Bell
│   │   │   ├── BudgetModal.jsx       # Category limit configurator modal
│   │   │   ├── Dashboard.jsx         # Central dashboard portal
│   │   │   ├── ExpenseFormModal.jsx  # Expense logging & inline custom categories
│   │   │   ├── FinancialAdvisor.jsx  # AI saving cards
│   │   │   ├── Navbar.jsx            # Glass header & user session badge
│   │   │   ├── TransactionList.jsx   # Recent activities table with Search & Sort
│   │   │   └── Visualizations.jsx    # ChartJS integrations (Pie & Bar charts)
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # Global JWT session & Axios intercepts
│   │   ├── pages/
│   │   │   ├── Login.jsx             # Beautiful sleek login form
│   │   │   └── Register.jsx          # Register profile page
│   │   ├── utils/
│   │   │   └── pdfExport.js          # Client-side jsPDF Report compiler
│   │   ├── App.css                   # Layouts & Glassmorphic structures
│   │   ├── App.jsx                   # Route configurations
│   │   ├── index.css                 # Foundations, Typography & resets
│   │   └── main.jsx                  # Virtual DOM boot loader
│   ├── index.html                    # Root HTML (loads Google Fonts)
│   ├── package.json                  # Frontend packages (Vite, ChartJS, jsPDF)
│   └── vite.config.js                # Vite configs
└── README.md                         # This Project Handbook
```

---

## 🛠️ Step-by-Step Installation & Setup

### Prerequisite Checklist
1. **Node.js** (v18.0.0 or higher recommended).
2. **MySQL Server** (via XAMPP, WAMP, or standalone MySQL Community Server).

---

### Step 1: Database Setup
1. Start your local MySQL Server (e.g., Open the **XAMPP Control Panel** and click **Start** next to **MySQL**).
2. Open your preferred database management tool (e.g., **phpMyAdmin** at `http://localhost/phpmyadmin` or **MySQL Workbench**).
3. Open a new SQL Query tab, copy the contents of the database schema file [database/schema.sql](file:///d:/Food%20expense%20tracker/database/schema.sql), and click **Run / Go**.
   *(Note: This creates the database `student_finance_db`, initiates the required tables, sets up appropriate cascade constraints, and seeds standard default categories like Food, Transport, and Entertainment).*

---

### Step 2: Backend Configuration & Start
1. Open a terminal or shell in the `backend/` directory:
   ```bash
   cd "d:\Food expense tracker\backend"
   ```
2. Install the necessary Node packages:
   ```bash
   npm install
   ```
3. Open the file [backend/.env](file:///d:/Food%20expense%20tracker/backend/.env) and update the database settings to match your local MySQL credentials:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password_here   # Leave empty if using standard XAMPP root
   DB_NAME=student_finance_db
   JWT_SECRET=vardhaman_cse_advisor_secret_key_2026
   ```
4. Fire up the backend server in development mode:
   ```bash
   npm run dev
   ```
   *Expected Console Output:*
   ```text
   ✅ Connected to MySQL database successfully.
   🌱 Default categories seeded successfully.
   🚀 Server spinning up on http://localhost:5000
   📡 Health Check URL: http://localhost:5000/
   ```

---

### Step 3: Frontend Configuration & Start
1. Open a new terminal session in the `frontend/` directory:
   ```bash
   cd "d:\Food expense tracker\frontend"
   ```
2. Install the frontend dependencies:
   ```bash
   npm install
   ```
3. Boot the local development server:
   ```bash
   npm run dev
   ```
   *Vite will automatically launch the web application in your default web browser at:* **http://localhost:3000/**

---

## 🎓 Grading Demonstration Guidelines

To score the **maximum grade** during your summer project evaluation panel, execute the following live showcase:

1. **User Sign-up Flow**:
   - Register a new account on the **Register Page**. Note how input fields validate password lengths and password matches.
2. **Dashboard Visualizations (ChartJS)**:
   - When first logging in, the dashboard will show informational helpers indicating that no data is active.
   - Click the **Set Budget** button. Set a budget limit of `$100.00` for `Food` for the current month.
   - Click **Log Expense** and record a Food expense of `$30.00`. Watch the **Category Doughnut Chart** and the **Budget vs. Spend Bar Chart** load instantly!
3. **Triggering live Budget Warnings & Alerts**:
   - Log another Food expense of `$55.00` (bringing total spend to `$85.00`). Since this is **85%** of your `$100` budget limit, watch the notification Bell icon glow with a `1` badge. Click it to view the warning: `"🔔 BUDGET WARNING: You have spent $85.00 (85%) of your $100.00 budget for "Food"..."`
   - Log a final Food expense of `$20.00` (bringing total spend to `$105.00`). Watch the Bell update. Click it to see the critical overspending log: `"⚠️ BUDGET EXCEEDED: You have spent $105.00 on "Food", exceeding your monthly budget of $100.00 by $5.00!"`
4. **Rule-Based AI Financial Advisor Showcase**:
   - Scroll down to the **AI Advisor** card.
   - Since you have spent `$105.00` on Food, representing almost 100% of your budget, the Rule Engine catches this behavior and displays:
     - **"🍔 Cook at Home & Meal Prep"**: *"Food represents 100% of your weekly spending! Packing lunches for college... can save up to $50 a week."*
     - **"🚨 Overrun inside "Food""**: *"You have exceeded your monthly budget for "Food" by $5.00..."*
     - *(This proves the AI advisor is dynamically generating custom student advice based on local rules and inputs!)*
5. **Interactive Custom Category Creation**:
   - Click **Log Expense**, click the **Create Custom** label inside the Category field, type a new category like `Vardhaman Canteen`, and click **Save**.
   - Note how it instantly inserts this category into the MySQL database under your user account and pre-selects it!
6. **Generating the Student PDF Audit Report**:
   - Click the **Export PDF** button on the top actions bar.
   - A beautifully styled PDF document will automatically compile and download to your desktop. Open the PDF to showcase the elegant college branding (Vardhaman College of Engineering, CSE Dept), structured budget charts data tables, and the custom AI saving recommendations, ready to print!

---

**⭐ Best of luck with your summer project submission! ⭐**
#   S t u d e n t - e x p e n s e - t r a c k e r  
 #   S t u d e n t - e x p e n s e - t r a c k e r    
