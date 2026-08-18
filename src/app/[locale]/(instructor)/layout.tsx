import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default async function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  const locale = await getLocale();

  if (!session) {
    redirect(`/${locale}/sign-in`);
  }

  if (session.user.role !== "instructor" && session.user.role !== "admin") {
    redirect(`/${locale}/dashboard`);
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
        {children}
      </main>
      <Footer />
    </>
  );
}
