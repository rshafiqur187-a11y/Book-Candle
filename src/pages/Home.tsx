import { Link } from 'react-router-dom';
import { ArrowRight, Megaphone } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Home3DBackground from '../components/Home3DBackground';

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
    <div className="flex flex-col gap-16 min-h-screen">
      {/* Full Screen Ultra-Realistic 3D Background */}
      <div className="fixed inset-0 z-[-1]">
        <div className="absolute inset-0 bg-stone-950/20 z-10 pointer-events-none" /> {/* Subtle overlay for text readability */}
        <Home3DBackground />
      </div>
      
      {/* Hero Section */}
      <section className="relative text-white min-h-[85vh] flex items-center mt-10">
        <div className="relative z-20 p-4 md:p-8 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-amber-400 font-bold tracking-wider uppercase text-sm mb-4 block drop-shadow-md">New Collection</span>
            <h1 className="text-5xl md:text-7xl font-serif font-bold leading-tight mb-6 drop-shadow-2xl">
              Ignite Your <br/> Imagination
            </h1>
            <p className="text-xl text-stone-200 mb-8 max-w-md leading-relaxed drop-shadow-lg">
              Discover our curated collection of premium books. Immerse yourself in stories that light up your mind.
            </p>
            <Link 
              to="/categories" 
              className="inline-flex items-center gap-2 bg-amber-600/90 backdrop-blur-md text-white px-8 py-4 rounded-full font-bold hover:bg-amber-500 transition-colors shadow-[0_0_20px_rgba(217,119,6,0.5)] border border-amber-500/50"
            >
              See Collection <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Global Announcements */}
      {announcements.length > 0 && (
        <section className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
          <div className="flex items-center gap-3 mb-6 text-amber-400">
            <Megaphone size={24} />
            <h2 className="text-2xl font-serif font-bold text-white">Announcements</h2>
          </div>
          <div className="flex flex-col gap-4">
            {announcements.map((announcement) => (
              <motion.div 
                key={announcement.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-black/40 p-6 rounded-2xl border border-white/10"
              >
                <p className="text-stone-200 leading-relaxed whitespace-pre-wrap">{announcement.message}</p>
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
