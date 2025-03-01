import { redirect } from "next/navigation";

export default async function VerifyRequest() {
  if (process.env.NEXT_PUBLIC_VERCEL_ENV === "development" || process.env.NEXT_PUBLIC_VERCEL_ENV === "preview") {
    redirect("https://ethereal.email/messages");
  }

  redirect("/");
}
