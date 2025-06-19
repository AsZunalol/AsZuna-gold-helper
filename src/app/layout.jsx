import { Montserrat, Lato } from "next/font/google";
import Image from "next/image";
import Script from "next/script";
import { Suspense } from "react";
// Import the two separate providers.
import AuthProvider from "./AuthProvider";
import { AuthModalProvider } from "@/context/AuthModalContext";
import Header from "@/components/Header/Header";
import AuthModal from "@/components/AuthModal/AuthModal"; // Import the modal here
import ParticlesComponent from "@/components/ParticlesComponent/ParticlesComponent";
import { Toaster } from "react-hot-toast";
import NotificationHandler from "@/components/NotificationHandler/NotificationHandler";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["500", "700", "900"],
});

const lato = Lato({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "700"],
});

export const metadata = {
  title: "AsZuna's Gold Helper",
  description: "Your ultimate hub for WoW gold-making guides and routes.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${montserrat.variable} ${lato.variable}`}>
        {/*
          This nesting order is critical and correct.
          1. AuthProvider provides the session data.
          2. AuthModalProvider provides the modal state and functions.
        */}
        <AuthProvider>
          <AuthModalProvider>
            <Toaster
              position="top-center"
              containerStyle={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
              toastOptions={{
                style: {
                  background: "var(--color-surface)",
                  color: "var(--color-text-main)",
                  border: "1px solid var(--color-border)",
                  minWidth: "250px",
                  padding: "1rem",
                },
              }}
            />
            <Suspense fallback={null}>
              <NotificationHandler />
            </Suspense>
            <ParticlesComponent />
            {/* THIS IS THE FIX: The problematic overlay has been removed. */}
            {/* <div className="background-overlay"></div> */}
            <Header />
            <main>{children}</main>
            <footer>
              <div className="footer-grid">
                <div className="footer-column">
                  <h4>AsZuna's Gold Helper</h4>
                  <p>&copy; {new Date().getFullYear()} All rights reserved.</p>
                </div>
                <div className="footer-column">
                  <h4>Navigate</h4>
                  <ul>
                    <li>
                      <a href="/">Home</a>
                    </li>
                    <li>
                      <a href="/guides">All Guides</a>
                    </li>
                    <li>
                      <a href="/routes">Routes</a>
                    </li>
                  </ul>
                </div>
                <div className="footer-column footer-socials">
                  <h4>Follow Us</h4>
                  <ul>{/* Social links */}</ul>
                </div>
              </div>
            </footer>
            {/* The AuthModal is now rendered here, safely inside the provider's scope. */}
            <AuthModal />
          </AuthModalProvider>
        </AuthProvider>
        <Script src="https://wow.zamimg.com/js/tooltips.js" />
      </body>
    </html>
  );
}
