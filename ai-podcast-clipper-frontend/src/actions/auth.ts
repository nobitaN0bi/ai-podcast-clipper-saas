"use server";

import { hashPassword } from "~/lib/auth";
import { signupSchema, type SignupFormValues } from "~/schemas/auth";
import { db } from "~/server/db";
import Stripe from "stripe";
import { env } from "~/env";
import { v4 as uuidv4 } from "uuid";

type SignupResult = {
  success: boolean;
  error?: string;
};

export async function signUp(data: SignupFormValues): Promise<SignupResult> {
  const validationResult = signupSchema.safeParse(data);
  if (!validationResult.success) {
    return {
      success: false,
      error: validationResult.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const { email, password } = validationResult.data;

  try {
    const existingUser = await db.user.findUnique({ where: { email } });

    if (existingUser) {
      return {
        success: false,
        error: "Email already in use",
      };
    }

    const hashedPassword = await hashPassword(password);

    // Generate a unique placeholder by default to prevent unique constraint violations
    // This allows developer to test signup without a valid Stripe key
    let stripeCustomerId = `dev_cus_${uuidv4()}`;

    if (env.STRIPE_SECRET_KEY && !env.STRIPE_SECRET_KEY.includes("placeholder")) {
      try {
        const stripe = new Stripe(env.STRIPE_SECRET_KEY);
        const stripeCustomer = await stripe.customers.create({
          email: email.toLowerCase(),
        });
        stripeCustomerId = stripeCustomer.id;
      } catch (e) {
        console.warn("Failed to create Stripe customer, using unique placeholder", e);
        // stripeCustomerId is already set to a unique dev ID above
      }
    }

    await db.user.create({
      data: {
        email,
        password: hashedPassword,
        stripeCustomerId,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Signup error:", error);
    return { success: false, error: error instanceof Error ? error.message : "An error occurred during signup" };
  }
}
