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
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
      <div
        ref={modalRef}
        className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md"
      >
        <div className="flex justify-center mb-4 border-b border-gray-600">
          <button
            onClick={() => setModalView("login")}
            className={`px-4 py-2 text-lg font-semibold transition-colors ${
              modalView === "login"
                ? "text-yellow-400 border-b-2 border-yellow-400"
                : "text-gray-400 hover:text-yellow-300"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setModalView("register")}
            className={`px-4 py-2 text-lg font-semibold transition-colors ${
              modalView === "register"
                ? "text-yellow-400 border-b-2 border-yellow-400"
                : "text-gray-400 hover:text-yellow-300"
            }`}
          >
            Register
          </button>
        </div>
        {modalView === "login" ? <LoginForm /> : <RegisterForm />}
      </div>
    </div>
  );
}
