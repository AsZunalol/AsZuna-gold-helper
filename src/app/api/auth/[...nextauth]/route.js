import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";

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

        // On successful authorization, return the full user object.
        return user;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    // This callback is invoked when a JWT is created.
    async jwt({ token, user }) {
      // The `user` object is only available on the first login.
      // We persist the user's data to the token here.
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.region = user.region;
        token.realm = user.realm;
        // THE FIX: Map the `imageUrl` from your database to the standard `image` property of the token.
        token.image = user.imageUrl;
      }
      return token;
    },
    // This callback is invoked when a session is checked.
    async session({ session, token }) {
      // We pass the data from the token to the client-side session object.
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.region = token.region;
        session.user.realm = token.realm;
        // THE FIX: Map the `image` from the token to the standard `session.user.image` property.
        session.user.image = token.image;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
