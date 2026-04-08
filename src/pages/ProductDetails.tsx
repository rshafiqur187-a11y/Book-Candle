import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product, useCart } from '../lib/store';
import { motion } from 'motion/react';
import { ShoppingBag, ArrowLeft, Star, Truck, ShieldCheck } from 'lucide-react';
import { getMediaUrl } from '../lib/config';

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() } as Product);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-700 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-serif font-bold">Product not found</h2>
        <button onClick={() => navigate('/products')} className="text-amber-700 hover:underline flex items-center gap-2">
          <ArrowLeft size={20} /> Back to Shop
        </button>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);

    if (window.fbq) {
      window.fbq('track', 'AddToCart', {
        content_ids: [product.id],
        content_name: product.title,
        value: discountedPrice,
        currency: 'BDT'
      });
    }
  };

  const discountedPrice = product.discount > 0 
    ? Math.round(product.price * (1 - product.discount / 100)) 
    : product.price;

  return (
    <div className="max-w-6xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-stone-500 hover:text-stone-900 mb-8 transition-colors">
        <ArrowLeft size={20} /> Back
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-stone-200 shadow-2xl"
        >
          {(product.videoUrl || product.mediaType === 'video') ? (
            <video 
              src={getMediaUrl(product.videoUrl || product.image)} 
              poster={product.image !== product.videoUrl ? getMediaUrl(product.image) : undefined}
              className="w-full h-full object-cover"
              autoPlay loop muted playsInline controls
            />
          ) : (
            <img 
              src={getMediaUrl(product.image)} 
              alt={product.title} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          )}
          {product.discount > 0 && (
            <div className="absolute top-6 left-6 bg-red-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg">
              Save {product.discount}%
            </div>
          )}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col justify-center"
        >
          <div className="flex items-center gap-1 text-amber-500 mb-4">
            <Star size={20} fill="currentColor" />
            <Star size={20} fill="currentColor" />
            <Star size={20} fill="currentColor" />
            <Star size={20} fill="currentColor" />
            <Star size={20} fill="currentColor" />
            <span className="text-stone-500 text-sm ml-2">(128 reviews)</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6 leading-tight">{product.title}</h1>
          
          <div className="flex items-end gap-4 mb-8">
            <span className="text-4xl font-bold text-stone-900">৳{discountedPrice}</span>
            {product.discount > 0 && (
              <span className="text-xl text-stone-400 line-through mb-1">৳{product.price}</span>
            )}
          </div>

          <p className="text-lg text-stone-600 mb-10 leading-relaxed whitespace-pre-wrap">
            {product.description}
          </p>

          <button 
            onClick={handleAddToCart}
            className={`w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 ${
              added 
                ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' 
                : 'bg-stone-900 text-white hover:bg-stone-800 shadow-xl shadow-stone-900/20 hover:shadow-stone-900/40 hover:-translate-y-1'
            }`}
          >
            <ShoppingBag size={24} />
            {added ? 'Added to Cart!' : 'Add to Cart'}
          </button>

          <div className="mt-12 grid grid-cols-2 gap-6 pt-8 border-t border-stone-200">
            <div className="flex items-start gap-3">
              <div className="bg-stone-100 p-3 rounded-full text-stone-700">
                <Truck size={24} />
              </div>
              <div>
                <h4 className="font-bold text-stone-900">Fast Delivery</h4>
                <p className="text-sm text-stone-500 mt-1">Inside Dhaka: 70 BDT<br/>Outside Dhaka: 130 BDT</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-stone-100 p-3 rounded-full text-stone-700">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h4 className="font-bold text-stone-900">Secure Payment</h4>
                <p className="text-sm text-stone-500 mt-1">Cash on Delivery or bKash available.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
