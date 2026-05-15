import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import CartDrawer from './components/CartDrawer'
import Chatbot from './components/Chatbot'
import ProtectedRoute from './components/ProtectedRoute'

import HomePage from './pages/HomePage'
import ProductsPage from './pages/ProductsPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import OrdersPage from './pages/OrdersPage'
import OrderDetailPage from './pages/OrderDetailPage'
import WishlistPage from './pages/WishlistPage'
import ProfilePage from './pages/ProfilePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'

import AdminLayout from './layouts/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProducts from './pages/admin/AdminProducts'
import AdminOrders from './pages/admin/AdminOrders'
import AdminUsers from './pages/admin/AdminUsers'
import AdminCategories from './pages/admin/AdminCategories'

import SellerLayout from './layouts/SellerLayout'
import SellerDashboard from './pages/seller/SellerDashboard'
import SellerProducts from './pages/seller/SellerProducts'
import SellerProductForm from './pages/seller/SellerProductForm'
import SellerOrders from './pages/seller/SellerOrders'

function MainLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-page)' }}>
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <CartDrawer />
      <Chatbot />
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      {/* Auth pages */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Admin panel */}
      <Route path="/admin" element={
        <ProtectedRoute roles={['admin']}>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard"  element={<AdminDashboard />} />
        <Route path="products"   element={<AdminProducts />} />
        <Route path="orders"     element={<AdminOrders />} />
        <Route path="users"      element={<AdminUsers />} />
        <Route path="categories" element={<AdminCategories />} />
      </Route>

      {/* Seller panel */}
      <Route path="/seller" element={
        <ProtectedRoute roles={['seller']}>
          <SellerLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/seller/dashboard" replace />} />
        <Route path="dashboard"        element={<SellerDashboard />} />
        <Route path="products"         element={<SellerProducts />} />
        <Route path="products/new"     element={<SellerProductForm />} />
        <Route path="products/:id/edit" element={<SellerProductForm />} />
        <Route path="orders"           element={<SellerOrders />} />
      </Route>

      {/* Storefront */}
      <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
      <Route path="/products" element={<MainLayout><ProductsPage /></MainLayout>} />
      <Route path="/products/:id" element={<MainLayout><ProductDetailPage /></MainLayout>} />
      <Route path="/cart" element={<MainLayout><CartPage /></MainLayout>} />
      <Route path="/checkout" element={<MainLayout><ProtectedRoute><CheckoutPage /></ProtectedRoute></MainLayout>} />
      <Route path="/orders" element={<MainLayout><ProtectedRoute><OrdersPage /></ProtectedRoute></MainLayout>} />
      <Route path="/orders/:id" element={<MainLayout><ProtectedRoute><OrderDetailPage /></ProtectedRoute></MainLayout>} />
      <Route path="/wishlist" element={<MainLayout><ProtectedRoute><WishlistPage /></ProtectedRoute></MainLayout>} />
      <Route path="/profile" element={<MainLayout><ProtectedRoute><ProfilePage /></ProtectedRoute></MainLayout>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

