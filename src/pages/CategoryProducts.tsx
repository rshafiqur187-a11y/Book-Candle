import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../lib/store';
import { motion } from 'motion/react';
import { Star, Megaphone, ArrowLeft } from 'lucide-react';

interface Announcement {
  id: string;
  message: string;
  createdAt: string;
}

export default function CategoryProducts() {
  const { name } = useParams<{ name: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!name) return;
      setLoading(true);
      try {
        // Fetch products
        const qProducts = query(
          collection(db, 'products'),
          where('category', '==', name)
        );
        const snapProducts = await getDocs(qProducts);
        setProducts(snapProducts.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));

        // Fetch announcements
        const qAnnouncements = query(
          collection(db, 'announcements'),
          where('type', '==', 'category'),
          where('category', '==', name),
          orderBy('createdAt', 'desc')
        );
        const snapAnnouncements = await getDocs(qAnnouncements);
        setAnnouncements(snapAnnouncements.docs.map(doc => ({ id: doc.id, ...doc.data() } as Announcement)));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [name]);

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div></div>;
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-4 mb-4">
        <Link to="/categories" className="p-2 hover:bg-stone-200 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-4xl font-serif font-bold">{name}</h1>
      </div>

      {/* Category Announcements */}
      {announcements.length > 0 && (
        <section className="bg-amber-50 rounded-2xl p-6 border border-amber-100 mb-4">
          <div className="flex items-center gap-2 mb-4 text-amber-800">
            <Megaphone size={20} />
            <h2 className="text-xl font-serif font-bold">Category Announcement</h2>
          </div>
          <div className="flex flex-col gap-4">
            {announcements.map((announcement) => (
              <motion.div 
                key={announcement.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-4 rounded-xl shadow-sm border border-stone-100"
              >
                <p className="text-stone-800 whitespace-pre-wrap">{announcement.message}</p>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {products.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-stone-100">
          <p className="text-stone-500 text-lg">No books found in this category yet.</p>
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
