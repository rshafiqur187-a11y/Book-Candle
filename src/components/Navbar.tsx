import { Link } from 'react-router-dom';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useCart } from '../lib/store';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import CartDrawer from './CartDrawer';
import Logo from './Logo';

export default function Navbar() {
  const { cart } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 bg-[#faf9f6]/80 backdrop-blur-md border-b border-stone-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-3 group">
                <Logo className="w-12 h-12 rounded-xl shadow-sm group-hover:scale-105 transition-transform duration-300" />
                <span className="font-serif text-2xl font-bold tracking-tight text-stone-900">BooK Candle</span>
              </Link>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <Link to="/" className="text-stone-600 hover:text-stone-900 font-medium transition-colors">Home</Link>
              <Link to="/products" className="text-stone-600 hover:text-stone-900 font-medium transition-colors">Shop</Link>
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-stone-600 hover:text-stone-900 transition-colors"
              >
                <ShoppingBag size={24} />
                {cartItemsCount > 0 && (
                  <span className="absolute top-0 right-0 bg-amber-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center transform translate-x-1 -translate-y-1">
                    {cartItemsCount}
                  </span>
                )}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-4">
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-stone-600"
              >
                <ShoppingBag size={24} />
                {cartItemsCount > 0 && (
                  <span className="absolute top-0 right-0 bg-amber-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center transform translate-x-1 -translate-y-1">
                    {cartItemsCount}
                  </span>
                )}
              </button>
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-stone-600">
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-30 bg-[#faf9f6] pt-24 px-4"
          >
            <div className="flex flex-col gap-6 text-xl font-serif">
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="border-b border-stone-200 pb-4">Home</Link>
              <Link to="/products" onClick={() => setIsMobileMenuOpen(false)} className="border-b border-stone-200 pb-4">Shop</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
