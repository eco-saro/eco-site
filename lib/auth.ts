import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { connectToDatabase } from "@/lib/mongoose";
import { User } from "@/models/user";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      await connectToDatabase();

      const existingUser = await User.findOne({ email: user.email });
      if (!existingUser) {
        await User.create({
          name: user.name,
          email: user.email,
          image: user.image || "",
          role: "buyer",
          isEmailVerified: true,
          authType: account?.provider || "google",
        });
      }

      return true;
    },

    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.sub as string;
        session.user.role = token.role as string;
      }
      return session;
    },

    async jwt({ token, user, account }) {
      if (user) {
        const dbUser = await User.findOne({ email: user.email });
        if (dbUser) {
          token.sub = dbUser._id.toString();
          token.role = dbUser.role;
        }
      }

      const existingUser = await User.findById(token.sub);
      if (existingUser) {
        token.role = existingUser.role;
      }

      return token;
    },
  },

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

