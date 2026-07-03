# 🚀 Technology Stack

This document outlines the complete technology stack, libraries, and frameworks used to build the **Student Financial Audit & AI Advisor** (Student Expense Tracker) application. The project is built using the **MERN** stack architecture.

## 1. Frontend (Client-Side)
The user interface is built for speed, responsiveness, and a premium modern aesthetic (glassmorphism).

*   **React.js (v18)**: Core library for building the interactive, component-based user interface.
*   **Vite**: Next-generation frontend tooling used for extremely fast hot-module replacement and optimized production builds.
*   **Vanilla CSS**: Custom styling implementing a modern, responsive "glassmorphism" design system without relying on heavy CSS frameworks.
*   **Axios**: Promise-based HTTP client used for intercepting and routing API requests seamlessly to the backend with JWT authorization headers.
*   **Chart.js & react-chartjs-2**: Data visualization libraries used to render interactive Donut charts and Bar graphs for expense analytics.
*   **jsPDF**: Client-side PDF generation library used to securely export the itemized Financial Audit Report directly from the browser.
*   **Lucide React**: Lightweight vector icon library for clean, consistent UI iconography.
*   **React Router v6**: For handling client-side navigation and protected routes.

## 2. Backend (Server-Side)
The server acts as a robust REST API, handling data processing, authentication, and the AI rules engine.

*   **Node.js**: Asynchronous, event-driven JavaScript runtime used to build the scalable backend infrastructure.
*   **Express.js**: Fast, unopinionated web framework for Node.js used to define API routes and middleware.
*   **JSON Web Tokens (JWT)**: Used for stateless, secure user authentication and session management.
*   **bcrypt.js**: Cryptographic library used to securely hash and salt user passwords before database storage.
*   **express-validator**: Middleware used to rigorously sanitize and validate incoming API payloads to prevent injection attacks and bad data.
*   **CORS**: Middleware enabled to allow secure cross-origin data sharing between the frontend Vite server and backend API.
*   **dotenv**: Used for secure environment variable management (hiding database URIs and secret keys).

## 3. Database (Data Layer)
*   **MongoDB Atlas**: Fully managed cloud NoSQL database used for highly available, flexible data storage.
*   **Mongoose**: Elegant Object Data Modeling (ODM) library for MongoDB and Node.js. It enforces schemas, relationships (e.g., linking expenses to specific users and categories), and data validation.

## 4. Core Features & Logic Modules
*   **Rule-Based AI Engine**: A custom backend service (`advisorService.js`) that mathematically analyzes the user's past 7 days of spending against their active budget caps to generate prioritized, dynamic financial saving recommendations.
*   **Budget Threshold Monitor**: Real-time validation logic that intercepts expense submissions and compares them against monthly category limits, warning users before they overspend.
