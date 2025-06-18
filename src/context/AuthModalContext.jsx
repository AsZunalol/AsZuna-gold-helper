"use client";
import { createContext, useContext } from "react";
import AuthModal from "@/components/AuthModal/AuthModal";
import React from "react";

// 1. Create the context with a default undefined value. This is the "blueprint".
const AuthModalContext = createContext(undefined);

// 2. Create the Provider component. This component will hold all the state and logic.
// By keeping the Provider logic in the same file as the context, we simplify the structure.
export const AuthModalProvider = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [modalView, setModalView] = React.useState("login");

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
      {/* The AuthModal is rendered here, ensuring it's always within the provider's scope */}
      <AuthModal />
    </AuthModalContext.Provider>
  );
};

// 3. Create and export the custom hook that components will use to access the context.
export const useAuthModal = () => {
  const context = useContext(AuthModalContext);
  if (context === undefined) {
    // This error is a safeguard to ensure the hook is used correctly.
    throw new Error("useAuthModal must be used within an AuthModalProvider");
  }
  return context;
};
