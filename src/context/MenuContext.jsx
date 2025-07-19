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
    image: 'https://images.pexels.com/photos/4676401/pexels-photo-4676401.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Lanches',
    available: true
  },
  {
    id: 2,
    name: 'Hot Dog Especial',
    price: 12.00,
    image: 'https://images.pexels.com/photos/1633525/pexels-photo-1633525.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Lanches',
    available: true
  },
  {
    id: 3,
    name: 'X-Burguer',
    price: 15.00,
    image: 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Lanches',
    available: true
  },
  {
    id: 4,
    name: 'Batata Frita',
    price: 6.00,
    image: 'https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Lanches',
    available: true
  },
  {
    id: 5,
    name: 'Refrigerante',
    price: 4.00,
    image: 'https://images.pexels.com/photos/50593/coca-cola-cold-drink-soft-drink-coke-50593.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Bebidas',
    available: true
  }
];

export const MenuProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [dailyOffer, setDailyOffer] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    console.log('MenuContext: Carregando dados do localStorage...');
    
    // Carregar produtos do localStorage ou usar produtos padrão
    const savedProducts = localStorage.getItem('hotdog_products');
    console.log('MenuContext: Produtos salvos encontrados:', savedProducts);
    
    if (savedProducts) {
      try {
        const parsedProducts = JSON.parse(savedProducts);
        console.log('MenuContext: Produtos carregados:', parsedProducts);
        setProducts(parsedProducts);
      } catch (error) {
        console.error('MenuContext: Erro ao carregar produtos:', error);
        setProducts(defaultProducts);
        localStorage.setItem('hotdog_products', JSON.stringify(defaultProducts));
      }
    } else {
      console.log('MenuContext: Nenhum produto salvo, usando padrão');
      setProducts(defaultProducts);
      localStorage.setItem('hotdog_products', JSON.stringify(defaultProducts));
    }

    // Carregar oferta do dia
    const savedOffer = localStorage.getItem('hotdog_daily_offer');
    if (savedOffer) {
      try {
        setDailyOffer(JSON.parse(savedOffer));
      } catch (error) {
        console.error('MenuContext: Erro ao carregar oferta:', error);
      }
    }

    // Verificar autenticação
    const authStatus = localStorage.getItem('hotdog_admin_auth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const saveProducts = (newProducts) => {
    console.log('MenuContext: Salvando produtos:', newProducts);
    setProducts(newProducts);
    try {
      localStorage.setItem('hotdog_products', JSON.stringify(newProducts));
      console.log('MenuContext: Produtos salvos com sucesso no localStorage');
      
      // Verificar se foi salvo
      const saved = localStorage.getItem('hotdog_products');
      console.log('MenuContext: Verificação - produtos no localStorage:', saved);
    } catch (error) {
      console.error('MenuContext: Erro ao salvar produtos:', error);
    }
  };

  const addProduct = (product) => {
    console.log('MenuContext: Adicionando produto:', product);
    const newProduct = {
      ...product,
      id: Date.now(),
      category: product.category || 'Lanches',
      available: product.available !== false
    };
    const updatedProducts = [...products, newProduct];
    console.log('MenuContext: Lista atualizada:', updatedProducts);
    saveProducts(updatedProducts);
  };

  const updateProduct = (id, updatedProduct) => {
    console.log('MenuContext: Atualizando produto ID:', id, 'Dados:', updatedProduct);
    const updatedProducts = products.map(product =>
      product.id === id ? { 
        ...updatedProduct, 
        id,
        category: updatedProduct.category || product.category || 'Lanches',
        available: updatedProduct.available !== false
      } : product
    );
    saveProducts(updatedProducts);
  };

  const deleteProduct = (id) => {
    console.log('MenuContext: Deletando produto ID:', id);
    const updatedProducts = products.filter(product => product.id !== id);
    saveProducts(updatedProducts);
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