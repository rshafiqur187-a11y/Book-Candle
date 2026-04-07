import { Link } from 'react-router-dom';
import { ArrowRight, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../lib/store';

export default function Home() {
  const [featured, setFeatured] = useState<Product[]>([]);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const q = query(collection(db, 'products'), limit(4));
        const snapshot = await getDocs(q);
        const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setFeatured(products);
      } catch (e) {
        console.error(e);
      }
    }
    fetchFeatured();
  }, []);

  return (
    <div className="flex flex-col gap-24">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden bg-stone-900 text-white min-h-[600px] flex items-center">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=2070&auto=format&fit=crop" 
            alt="Library" 
            className="w-full h-full object-cover opacity-40"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-900 via-stone-900/80 to-transparent" />
        </div>
        
        <div className="relative z-10 p-8 md:p-16 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-amber-500 font-bold tracking-wider uppercase text-sm mb-4 block">New Collection</span>
            <h1 className="text-5xl md:text-7xl font-serif font-bold leading-tight mb-6">
              Ignite Your <br/> Imagination
            </h1>
            <p className="text-lg text-stone-300 mb-8 max-w-md leading-relaxed">
              Discover our curated collection of premium books. Immerse yourself in stories that light up your mind like a warm candle.
            </p>
            <Link 
              to="/products" 
              className="inline-flex items-center gap-2 bg-amber-600 text-white px-8 py-4 rounded-full font-bold hover:bg-amber-700 transition-colors"
            >
              Shop Collection <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      <section>
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-4xl font-serif font-bold mb-2">Featured Reads</h2>
            <p className="text-stone-500">Handpicked selections for your next adventure.</p>
          </div>
          <Link to="/products" className="hidden md:flex items-center gap-2 text-amber-700 font-bold hover:underline">
            View All <ArrowRight size={20} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featured.map((product, i) => (
            <motion.div 
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
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
      </section>
    </div>
  );
}
