import { redirect } from "next/navigation";

export default async function VerifyRequest() {
  if (process.env.NODE_ENV !== "development") {
    redirect("/");
  }

  redirect("https://ethereal.email/messages");
}
