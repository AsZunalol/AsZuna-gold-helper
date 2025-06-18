"use client";
import { SessionProvider } from "next-auth/react";

// This component's sole responsibility is to provide the NextAuth session context.
export default function AuthProvider({ children }) {
  return <SessionProvider>{children}</SessionProvider>;
}
