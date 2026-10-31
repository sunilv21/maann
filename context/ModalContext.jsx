'use client';
import { createContext, useContext, useState, useCallback } from 'react';

const ModalContext = createContext(null);

export function ModalProvider({ children }) {
  const [activeModal, setActiveModal] = useState(null);
  const [modalData, setModalData] = useState(null);

  const openModal = useCallback((name, data = null) => {
    setActiveModal(name);
    setModalData(data);
  }, []);

  const closeModal = useCallback((name) => {
    if (!name || activeModal === name) {
      setActiveModal(null);
      setModalData(null);
    }
  }, [activeModal]);

  const closeAll = useCallback(() => { setActiveModal(null); setModalData(null); }, []);

  return (
    <ModalContext.Provider value={{ activeModal, modalData, openModal, closeModal, closeAll }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal must be used within ModalProvider');
  return ctx;
}
