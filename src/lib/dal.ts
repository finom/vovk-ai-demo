import { cookies } from "next/headers";
import { decrypt } from "./session";
import { cache } from "react";
import { redirect } from "next/navigation";
import crypto from "crypto";

const getSession = async () => {
  const cookie = (await cookies()).get("session")?.value;
  const session = await decrypt(cookie);

  return session;
};

export const isLoggedIn = async () => {
  if (!process.env.PASSWORD) return true;
  const session = await getSession();
  const userId = crypto
    .createHash("md5")
    .update(process.env.PASSWORD)
    .digest("hex");
  return session?.userId === userId;
};

export const verifySession = cache(async () => {
  if (!(await isLoggedIn())) {
    redirect("/login");
  }
});
