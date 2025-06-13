"use client";
import { SessionProvider } from "next-auth/react";
import React, { useState, createContext, useContext } from "react";

// Create the context for the modal
const AuthModalContext = createContext();

// Create a custom hook to easily access the context
export const useAuthModal = () => useContext(AuthModalContext);

// This component will provide the modal state to your entire app
export const AuthModalProvider = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalView, setModalView] = useState("login"); // Can be 'login' or 'register'

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

// This is your main AuthProvider that now wraps both session and modal logic
export default function AuthProvider({ children }) {
  return (
    <SessionProvider>
      <AuthModalProvider>{children}</AuthModalProvider>
    </SessionProvider>
  );
}
