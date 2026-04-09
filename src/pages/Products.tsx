import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../lib/store';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Star, Search } from 'lucide-react';
import { getMediaUrl } from '../lib/config';

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredProducts = products.filter(product => 
    product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <>
      <div className="fixed inset-0 z-[-1] bg-[#faf9f6]" />
      <div>
      <div className="mb-12 text-center max-w-2xl mx-auto">
        <h1 className="text-5xl font-serif font-bold mb-4">All Books</h1>
        <p className="text-stone-500 text-lg mb-8">Browse our complete collection of premium books, carefully selected for the avid reader.</p>
        
        <div className="relative max-w-md mx-auto">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-stone-400" />
          </div>
          <input
            type="text"
            placeholder="Search products..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-stone-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center text-stone-500 py-12 text-lg">
          No products found matching "{searchQuery}"
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-8">
          {filteredProducts.map((product, i) => (
          <motion.div 
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link to={`/product/${product.id}`} className="group block">
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-2 sm:mb-4 bg-stone-200 shadow-md group-hover:shadow-xl transition-all duration-300">
                {(product.videoUrl || product.mediaType === 'video') ? (
                  <video 
                    src={getMediaUrl(product.videoUrl || product.image)} 
                    poster={product.image !== product.videoUrl ? getMediaUrl(product.image) : undefined}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    autoPlay loop muted playsInline preload="metadata"
                  />
                ) : (
                  <img 
                    src={getMediaUrl(product.image)} 
                    alt={product.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                )}
                {product.discount > 0 && (
                  <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-red-500 text-white text-[10px] sm:text-xs font-bold px-2 py-1 sm:px-3 sm:py-1 rounded-full">
                    -{product.discount}%
                  </div>
                )}
              </div>
              <h3 className="font-serif font-bold text-sm sm:text-xl group-hover:text-amber-700 transition-colors line-clamp-1">{product.title}</h3>
              <div className="flex items-center gap-1 text-amber-500 my-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={12} className="sm:w-4 sm:h-4" fill="currentColor" />
                ))}
              </div>
              <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                {product.discount > 0 ? (
                  <>
                    <span className="font-bold text-sm sm:text-lg">৳{Math.round(product.price * (1 - product.discount / 100))}</span>
                    <span className="text-xs sm:text-sm text-stone-400 line-through">৳{product.price}</span>
                  </>
                ) : (
                  <span className="font-bold text-sm sm:text-lg">৳{product.price}</span>
                )}
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
      )}
    </div>
    </>
  );
}
