'use client';
import { usePathname } from 'next/navigation';
import AnnouncementBar from './AnnouncementBar';
import Navbar from './Navbar';
import Footer from './Footer';
import CartSidebar from '@/components/cart/CartSidebar';
import AuthModal from '@/components/auth/AuthModal';
import ProductModal from '@/components/product/ProductModal';
import CheckoutModal from '@/components/checkout/CheckoutModal';
import OrdersModal from '@/components/orders/OrdersModal';
import ReturnModal from '@/components/orders/ReturnModal';
import AddressModal from '@/components/addresses/AddressModal';

export default function StorefrontShell({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  return (
    <>
      {!isAdmin && <AnnouncementBar />}
      {!isAdmin && <Navbar />}
      <main>{children}</main>
      {!isAdmin && <Footer />}
      {!isAdmin && <CartSidebar />}
      <AuthModal />
      <ProductModal />
      {!isAdmin && <CheckoutModal />}
      {!isAdmin && <OrdersModal />}
      {!isAdmin && <ReturnModal />}
      {!isAdmin && <AddressModal />}
    </>
  );
}
