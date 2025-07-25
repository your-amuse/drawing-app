// src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Order from './components/Order';
import Login from './components/login';
import Signup from './components/Signup';
import { AuthProvider } from './AuthContext';
import { OrderProvider } from './OrderContext';
import ConfirmOrder from './components/ConfirmOrder';
import ShippingForm from './components/ShippingForm';
import RequireAuth from './components/RequireAuth';
import Thanks from './components/Thanks';
import Layout from './components/Layout'; // ← 追加
import ScrollToTop from './components/ScrollToTop';
import PaymentForm from './components/PaymentForm';


function App() {
  return (
    <AuthProvider>
      <OrderProvider>
        <ScrollToTop />
        <Routes>
          {/* 共通レイアウトで囲む */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="order" element={<Order />} />
            <Route path="shipping" element={
              <RequireAuth>
                <ShippingForm />
              </RequireAuth>
            } />
            <Route path="confirm" element={
              <RequireAuth>
                <ConfirmOrder />
              </RequireAuth>
            } />
            <Route path="/payment" element={
              <RequireAuth>
                <PaymentForm />
              </RequireAuth>
          } />
            <Route path="thanks" element={
              <RequireAuth>
                <Thanks />
              </RequireAuth>
            } />
          </Route>

          {/* ログイン・サインアップはレイアウト外（サイドバー非表示） */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </OrderProvider>
    </AuthProvider>
  );
}

export default App;
