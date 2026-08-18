import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import NotificationsClient from "./NotificationsClient";

export default async function NotificationsPage() {
  const locale = await getLocale();
  const session = await getSession();

  if (!session) {
    redirect(`/${locale}/sign-in`);
  }

  return <NotificationsClient session={session} locale={locale} />;
}
