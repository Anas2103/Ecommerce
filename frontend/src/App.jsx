import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { lazy, Suspense, useEffect } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import CartDrawer from './components/CartDrawer'
import Chatbot from './components/Chatbot'
import ProtectedRoute from './components/ProtectedRoute'
import BackToTop from './components/BackToTop'
import CookieBanner from './components/CookieBanner'
import CompareBar from './components/CompareBar'
import ErrorBoundary from './components/ErrorBoundary'
import LoadingSpinner from './components/ui/LoadingSpinner'

// Route-level code splitting: each page is its own chunk, so heavy libs
// (recharts, paypal, dropzone) only load on the pages that use them.
const HomePage = lazy(() => import('./pages/HomePage'))
const ProductsPage = lazy(() => import('./pages/ProductsPage'))
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'))
const CartPage = lazy(() => import('./pages/CartPage'))
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'))
const OrdersPage = lazy(() => import('./pages/OrdersPage'))
const OrderDetailPage = lazy(() => import('./pages/OrderDetailPage'))
const WishlistPage = lazy(() => import('./pages/WishlistPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'))
const ComparePage = lazy(() => import('./pages/ComparePage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))
const SellerStorePage = lazy(() => import('./pages/SellerStorePage'))

const AdminLayout = lazy(() => import('./layouts/AdminLayout'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'))
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'))
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'))
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'))
const AdminReviews = lazy(() => import('./pages/admin/AdminReviews'))
const AdminReturns = lazy(() => import('./pages/admin/AdminReturns'))
const AdminSellerDocuments = lazy(() => import('./pages/admin/AdminSellerDocuments'))

const SellerLayout = lazy(() => import('./layouts/SellerLayout'))
const SellerDashboard = lazy(() => import('./pages/seller/SellerDashboard'))
const SellerProducts = lazy(() => import('./pages/seller/SellerProducts'))
const SellerProductForm = lazy(() => import('./pages/seller/SellerProductForm'))
const SellerOrders = lazy(() => import('./pages/seller/SellerOrders'))
const SellerReturns = lazy(() => import('./pages/seller/SellerReturns'))
const SellerVerification = lazy(() => import('./pages/seller/SellerVerification'))

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function MainLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-page)' }}>
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<LoadingSpinner center size="lg" />}>
          {children}
        </Suspense>
      </main>
      <Footer />
      <CartDrawer />
      <Chatbot />
      <BackToTop />
      <CookieBanner />
      <CompareBar />
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <ScrollToTop />
      <Suspense fallback={<LoadingSpinner center size="lg" />}>
        <Routes>
          {/* Auth pages */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

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
            <Route path="reviews"    element={<AdminReviews />} />
            <Route path="returns"    element={<AdminReturns />} />
            <Route path="sellers"    element={<AdminSellerDocuments />} />
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
            <Route path="returns"          element={<SellerReturns />} />
            <Route path="verification"     element={<SellerVerification />} />
          </Route>

          {/* Storefront */}
          <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
          <Route path="/products" element={<MainLayout><ProductsPage /></MainLayout>} />
          <Route path="/products/:slug" element={<MainLayout><ProductDetailPage /></MainLayout>} />
          <Route path="/cart" element={<MainLayout><CartPage /></MainLayout>} />
          <Route path="/checkout" element={<MainLayout><ProtectedRoute><CheckoutPage /></ProtectedRoute></MainLayout>} />
          <Route path="/orders" element={<MainLayout><ProtectedRoute><OrdersPage /></ProtectedRoute></MainLayout>} />
          <Route path="/orders/:id" element={<MainLayout><ProtectedRoute><OrderDetailPage /></ProtectedRoute></MainLayout>} />
          <Route path="/wishlist" element={<MainLayout><ProtectedRoute><WishlistPage /></ProtectedRoute></MainLayout>} />
          <Route path="/profile" element={<MainLayout><ProtectedRoute><ProfilePage /></ProtectedRoute></MainLayout>} />
          <Route path="/compare" element={<MainLayout><ComparePage /></MainLayout>} />
          <Route path="/sellers/:id" element={<MainLayout><SellerStorePage /></MainLayout>} />
          <Route path="/404" element={<MainLayout><NotFoundPage /></MainLayout>} />

          <Route path="*" element={<MainLayout><NotFoundPage /></MainLayout>} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}

