import React, { createContext, useState, useContext } from 'react';

const OrderContext = createContext();

export const useOrder = () => useContext(OrderContext);

export const OrderProvider = ({ children }) => {
  const [orderData, setOrderData] = useState({
    length: '',
    width: '',
    shoulder: '',
    sleeve: '',
    material: '',
    purpose: '',
    fit: '',
    images: [],
    shipping: null,   // これから入れる配送先情報
    payment: null,    // 支払い情報
  });

  return (
    <OrderContext.Provider value={{ orderData, setOrderData }}>
      {children}
    </OrderContext.Provider>
  );
};
