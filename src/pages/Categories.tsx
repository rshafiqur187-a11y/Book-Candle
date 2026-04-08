import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { BookOpen } from 'lucide-react';

const CATEGORIES = [
  { id: 'fiction', name: 'Fiction', desc: 'Imaginative and creative stories' },
  { id: 'non-fiction', name: 'Non-Fiction', desc: 'Factual and informative reads' },
  { id: 'sci-fi', name: 'Sci-Fi & Fantasy', desc: 'Explore new worlds and ideas' },
  { id: 'mystery', name: 'Mystery & Thriller', desc: 'Suspenseful and gripping tales' },
  { id: 'biography', name: 'Biography', desc: 'Inspiring life stories' },
  { id: 'history', name: 'History', desc: 'Journey through the past' },
  { id: 'children', name: 'Children', desc: 'Fun and educational books' },
  { id: 'poetry', name: 'Poetry', desc: 'Beautiful and expressive verse' },
];

export default function Categories() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-3 mb-4">
        <BookOpen size={32} className="text-amber-600" />
        <h1 className="text-4xl font-serif font-bold">Book Categories</h1>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {CATEGORIES.map((category, i) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Link 
              to={`/category/${encodeURIComponent(category.name)}`}
              className="block bg-white p-8 rounded-2xl shadow-sm hover:shadow-md border border-stone-100 hover:border-amber-200 transition-all group"
            >
              <h2 className="text-2xl font-serif font-bold mb-2 group-hover:text-amber-700 transition-colors">
                {category.name}
              </h2>
              <p className="text-stone-500">{category.desc}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
