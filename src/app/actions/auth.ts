"use server";

import { createSession } from "@/lib/session";
import { redirect } from "next/navigation";
import crypto from "crypto";

export async function login(
  _state: { message?: string } | undefined,
  formData: FormData,
) {
  "use server";
  const password = formData.get("password");

  if (!process.env.PASSWORD) {
    throw new Error("PASSWORD environment variable is not set.");
  }

  // 2. Prepare data
  if (password !== process.env.PASSWORD) {
    return {
      message: "Invalid credentials.",
    };
  }

  const userId = crypto.createHash("md5").update(password).digest("hex");

  await createSession(userId);

  redirect("/");
}
