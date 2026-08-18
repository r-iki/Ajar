import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { oneTap } from "better-auth/plugins";

import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { env } from "@/lib/env";

const hasGoogleOAuth = Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
    usePlural: true,
  }),
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "student",
      },
      xp: {
        type: "number",
        defaultValue: 0,
      },
      locale: {
        type: "string",
        defaultValue: "id",
      },
      phone: {
        type: "string",
        required: false,
      },
      username: {
        type: "string",
        required: false,
      },
      bio: {
        type: "string",
        required: false,
      },
      biography: {
        type: "string",
        required: false,
      },
      location: {
        type: "string",
        required: false,
      },
      position: {
        type: "string",
        required: false,
      },
      availabilityStatus: {
        type: "string",
        required: false,
      },
      socialGithub: {
        type: "string",
        required: false,
      },
      socialLinkedin: {
        type: "string",
        required: false,
      },
      socialTwitter: {
        type: "string",
        required: false,
      },
      socialFacebook: {
        type: "string",
        required: false,
      },
      languages: {
        type: "string",
        required: false,
      },
      skills: {
        type: "string",
        required: false,
      },
    },

  },
  emailAndPassword: {
    enabled: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      const { sendVerificationEmail } = await import("@/lib/email/resend");
      await sendVerificationEmail({
        to: user.email,
        url,
        name: user.name,
      });
    },
  },
  socialProviders: hasGoogleOAuth
    ? {
        google: {
          clientId: env.GOOGLE_CLIENT_ID as string,
          clientSecret: env.GOOGLE_CLIENT_SECRET as string,
        },
      }
    : {},
  plugins: [
    nextCookies(),
    oneTap(),
  ],
  advanced: {
    crossSubDomainCookies: {
      enabled: !!env.COOKIE_DOMAIN,
      domain: env.COOKIE_DOMAIN,
    },
    trustedOrigins: env.TRUSTED_ORIGINS,
  },
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;

export async function getSession(customHeaders?: Headers): Promise<Session | null> {
  try {
    const { headers } = await import("next/headers");
    const h = customHeaders || (await headers());
    return (await auth.api.getSession({ headers: h })) as Session | null;
  } catch (err) {
    console.warn("[Auth] Safe getSession warning:", err instanceof Error ? err.message : err);
    return null;
  }
}
