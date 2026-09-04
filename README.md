# Personal Budget Tracker - Midterm Project

This is a complete, production-ready multi-page Personal Budget Tracker built using React (Vite, JavaScript). The project is built following the "DEVit" design system from Google Stitch, matching the specified aesthetics with Tailwind CSS.

## Getting Started

1. Ensure you have Node.js installed.
2. Clone this repository.
3. Run `npm install` to install all dependencies.
4. Run `npm run dev` to start the local development server.
5. Open the provided `localhost` link in your browser to view the app.

## Project Structure

- `src/components/`: Reusable UI components:
  - `Layout.jsx` — App shell with mobile header, desktop sidebar, and bottom nav.
  - `Sidebar.jsx` — Desktop side navigation with theme toggle and New Transaction CTA.
  - `TransactionItem.jsx` — Memoized row component for the transaction list.
  - `CategoryDonutChart.jsx` — Recharts donut chart for expense category breakdown.
  - `IncomeExpenseBarChart.jsx` — Recharts grouped bar chart for income vs. expenses over time.
  - `BalanceTrendChart.jsx` — SVG sparkline showing balance trend over a selected period.
  - `PaymentMethodBadge.jsx` — Styled badge displaying the payment method on a transaction detail.
- `src/context/`: Contains the `ThemeContext.jsx` for light/dark mode state.
- `src/hooks/`: Contains the custom `useTransactions.js` hook for persistent data.
- `src/pages/`: Contains the 4 main page routes (`Dashboard.jsx`, `AddTransaction.jsx`, `TransactionDetail.jsx`, `Summary.jsx`).

## Core React Concepts Implemented

### 1. React Router
The application uses React Router (v6) for multi-page navigation. The setup is entirely in `src/App.jsx`, utilizing `<BrowserRouter>`, `<Routes>`, and `<Route>`. The `Layout` component uses an `<Outlet />` to render child pages and `<Link>` components to navigate between them without reloading the page.

### 2. Context API (ThemeContext)
To manage light and dark modes, a `ThemeContext` was created in `src/context/ThemeContext.jsx`. The `ThemeProvider` wraps the app in `App.jsx`, injecting the `theme` and `toggleTheme` values down the component tree. Components use `useContext(ThemeContext)` (via the custom `useTheme` hook) instead of relying on manual prop-drilling. The theme selection is also persisted using `localStorage`.

### 3. Custom Hook (`useTransactions`)
All `localStorage` CRUD (Create, Read, Update, Delete) operations are encapsulated inside a single custom hook located at `src/hooks/useTransactions.js`. This hook guarantees a single source of truth. All components (`Dashboard`, `AddTransaction`, `TransactionDetail`, `Summary`) call this hook to access or modify data securely without duplicating storage logic.

### 4. Performance Optimization (`React.memo` & `useMemo`)
- **`useMemo`**: Inside `src/pages/Dashboard.jsx` and `src/pages/Summary.jsx`, `useMemo` is used to calculate derived data (like category totals, total income, total expense, and filtering). By wrapping the calculation in `useMemo`, we guarantee these heavy calculations are *only* executed when `transactions` or `filterType` state changes, preventing unnecessary recalculation on every render.
- **`React.memo`**: Inside `src/components/TransactionItem.jsx`, the component is wrapped in `React.memo`. This guarantees that if the `Dashboard` re-renders (e.g., due to a filter change), only the individual transaction rows that actually change will be re-rendered. Rows whose props remain identical skip the render cycle entirely.
