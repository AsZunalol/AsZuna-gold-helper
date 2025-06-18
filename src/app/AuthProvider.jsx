"use client";
import { SessionProvider } from "next-auth/react";

// This component's sole responsibility is to provide the NextAuth session context.
// It is clean and has no other dependencies on our custom contexts.
export default function AuthProvider({ children }) {
  return <SessionProvider>{children}</SessionProvider>;
}
