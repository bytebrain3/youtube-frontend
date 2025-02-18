// auth.ts
import { AuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import connectDB from "./db";
import User from "@/models/models.user";
import { v4 as uuidv4 } from "uuid";

export const authOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      authorization: {
        params: { scope: "read:user user:email read:org" },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        await connectDB();
        const user = await User.findOneAndUpdate(
          { github_id: profile.id.toString() },
          {

            $setOnInsert: {
              _id: uuidv4(),
              full_name: profile.name || "",
              email: profile.email || "",
              profile_image_url: profile.avatar_url || "",
              github_id: profile.id.toString(),
              login: profile.login,
              location: profile.location || "",
              last_synced: new Date(),
              username: profile.login,
            },

          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        token.uuid = user._id;
        token.username = profile.login;
      }
      return token;
    },

    async session({ session, token }) {
      if (token.uuid) {
        session.user.id = token.uuid;
        session.user.username = token.username;
      }
      return session;
    },
  },
  pages: {
    error: "/auth/error",
  },
};