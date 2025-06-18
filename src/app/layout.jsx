import { Montserrat, Lato } from "next/font/google";
import Image from "next/image";
import Script from "next/script";
import { Suspense } from "react"; // Import Suspense
import AuthProvider from "./AuthProvider";
import { AuthModalProvider } from "@/context/AuthModalContext";
import Header from "@/components/Header/Header";
import AuthModal from "@/components/AuthModal/AuthModal";
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
                success: {
                  iconTheme: {
                    primary: "var(--color-primary)",
                    secondary: "var(--color-surface)",
                  },
                },
                error: {
                  iconTheme: {
                    primary: "#ff6b6b",
                    secondary: "var(--color-surface)",
                  },
                },
              }}
            />
            {/* Wrap the NotificationHandler in a Suspense boundary */}
            <Suspense fallback={null}>
              <NotificationHandler />
            </Suspense>
            <ParticlesComponent />
            <div className="background-overlay"></div>
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
                  <ul>
                    <li>
                      <a
                        href="#"
                        title="YouTube"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Image
                          src="/icons/youtube.svg"
                          alt="YouTube Logo"
                          fill
                          sizes="24px"
                        />
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        title="Twitter"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Image
                          src="/icons/twitter.svg"
                          alt="Twitter Logo"
                          fill
                          sizes="24px"
                        />
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        title="Discord"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Image
                          src="/icons/discord.svg"
                          alt="Discord Logo"
                          fill
                          sizes="24px"
                        />
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        title="Twitch"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Image
                          src="/icons/twitch.svg"
                          alt="Twitch Logo"
                          fill
                          sizes="24px"
                        />
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </footer>
            <AuthModal />
          </AuthModalProvider>
        </AuthProvider>
        <Script src="https://wow.zamimg.com/js/tooltips.js" />
      </body>
    </html>
  );
}
