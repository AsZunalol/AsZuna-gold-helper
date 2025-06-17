"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useAuthModal } from "@/context/AuthModalContext";
// Correct the import path to point inside the new folder
import WowTokenPrice from "@/components/WowTokenPrice/WowTokenPrice";
import { Shirt } from "lucide-react";

export default function Header() {
  const { data: session, status } = useSession();
  const { openModal } = useAuthModal();
  const pathname = usePathname();

  const isActive = (path) => {
    if (path === "/guides" && pathname.startsWith("/guide")) {
      return true;
    }
    return pathname === path;
  };

  // ... (the rest of your SVG icons and component code remains the same)
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
  const createGuideIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="20px"
      viewBox="0 0 24 24"
      width="20px"
      fill="currentColor"
    >
      <path d="M0 0h24v24H0z" fill="none" />
      <path d="M3 17.25V21h3.75L18 9.75 14.25 6l-10.5 10.5zm16.48-9.04c.32-.32.32-.85 0-1.17l-2.58-2.58c-.32-.32-.85-.32-1.17 0L15.25 4.5l3.75 3.75 1.48-1.48z" />
    </svg>
  );
  const manageGuideIcon = // New icon for "Manage Guides"
    (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height="20px"
        viewBox="0 0 24 24"
        width="20px"
        fill="currentColor"
      >
        <path d="M0 0h24v24H0z" fill="none" />
        <path d="M3 17.25V21h3.75L18 9.75 14.25 6 3 17.25zm16.48-9.04c.32-.32.32-.85 0-1.17l-2.58-2.58c-.32-.32-.85-.32-1.17 0L15.25 4.5l3.75 3.75 1.48-1.48zM20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H4V4h16v16z" />
      </svg>
    );

  const ownerHubIcon = // New icon for Owner Hub
    (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height="20px"
        viewBox="0 0 24 24"
        width="20px"
        fill="currentColor"
      >
        <path d="M0 0h24v24H0z" fill="none" />
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
      </svg>
    );

  return (
    <header>
      <div className="header-left">
        <WowTokenPrice />
      </div>

      <nav>
        <Link href="/" className={isActive("/") ? "nav-active" : ""}>
          Home
        </Link>
        <Link
          href="/guides"
          className={isActive("/guides") ? "nav-active" : ""}
        >
          Guides
        </Link>
        <Link
          href="/routes"
          className={isActive("/routes") ? "nav-active" : ""}
        >
          Routes
        </Link>
      </nav>

      <div className="header-right">
        {session?.user && ["ADMIN", "OWNER"].includes(session.user.role) && (
          <div className="admin-dropdown-container">
            <div className="admin-menu-trigger user-menu-trigger">
              <span>Admin</span>
            </div>
            <div className="user-dropdown">
              <Link href="/admin/create-guide">
                {createGuideIcon}
                <span>Create Guide</span>
              </Link>
              <Link href="/admin/create-transmog-guide">
                <Shirt size={16} style={{ marginRight: 8 }} />
                <span>Create Transmog Guide</span>
              </Link>
              <Link href="/admin/guides-list">
                {manageGuideIcon}
                <span>Manage Guides</span>
              </Link>
              <Link href="/admin/dashboard">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="20px"
                  viewBox="0 0 24 24"
                  width="20px"
                  fill="currentColor"
                >
                  <path d="M0 0h24v24H0z" fill="none" />
                  <path d="M19 5v2h-4V5h4zm-9 12h4v-2h-4v2zm-6 0h4v-2H4v2zm0-4h4v-2H4v2zm0-4h4V7H4v2zm9 8h4v-2h-4v2zm-3-4h4v-2h-4v2zm3-4h4V7h-4v2zm4 0v-2h-4V7h4zM4 19h18V3H4v16zM6 5h2v2H6V5zm0 4h2v2H6V9zm0 4h2v2H6v4h14V5h-2v2h-4v2h-4v2h-4v2z" />
                </svg>
                <span>Admin Dashboard</span>
              </Link>

              {session.user.role === "OWNER" && (
                <>
                  <div className="divider"></div>
                  <Link href="/admin/owner-hub">
                    {ownerHubIcon}
                    <span>Owner Hub</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}

        <div className="user-menu-container">
          <div className="user-menu-trigger">
            {personIcon}
            <span>{session ? session.user.name : "Login"}</span>
          </div>

          <div className="user-dropdown">
            {status === "loading" ? (
              <p style={{ padding: "0.75rem 1rem" }}>Loading...</p>
            ) : session ? (
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
