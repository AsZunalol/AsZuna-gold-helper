import { Montserrat, Lato } from "next/font/google";
import Image from "next/image";
import AuthProvider from "./AuthProvider";
import { AuthModalProvider } from "@/context/AuthModalContext";
import Header from "@/components/Header";
import AuthModal from "@/components/AuthModal";
import ParticlesComponent from "@/components/ParticlesComponent";
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
            {/* The particle component is now a true background */}
            <ParticlesComponent />

            {/* All content sits on top of the particles */}
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
                          width={24}
                          height={24}
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
                          width={24}
                          height={24}
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
                          width={24}
                          height={24}
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
                          width={24}
                          height={24}
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
      </body>
    </html>
  );
}
