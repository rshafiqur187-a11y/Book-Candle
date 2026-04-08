import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../lib/store';
import { motion } from 'motion/react';
import { Star, Search as SearchIcon } from 'lucide-react';

export default function Search() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSearch() {
      setLoading(true);
      try {
        // Fetch all products and filter locally since Firestore doesn't support full-text search natively
        const qProducts = query(collection(db, 'products'));
        const snapProducts = await getDocs(qProducts);
        const allProducts = snapProducts.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        
        const filtered = allProducts.filter(p => 
          p.title.toLowerCase().includes(q.toLowerCase()) || 
          (p.category && p.category.toLowerCase().includes(q.toLowerCase()))
        );
        setProducts(filtered);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchSearch();
  }, [q]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-3 mb-4">
        <SearchIcon size={32} className="text-amber-600" />
        <h1 className="text-4xl font-serif font-bold">Search Results for "{q}"</h1>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div></div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-stone-100">
          <p className="text-stone-500 text-lg">No products found matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product, i) => (
            <motion.div 
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link to={`/product/${product.id}`} className="group block">
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-4 bg-stone-200 shadow-md group-hover:shadow-xl transition-all duration-300">
                  {(product.videoUrl || product.mediaType === 'video') ? (
                    <video 
                      src={product.videoUrl || product.image} 
                      poster={product.image !== product.videoUrl ? product.image : undefined}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      autoPlay loop muted playsInline
                    />
                  ) : (
                    <img 
                      src={product.image} 
                      alt={product.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  {product.discount > 0 && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      -{product.discount}%
                    </div>
                  )}
                </div>
                <h3 className="font-serif font-bold text-xl group-hover:text-amber-700 transition-colors line-clamp-1">{product.title}</h3>
                <div className="flex items-center gap-1 text-amber-500 my-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
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
      )}
    </div>
  );
}
