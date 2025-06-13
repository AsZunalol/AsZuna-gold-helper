"use client";
import { useAuthModal } from "@/context/AuthModalContext";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

export default function AuthModal() {
  const { isModalOpen, modalView, closeModal } = useAuthModal();

  if (!isModalOpen) {
    return null; // Don't render anything if the modal is closed
  }

  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button onClick={closeModal} className="close-modal-button">
          &times;
        </button>
        {modalView === "login" ? <LoginForm /> : <RegisterForm />}
      </div>
    </div>
  );
}
