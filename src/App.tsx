/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './lib/store';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Checkout from './pages/Checkout';
import Categories from './pages/Categories';
import CategoryProducts from './pages/CategoryProducts';
import Search from './pages/Search';
import PixelTracker from './components/PixelTracker';

export default function App() {
  return (
    <CartProvider>
      <Router>
        <PixelTracker />
        <div className="min-h-screen bg-[#faf9f6] text-stone-900 font-sans selection:bg-amber-200">
          <Navbar />
          <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/category/:name" element={<CategoryProducts />} />
              <Route path="/search" element={<Search />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/checkout" element={<Checkout />} />
            </Routes>
          </main>
        </div>
      </Router>
    </CartProvider>
  );
}
