import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import AddTransaction from './pages/AddTransaction';
import TransactionDetail from './pages/TransactionDetail';
import Summary from './pages/Summary';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="add" element={<AddTransaction />} />
            <Route path="transaction/:id" element={<TransactionDetail />} />
            <Route path="summary" element={<Summary />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
