"use client";

import React, { useState, createContext, useContext } from "react";

const AuthModalContext = createContext();

export const useAuthModal = () => useContext(AuthModalContext);

export const AuthModalProvider = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalView, setModalView] = useState("login"); // 'login' or 'register'

  const openModal = (view = "login") => {
    setModalView(view);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const value = {
    isModalOpen,
    modalView,
    openModal,
    closeModal,
  };

  return (
    <AuthModalContext.Provider value={value}>
      {children}
    </AuthModalContext.Provider>
  );
};
