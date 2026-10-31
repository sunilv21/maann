import { Cormorant_Garamond, Jost } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { ToastProvider } from '@/context/ToastContext';
import { ModalProvider } from '@/context/ModalContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import CartSidebar from '@/components/cart/CartSidebar';
import AuthModal from '@/components/auth/AuthModal';
import ProductModal from '@/components/product/ProductModal';
import CheckoutModal from '@/components/checkout/CheckoutModal';
import OrdersModal from '@/components/orders/OrdersModal';
import ReturnModal from '@/components/orders/ReturnModal';
import AddressModal from '@/components/addresses/AddressModal';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
});

const jost = Jost({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-jost',
  display: 'swap',
});

export const metadata = {
  title: 'Maann — Handcrafted Jewellery',
  description: 'Exquisite handcrafted necklaces, earrings and bracelets. Free shipping on orders above ₹1,500.',
  keywords: 'jewellery, necklaces, earrings, bracelets, handcrafted, Maann',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${jost.variable}`}>
      <head>
        <script src="https://checkout.razorpay.com/v1/checkout.js" defer />
      </head>
      <body>
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <ModalProvider>
                <AnnouncementBar />
                <Navbar />
                <main>{children}</main>
                <Footer />
                <CartSidebar />
                <AuthModal />
                <ProductModal />
                <CheckoutModal />
                <OrdersModal />
                <ReturnModal />
                <AddressModal />
              </ModalProvider>
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
