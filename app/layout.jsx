import { Cormorant_Garamond, Jost } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { ToastProvider } from '@/context/ToastContext';
import { ModalProvider } from '@/context/ModalContext';
import StorefrontShell from '@/components/layout/StorefrontShell';

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
                <StorefrontShell>{children}</StorefrontShell>
              </ModalProvider>
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
