import { Link } from 'react-router-dom';
import { ArrowRight, Megaphone } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface Announcement {
  id: string;
  message: string;
  createdAt: string;
}

export default function Home() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    async function fetchAnnouncements() {
      try {
        const q = query(
          collection(db, 'announcements'), 
          where('type', '==', 'global'),
          orderBy('createdAt', 'desc'),
          limit(3)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Announcement));
        setAnnouncements(data);
      } catch (e) {
        console.error(e);
      }
    }
    fetchAnnouncements();
  }, []);

  return (
    <div className="flex flex-col gap-16">
      {/* Hero Section */}
      <section className="bg-stone-900 text-white rounded-3xl p-8 md:p-16 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-amber-500 font-bold tracking-wider uppercase text-sm mb-4 block">New Collection</span>
            <h1 className="text-5xl md:text-6xl font-serif font-bold leading-tight mb-6">
              Ignite Your <br/> Imagination
            </h1>
            <p className="text-lg text-stone-300 mb-8 max-w-md">
              Discover our curated collection of premium books. Immerse yourself in stories that light up your mind like a warm candle.
            </p>
            <Link 
              to="/categories" 
              className="inline-flex items-center gap-2 bg-amber-600 text-white px-8 py-4 rounded-full font-bold hover:bg-amber-700 transition-colors"
            >
              See Collection <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute right-0 top-0 w-1/2 h-full opacity-10 pointer-events-none">
          <div className="absolute right-[-10%] top-[-20%] w-96 h-96 bg-amber-500 rounded-full blur-3xl"></div>
          <div className="absolute right-[20%] bottom-[-20%] w-64 h-64 bg-orange-500 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Global Announcements */}
      {announcements.length > 0 && (
        <section className="bg-amber-50 rounded-2xl p-8 border border-amber-100">
          <div className="flex items-center gap-3 mb-6 text-amber-800">
            <Megaphone size={24} />
            <h2 className="text-2xl font-serif font-bold">Announcements</h2>
          </div>
          <div className="flex flex-col gap-4">
            {announcements.map((announcement) => (
              <motion.div 
                key={announcement.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white p-6 rounded-xl shadow-sm border border-stone-100"
              >
                <p className="text-stone-800 leading-relaxed whitespace-pre-wrap">{announcement.message}</p>
                <span className="text-xs text-stone-400 mt-4 block">
                  {new Date(announcement.createdAt).toLocaleDateString()}
                </span>
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
