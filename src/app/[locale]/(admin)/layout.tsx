import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const locale = await getLocale();

  if (!session) {
    redirect(`/${locale}/sign-in`);
  }

  if (session.user.role !== "admin") {
    redirect(`/${locale}/dashboard`);
  }

  return (
    <div className="flex flex-col gap-8">
      {children}
    </div>
  );
}
