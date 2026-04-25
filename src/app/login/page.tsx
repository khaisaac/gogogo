import AuthForm from "@/components/AuthForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login — Trekking Mount Rinjani",
  description:
    "Sign in to your Trekking Mount Rinjani account to manage your bookings and trekking adventures.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;
  return <AuthForm callbackUrl={callbackUrl} />;
}
