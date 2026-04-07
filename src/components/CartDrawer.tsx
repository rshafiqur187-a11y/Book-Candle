import { motion, AnimatePresence } from 'motion/react';
import { X, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../lib/store';
import { Link } from 'react-router-dom';

export default function CartDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { cart, updateQuantity, removeFromCart, total } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-[#faf9f6] shadow-2xl z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-stone-200">
              <h2 className="text-2xl font-serif font-bold flex items-center gap-2">
                <ShoppingBag /> Your Cart
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-stone-200 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-stone-500 gap-4">
                  <ShoppingBag size={64} className="opacity-20" />
                  <p className="text-lg">Your cart is empty</p>
                  <button onClick={onClose} className="text-amber-700 font-medium hover:underline">
                    Continue Shopping
                  </button>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex gap-4 bg-white p-4 rounded-2xl shadow-sm border border-stone-100">
                    <img src={item.image} alt={item.title} className="w-20 h-28 object-cover rounded-lg" />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-serif font-bold text-lg leading-tight">{item.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          {item.discount > 0 ? (
                            <>
                              <span className="font-bold text-amber-700">৳{Math.round(item.price * (1 - item.discount / 100))}</span>
                              <span className="text-sm text-stone-400 line-through">৳{item.price}</span>
                            </>
                          ) : (
                            <span className="font-bold text-stone-900">৳{item.price}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-3 bg-stone-100 rounded-full px-3 py-1">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="text-stone-500 hover:text-stone-900">
                            <Minus size={16} />
                          </button>
                          <span className="font-medium w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="text-stone-500 hover:text-stone-900">
                            <Plus size={16} />
                          </button>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="text-sm text-red-500 hover:underline">
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 bg-white border-t border-stone-200">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-stone-500 font-medium">Subtotal</span>
                  <span className="text-2xl font-serif font-bold">৳{Math.round(total)}</span>
                </div>
                <Link 
                  to="/checkout" 
                  onClick={onClose}
                  className="w-full bg-stone-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-stone-800 transition-colors"
                >
                  Proceed to Checkout <ArrowRight size={20} />
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
