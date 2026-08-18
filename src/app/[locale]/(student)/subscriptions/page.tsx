import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { CreditCard, Info, Plus, ChevronRight, CheckCircle2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import SectionTabBar from "@/components/layout/SectionTabBar";
import { getLocale, getTranslations } from "next-intl/server";
import { tDb } from "@/lib/i18n/db-helper";

export default async function SubscriptionsPage() {
  const locale = await getLocale();
  const t = await getTranslations("student");
  const tNav = await getTranslations("nav");
  const session = await getSession();

  if (!session) {
    redirect(`/${locale}/sign-in`);
  }

  // Fetch user's paid enrollments
  const paidEnrollments = await db.query.enrollments.findMany({
    where: (e, { eq, and }) => and(eq(e.userId, session.user.id), eq(e.paymentStatus, "paid")),
    with: {
      course: true,
    },
    orderBy: (e, { desc }) => [desc(e.enrolledAt)],
  });

  const activeCourses = paidEnrollments.length;

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-700">
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
           <CreditCard size={16} />
           <span className="text-xs font-black uppercase tracking-widest">{tNav("subscriptions")}</span>
        </div>
        <h1 className="text-3xl font-black text-foreground tracking-tight uppercase">{t("subscriptions")}</h1>
        <p className="text-muted-foreground font-medium">{t("subscriptionStatus")}</p>
      </header>

      <SectionTabBar tabs={[
        { label: tNav("transactions"), href: "/transactions" },
        { label: tNav("subscriptions"), href: "/subscriptions" },
      ]} />

      {/* Subscription Status Card */}
      <div className="bg-card border border-border rounded-[2.5rem] p-8 flex flex-col gap-8 backdrop-blur-sm relative overflow-hidden group shadow-sm">
         {/* Decorative gradient */}
         <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 blur-[100px] group-hover:bg-primary/10 transition-all duration-700" />
         
         <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-muted rounded-lg text-muted-foreground">
                  <Info size={16} />
               </div>
               <h2 className="text-sm font-black text-foreground uppercase tracking-widest">{t("subscriptionStatus")}</h2>
            </div>
            <Link href="/courses" className="px-5 py-2.5 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-600 transition-all flex items-center gap-2 shadow-xl shadow-emerald-500/10">
               <Plus size={14} />
               {t("addCourse")}
            </Link>
         </div>

         <div className="flex items-center justify-between relative z-10 bg-muted/30 border border-border/50 p-8 rounded-[2rem]">
            <div className="flex flex-col gap-2">
               <span className="text-5xl font-black text-foreground">{activeCourses}</span>
               <span className="text-sm font-bold text-foreground">{t("activePremiumCourses")}</span>
               <span className="text-xs text-muted-foreground font-medium italic mt-2">
                 {activeCourses > 0
                   ? t("activePaidCount", { count: activeCourses })
                   : t("noActivePaid")}
               </span>
            </div>
            <div className={`p-6 rounded-3xl border ${activeCourses > 0 ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-muted border-border text-muted-foreground"}`}>
               {activeCourses > 0 ? <CheckCircle2 size={32} /> : <Info size={32} />}
            </div>
         </div>
      </div>

      {/* Active Courses List */}
      <div className="bg-card border border-border rounded-[2.5rem] p-8 flex flex-col gap-6 backdrop-blur-sm shadow-sm">
         <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-foreground uppercase tracking-widest">{t("activeCoursesTitle")}</h2>
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{t("premiumAccess")}</span>
         </div>

         {paidEnrollments.length > 0 ? (
           <div className="space-y-3">
             {paidEnrollments.map((enrollment) => (
               <div key={enrollment.id} className="flex items-center justify-between p-5 rounded-2xl border border-border/60 bg-muted/20 group hover:border-emerald-500/30 transition-all">
                 <div className="flex items-center gap-4">
                   {enrollment.course.thumbnail && (
                     <img src={enrollment.course.thumbnail} alt={tDb(enrollment.course.title, locale)} className="w-12 h-12 rounded-xl object-cover" />
                   )}
                   <div className="flex flex-col">
                     <span className="text-sm font-black text-foreground">{tDb(enrollment.course.title, locale)}</span>
                     <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                       {t("enrolledOn", { date: new Date(enrollment.enrolledAt).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" }) })}
                     </span>
                   </div>
                 </div>
                 <div className="flex items-center gap-3">
                   <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[8px] font-black uppercase tracking-widest rounded-full">{t("activeStatus")}</span>
                   <Link href="/my-courses" className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                     <ChevronRight size={16} />
                   </Link>
                 </div>
               </div>
             ))}
           </div>
         ) : (
           <div className="flex flex-col items-center justify-center py-20 bg-blue-500/5 border border-blue-500/20 rounded-[2.5rem] gap-6">
              <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500">
                 <Info size={32} />
              </div>
              <div className="text-center space-y-2">
                 <p className="text-lg font-black text-foreground">{t("noPremiumCourses")}</p>
                 <p className="text-sm text-muted-foreground max-w-sm">{t("noPremiumCoursesDesc")}</p>
              </div>
              <Link href="/courses" className="flex items-center gap-2 text-xs font-black text-blue-500 uppercase tracking-widest hover:text-blue-400 transition-colors">
                 {t("browseCoursesBtn")} <ChevronRight size={14} />
              </Link>
           </div>
         )}
      </div>
    </div>
  );
}

