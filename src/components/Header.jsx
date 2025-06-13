"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useAuthModal } from "@/context/AuthModalContext";

export default function Header() {
  const { data: session, status } = useSession();
  const { openModal } = useAuthModal(); // Get the function to open the modal
  const pathname = usePathname();

  const isActive = (path) => {
    // This correctly highlights "All Guides" even on a single guide page
    if (path === "/guides" && pathname.startsWith("/guide")) {
      return true;
    }
    return pathname === path;
  };

  // Icons for the user menu
  const personIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="24px"
      viewBox="0 0 24 24"
      width="24px"
      fill="currentColor"
    >
      <path d="M0 0h24v24H0V0z" fill="none" />
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  );
  const profileIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="20px"
      viewBox="0 0 24 24"
      width="20px"
      fill="currentColor"
    >
      <path d="M0 0h24v24H0V0z" fill="none" />
      <path d="M12 5.9c1.16 0 2.1.94 2.1 2.1s-.94 2.1-2.1 2.1S9.9 9.16 9.9 8s.94-2.1 2.1-2.1m0 9c2.97 0 6.1 1.46 6.1 2.1v1.1H5.9V17c0-.64 3.13-2.1 6.1-2.1M12 4C9.79 4 8 5.79 8 8s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 9c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4z" />
    </svg>
  );
  const logoutIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="20px"
      viewBox="0 0 24 24"
      width="20px"
      fill="currentColor"
    >
      <path d="M0 0h24v24H0V0z" fill="none" />
      <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
    </svg>
  );
  const loginIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="20px"
      viewBox="0 0 24 24"
      width="20px"
      fill="currentColor"
    >
      <path d="M0 0h24v24H0z" fill="none" />
      <path d="M11 7L9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5zm9 12h-8v-2h8v2zm0-4h-8v-2h8v2zm0-4h-8V9h8v2zM20 3H4c-1.1 0-2 .9-2 2v2h2V5h16v14h-2v2h2c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
    </svg>
  );
  const registerIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="20px"
      viewBox="0 0 24 24"
      width="20px"
      fill="currentColor"
    >
      <path d="M0 0h24v24H0z" fill="none" />
      <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  );

  return (
    <header>
      <div className="header-left">{/* Your Logo can go here */}</div>

      <nav>
        <Link href="/" className={isActive("/") ? "nav-active" : ""}>
          Home
        </Link>
        <Link
          href="/guides"
          className={isActive("/guides") ? "nav-active" : ""}
        >
          All Guides
        </Link>
        <Link
          href="/routes"
          className={isActive("/routes") ? "nav-active" : ""}
        >
          Routes
        </Link>
      </nav>

      <div className="header-right">
        {session?.user.role === "ADMIN" && (
          <Link href="/admin" className="nav-button">
            Create Content
          </Link>
        )}

        <div className="user-menu-container">
          <div className="user-menu-trigger">
            {personIcon}
            <span>{session ? session.user.name : "Account"}</span>
          </div>

          <div className="user-dropdown">
            {status === "loading" ? (
              <p>Loading...</p>
            ) : session ? (
              // If user is logged in
              <>
                <Link href="/profile">
                  {profileIcon}
                  <span>Profile</span>
                </Link>
                <div className="divider"></div>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    signOut({ callbackUrl: "/" });
                  }}
                >
                  {logoutIcon}
                  <span>Logout</span>
                </a>
              </>
            ) : (
              // If user is logged out
              <>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    openModal("login");
                  }}
                >
                  {loginIcon}
                  <span>Login</span>
                </a>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    openModal("register");
                  }}
                >
                  {registerIcon}
                  <span>Register</span>
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
