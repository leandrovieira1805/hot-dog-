import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, setDoc, getDoc } from 'firebase/firestore';

const MenuContext = createContext();

export const useMenu = () => {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
};

const defaultProducts = [
  {
    id: 1,
    name: 'Hot Dog Tradicional',
    price: 8.50,
    image: 'https://images.pexels.com/photos/4676401/pexels-photo-4676401.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 2,
    name: 'Hot Dog Especial',
    price: 12.00,
    image: 'https://images.pexels.com/photos/1633525/pexels-photo-1633525.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 3,
    name: 'X-Burguer',
    price: 15.00,
    image: 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 4,
    name: 'Batata Frita',
    price: 6.00,
    image: 'https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 5,
    name: 'Refrigerante',
    price: 4.00,
    image: 'https://images.pexels.com/photos/50593/coca-cola-cold-drink-soft-drink-coke-50593.jpeg?auto=compress&cs=tinysrgb&w=400'
  }
];

export const MenuProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [dailyOffer, setDailyOffer] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pixKey, setPixKey] = useState('');
  const [pixName, setPixName] = useState('');
  const [lastUpdate, setLastUpdate] = useState('');

  useEffect(() => {
    // Carregar produtos do Firestore
    const fetchProducts = async () => {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const products = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(products);
    };
    fetchProducts();

    // Carregar oferta do dia do Firestore
    const fetchOffer = async () => {
      const offerSnap = await getDoc(doc(db, 'offers', 'oferta_do_dia'));
      if (offerSnap.exists()) {
        setDailyOffer(offerSnap.data());
      }
    };
    fetchOffer();

    // Carregar configurações do Firestore
    const fetchConfig = async () => {
      const configSnap = await getDoc(doc(db, 'config', 'main'));
      if (configSnap.exists()) {
        const config = configSnap.data();
        setPixKey(config.pixKey || '');
        setPixName(config.pixName || '');
        setLastUpdate(config.lastUpdate || '');
      }
    };
    fetchConfig();

    // Verificar autenticação
    const authStatus = localStorage.getItem('hotdog_admin_auth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const addProduct = async (product) => {
    const docRef = await addDoc(collection(db, 'products'), product);
    setProducts((prev) => [...prev, { id: docRef.id, ...product }]);
  };

  const updateProduct = async (id, updatedProduct) => {
    const productRef = doc(db, 'products', id);
    await updateDoc(productRef, updatedProduct);
    setProducts((prev) => prev.map(p => p.id === id ? { id, ...updatedProduct } : p));
  };

  const deleteProduct = async (id) => {
    if (!id) {
      console.error('ID do produto para deletar está undefined!');
      return;
    }
    await deleteDoc(doc(db, 'products', id));
    setProducts((prev) => prev.filter(p => p.id !== id));
  };

  // Oferta do dia no Firestore
  const setOffer = async (offer) => {
    await setDoc(doc(db, 'offers', 'oferta_do_dia'), offer);
    setDailyOffer(offer);
  };

  // Configurações no Firestore
  const saveConfig = async (config) => {
    await setDoc(doc(db, 'config', 'main'), config);
    setPixKey(config.pixKey || '');
    setPixName(config.pixName || '');
    setLastUpdate(config.lastUpdate || '');
  };

  const login = (username, password) => {
    if (username === 'admin' && password === 'hotdog123') {
      setIsAuthenticated(true);
      localStorage.setItem('hotdog_admin_auth', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('hotdog_admin_auth');
  };

  return (
    <MenuContext.Provider value={{
      products,
      dailyOffer,
      isAuthenticated,
      addProduct,
      updateProduct,
      deleteProduct,
      setOffer,
      pixKey,
      pixName,
      lastUpdate,
      saveConfig,
      login,
      logout
    }}>
      {children}
    </MenuContext.Provider>
  );
};