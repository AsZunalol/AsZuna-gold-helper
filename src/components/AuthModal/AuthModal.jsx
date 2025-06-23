"use client";
import { useAuthModal } from "@/context/AuthModalContext";
import LoginForm from "../LoginForm/LoginForm";
import RegisterForm from "../RegisterForm/RegisterForm";
import { useEffect, useRef } from "react";

export default function AuthModal() {
  const { isModalOpen, closeModal, modalView, setModalView } = useAuthModal();
  const modalRef = useRef();

  // Effect to handle clicking outside the modal to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        closeModal();
      }
    };
    if (isModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isModalOpen, closeModal]);

  if (!isModalOpen) return null;

  return (
    // Main overlay with a darker background and a blur effect
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex justify-center items-center z-50">
      <div
        ref={modalRef}
        // Main modal panel with our new, modern styling
        className="bg-slate-900 border border-slate-700 p-8 rounded-xl shadow-2xl w-full max-w-md"
      >
        {/* Tab container for Login/Register */}
        <div className="flex justify-center mb-6 border-b border-slate-700">
          <button
            onClick={() => setModalView("login")}
            className={`px-6 py-2 text-lg font-semibold transition-colors duration-200 ${
              modalView === "login"
                ? "text-teal-400 border-b-2 border-teal-400" // Active tab style
                : "text-gray-400 hover:text-white"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setModalView("register")}
            className={`px-6 py-2 text-lg font-semibold transition-colors duration-200 ${
              modalView === "register"
                ? "text-teal-400 border-b-2 border-teal-400" // Active tab style
                : "text-gray-400 hover:text-white"
            }`}
          >
            Register
          </button>
        </div>

        {/* This part dynamically shows either the Login or Register form */}
        {modalView === "login" ? <LoginForm /> : <RegisterForm />}
      </div>
    </div>
  );
}
