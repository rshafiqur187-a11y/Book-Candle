import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json' assert { type: 'json' };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function seed() {
  await addDoc(collection(db, 'products'), {
    title: 'The Midnight Library',
    price: 450,
    discount: 10,
    description: 'Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived.',
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1000&auto=format&fit=crop',
    createdAt: new Date().toISOString()
  });
  
  await addDoc(collection(db, 'products'), {
    title: 'Atomic Habits',
    price: 350,
    discount: 0,
    description: 'No matter your goals, Atomic Habits offers a proven framework for improving--every day.',
    image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=1000&auto=format&fit=crop',
    createdAt: new Date().toISOString()
  });
  
  await addDoc(collection(db, 'products'), {
    title: 'Dune',
    price: 600,
    discount: 15,
    description: 'Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, heir to a noble family tasked with ruling an inhospitable world where the only thing of value is the "spice" melange.',
    image: 'https://images.unsplash.com/photo-1614544048536-0d28caf77f41?q=80&w=1000&auto=format&fit=crop',
    createdAt: new Date().toISOString()
  });

  console.log('Seeded products');
  process.exit(0);
}

seed();
