import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../lib/store';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Star } from 'lucide-react';

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const snapshot = await getDocs(collection(db, 'products'));
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setProducts(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-700 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-12 text-center max-w-2xl mx-auto">
        <h1 className="text-5xl font-serif font-bold mb-4">All Books</h1>
        <p className="text-stone-500 text-lg">Browse our complete collection of premium books, carefully selected for the avid reader.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map((product, i) => (
          <motion.div 
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link to={`/product/${product.id}`} className="group block">
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-4 bg-stone-200 shadow-md group-hover:shadow-xl transition-all duration-300">
                <img 
                  src={product.image} 
                  alt={product.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                {product.discount > 0 && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    -{product.discount}%
                  </div>
                )}
              </div>
              <h3 className="font-serif font-bold text-xl group-hover:text-amber-700 transition-colors line-clamp-1">{product.title}</h3>
              <div className="flex items-center gap-1 text-amber-500 my-1">
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
              </div>
              <div className="flex items-center gap-2">
                {product.discount > 0 ? (
                  <>
                    <span className="font-bold text-lg">৳{Math.round(product.price * (1 - product.discount / 100))}</span>
                    <span className="text-sm text-stone-400 line-through">৳{product.price}</span>
                  </>
                ) : (
                  <span className="font-bold text-lg">৳{product.price}</span>
                )}
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
