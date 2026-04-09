import React, { useState } from 'react';
import { useCart } from '../lib/store';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle2, ArrowLeft } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export default function Checkout() {
  const { cart, total, clearCart } = useCart();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    location: 'inside', // 'inside' or 'outside'
    paymentMethod: 'cod', // 'cod' or 'bkash'
    senderNumber: '',
    transactionId: ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const deliveryCharge = formData.location === 'inside' ? 70 : 130;
  const finalTotal = total + deliveryCharge;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const orderData = {
      name: formData.name,
      phone: formData.phone,
      address: formData.address,
      location: formData.location,
      paymentMethod: formData.paymentMethod,
      senderNumber: formData.senderNumber,
      transactionId: formData.transactionId,
      items: cart.map(item => ({
        id: item.id,
        title: item.title,
        quantity: item.quantity,
        price: item.price,
        discount: item.discount
      })),
      subtotal: total,
      deliveryCharge,
      total: finalTotal,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, 'orders'), orderData);
      
      setSuccess(true);
      clearCart();
      
      if (window.fbq) {
        window.fbq('track', 'Purchase', {
          value: total,
          currency: 'BDT'
        });
      }
    } catch (e) {
      console.error("Order error:", e);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <>
        <div className="fixed inset-0 z-[-1] bg-[#faf9f6]" />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="min-h-[60vh] flex flex-col items-center justify-center text-center max-w-md mx-auto"
        >
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-8">
          <CheckCircle2 size={48} />
        </div>
        <h1 className="text-4xl font-serif font-bold mb-4">Order Confirmed!</h1>
        <p className="text-stone-600 text-lg mb-8">
          Thank you for your purchase. Your order has been placed successfully and we will process it shortly.
        </p>
        <button 
          onClick={() => navigate('/')}
          className="bg-stone-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-stone-800 transition-colors"
        >
          Return to Home
        </button>
      </motion.div>
      </>
    );
  }

  if (cart.length === 0) {
    return (
      <>
        <div className="fixed inset-0 z-[-1] bg-[#faf9f6]" />
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-serif font-bold">Your cart is empty</h2>
        <button onClick={() => navigate('/products')} className="text-amber-700 hover:underline flex items-center gap-2">
          <ArrowLeft size={20} /> Back to Shop
        </button>
      </div>
      </>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-[-1] bg-[#faf9f6]" />
      <div className="max-w-5xl mx-auto">
      <h1 className="text-4xl font-serif font-bold mb-10">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7">
          <form id="checkout-form" onSubmit={handleSubmit} className="space-y-8">
            {/* Contact Info */}
            <section className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100">
              <h2 className="text-2xl font-serif font-bold mb-6">Contact Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Full Name</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Phone Number</label>
                  <input 
                    required
                    type="tel" 
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>
            </section>

            {/* Delivery Info */}
            <section className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100">
              <h2 className="text-2xl font-serif font-bold mb-6">Delivery Address</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Location</label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className={`cursor-pointer border rounded-xl p-4 flex items-center gap-3 transition-all ${formData.location === 'inside' ? 'border-amber-500 bg-amber-50/50' : 'border-stone-200 hover:border-stone-300'}`}>
                      <input 
                        type="radio" 
                        name="location" 
                        value="inside"
                        checked={formData.location === 'inside'}
                        onChange={() => setFormData({...formData, location: 'inside'})}
                        className="text-amber-600 focus:ring-amber-500"
                      />
                      <span className="font-medium">Inside Dhaka (৳70)</span>
                    </label>
                    <label className={`cursor-pointer border rounded-xl p-4 flex items-center gap-3 transition-all ${formData.location === 'outside' ? 'border-amber-500 bg-amber-50/50' : 'border-stone-200 hover:border-stone-300'}`}>
                      <input 
                        type="radio" 
                        name="location" 
                        value="outside"
                        checked={formData.location === 'outside'}
                        onChange={() => setFormData({...formData, location: 'outside'})}
                        className="text-amber-600 focus:ring-amber-500"
                      />
                      <span className="font-medium">Outside Dhaka (৳130)</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Full Address</label>
                  <textarea 
                    required
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all resize-none"
                    value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                  />
                </div>
              </div>
            </section>

            {/* Payment Info */}
            <section className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100">
              <h2 className="text-2xl font-serif font-bold mb-6">Payment Method</h2>
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className={`cursor-pointer border rounded-xl p-4 flex items-center gap-3 transition-all ${formData.paymentMethod === 'cod' ? 'border-amber-500 bg-amber-50/50' : 'border-stone-200 hover:border-stone-300'}`}>
                    <input 
                      type="radio" 
                      name="payment" 
                      value="cod"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={() => setFormData({...formData, paymentMethod: 'cod'})}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span className="font-medium">Cash on Delivery</span>
                  </label>
                  <label className={`cursor-pointer border rounded-xl p-4 flex items-center gap-3 transition-all ${formData.paymentMethod === 'bkash' ? 'border-amber-500 bg-amber-50/50' : 'border-stone-200 hover:border-stone-300'}`}>
                    <input 
                      type="radio" 
                      name="payment" 
                      value="bkash"
                      checked={formData.paymentMethod === 'bkash'}
                      onChange={() => setFormData({...formData, paymentMethod: 'bkash'})}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span className="font-medium">Pay Now (bKash)</span>
                  </label>
                </div>

                {formData.paymentMethod === 'bkash' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-stone-50 p-6 rounded-2xl border border-stone-200"
                  >
                    <div className="mb-6">
                      <p className="text-stone-600 mb-2">Please send <strong className="text-stone-900">৳{finalTotal}</strong> to the following bKash Personal number:</p>
                      <div className="text-2xl font-bold text-pink-600 tracking-wider">01741413528</div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Sender bKash Number</label>
                        <input 
                          required={formData.paymentMethod === 'bkash'}
                          type="tel" 
                          className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all"
                          value={formData.senderNumber}
                          onChange={e => setFormData({...formData, senderNumber: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Transaction ID</label>
                        <input 
                          required={formData.paymentMethod === 'bkash'}
                          type="text" 
                          className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all uppercase"
                          value={formData.transactionId}
                          onChange={e => setFormData({...formData, transactionId: e.target.value})}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </section>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-5">
          <div className="bg-stone-900 text-white p-8 rounded-3xl sticky top-28">
            <h2 className="text-2xl font-serif font-bold mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-8 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
              {cart.map(item => (
                <div key={item.id} className="flex gap-4">
                  {item.mediaType === 'video' ? (
                    <video src={item.image} className="w-16 h-20 object-cover rounded-lg bg-stone-800" autoPlay loop muted playsInline />
                  ) : (
                    <img src={item.image} alt={item.title} className="w-16 h-20 object-cover rounded-lg bg-stone-800" />
                  )}
                  <div className="flex-1">
                    <h4 className="font-medium line-clamp-2 text-stone-200">{item.title}</h4>
                    <div className="flex justify-between items-center mt-2 text-sm">
                      <span className="text-stone-400">Qty: {item.quantity}</span>
                      <span className="font-bold">৳{Math.round((item.discount ? item.price * (1 - item.discount / 100) : item.price) * item.quantity)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-6 border-t border-stone-700 text-stone-300">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>৳{Math.round(total)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span>৳{deliveryCharge}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-white pt-4 mt-4 border-t border-stone-700">
                <span>Total</span>
                <span className="text-amber-500">৳{Math.round(finalTotal)}</span>
              </div>
            </div>

            <button 
              type="submit"
              form="checkout-form"
              disabled={loading}
              className="w-full bg-amber-600 text-white py-4 rounded-xl font-bold mt-8 hover:bg-amber-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Place Order'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
