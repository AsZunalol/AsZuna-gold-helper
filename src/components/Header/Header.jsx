"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
// This import path is correct and will work after we fix the other files.
import { useAuthModal } from "@/context/AuthModalContext";
import WowTokenPrice from "../WowTokenPrice/WowTokenPrice";

export default function Header() {
  const { data: session, status } = useSession();
  const { openModal } = useAuthModal();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const menuRef = useRef(null);
  const profileMenuRef = useRef(null);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/guides", label: "Guides" },
    { href: "/guides?category=Transmog", label: "Transmog" },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-gray-900 text-white shadow-lg">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="text-2xl font-bold text-yellow-400">
            Aszuna Gold Helper
          </Link>
          <div className="hidden md:flex ml-10 items-center">
            <WowTokenPrice />
          </div>
        </div>
        <div className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-yellow-400 transition-colors"
            >
              {link.label}
            </Link>
          ))}
          {status === "authenticated" ? (
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={toggleProfileMenu}
                className="focus:outline-none"
              >
                <img
                  src={session.user.image || "/default-avatar.png"}
                  alt="Profile"
                  className="w-10 h-10 rounded-full border-2 border-yellow-400"
                />
              </button>
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-xl z-20">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-white hover:bg-gray-700"
                  >
                    Profile
                  </Link>
                  {session.user.role === "admin" && (
                    <Link
                      href="/admin"
                      className="block px-4 py-2 text-sm text-white hover:bg-gray-700"
                    >
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={() => signOut()}
                    className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => openModal("login")}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded transition-colors"
            >
              Login
            </button>
          )}
        </div>
        <div className="md:hidden flex items-center" ref={menuRef}>
          <button onClick={toggleMenu} className="focus:outline-none">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16m-7 6h7"
              ></path>
            </svg>
          </button>
        </div>
      </nav>
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700"
              >
                {link.label}
              </Link>
            ))}
            {status === "authenticated" ? (
              <>
                <Link
                  href="/profile"
                  className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700"
                >
                  Profile
                </Link>
                {session.user.role === "admin" && (
                  <Link
                    href="/admin"
                    className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700"
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={() => signOut()}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => openModal("login")}
                className="w-full text-left block bg-yellow-500 hover:bg-yellow-600 text-black font-bold mt-2 py-2 px-4 rounded transition-colors"
              >
                Login
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
