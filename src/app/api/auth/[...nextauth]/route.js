import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials.email || !credentials.password) {
          throw new Error("Please enter an email and password");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error("No user found with this email");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Incorrect password");
        }

        // Return the full user object, now including region and realm
        return {
          id: user.id,
          email: user.email,
          name: user.username,
          role: user.role,
          region: user.region, // <-- ADD THIS
          realm: user.realm, // <-- AND THIS
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    // This callback adds our custom data to the JWT
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.region = user.region; // <-- ADD THIS
        token.realm = user.realm; // <-- AND THIS
      }
      return token;
    },
    // This callback adds our custom data to the session object
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.region = token.region; // <-- ADD THIS
        session.user.realm = token.realm; // <-- AND THIS
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
