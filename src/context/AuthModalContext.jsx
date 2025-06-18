"use client";
import React, { useState, createContext, useContext } from "react";

// 1. Create the context with a default value.
const AuthModalContext = createContext(undefined);

// 2. Create and export the Provider component.
// It holds the state and logic, but does NOT render the modal.
export const AuthModalProvider = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalView, setModalView] = useState("login");

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
    setModalView,
  };

  return (
    <AuthModalContext.Provider value={value}>
      {children}
    </AuthModalContext.Provider>
  );
};

// 3. Create and export the consumer hook.
export const useAuthModal = () => {
  const context = useContext(AuthModalContext);
  if (context === undefined) {
    throw new Error("useAuthModal must be used within an AuthModalProvider");
  }
  return context;
};
