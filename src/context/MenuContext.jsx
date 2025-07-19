import React, { createContext, useContext, useState, useEffect } from 'react';

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

  useEffect(() => {
    // Carregar produtos do localStorage ou usar produtos padrão
    const savedProducts = localStorage.getItem('hotdog_products');
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    } else {
      setProducts(defaultProducts);
      localStorage.setItem('hotdog_products', JSON.stringify(defaultProducts));
    }

    // Carregar oferta do dia
    const savedOffer = localStorage.getItem('hotdog_daily_offer');
    if (savedOffer) {
      setDailyOffer(JSON.parse(savedOffer));
    }

    // Verificar autenticação
    const authStatus = localStorage.getItem('hotdog_admin_auth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const saveProducts = (newProducts) => {
    setProducts(newProducts);
    localStorage.setItem('hotdog_products', JSON.stringify(newProducts));
    console.log('Produtos salvos:', newProducts); // Para debug
  };

  const addProduct = (product) => {
    const newProduct = {
      ...product,
      id: Date.now(),
      category: product.category || 'Lanches',
      available: product.available !== false
    };
    const updatedProducts = [...products, newProduct];
    saveProducts(updatedProducts);
    console.log('Produto adicionado:', newProduct); // Para debug
  };

  const updateProduct = (id, updatedProduct) => {
    const updatedProducts = products.map(product =>
      product.id === id ? { 
        ...updatedProduct, 
        id,
        category: updatedProduct.category || product.category || 'Lanches',
        available: updatedProduct.available !== false
      } : product
    );
    saveProducts(updatedProducts);
    console.log('Produto atualizado:', updatedProduct); // Para debug
  };

  const deleteProduct = (id) => {
    const updatedProducts = products.filter(product => product.id !== id);
    saveProducts(updatedProducts);
    console.log('Produto deletado, ID:', id); // Para debug
  };

  const setOffer = (offer) => {
    setDailyOffer(offer);
    if (offer) {
      localStorage.setItem('hotdog_daily_offer', JSON.stringify(offer));
    } else {
      localStorage.removeItem('hotdog_daily_offer');
    }
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
      login,
      logout
    }}>
      {children}
    </MenuContext.Provider>
  );
};