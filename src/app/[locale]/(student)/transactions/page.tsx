import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { FileText, LayoutGrid, ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { ResumePaymentButton } from "@/components/payment/ResumePaymentButton";
import SectionTabBar from "@/components/layout/SectionTabBar";
import { getLocale, getTranslations } from "next-intl/server";
import { tDb } from "@/lib/i18n/db-helper";

export default async function TransactionsPage() {
  const locale = await getLocale();
  const t = await getTranslations("student");
  const tNav = await getTranslations("nav");
  const session = await getSession();

  if (!session) {
    redirect(`/${locale}/sign-in`);
  }

  const payments = await db.query.payments.findMany({
    where: (p, { eq }) => eq(p.userId, session.user.id),
    with: {
      course: true,
    },
    orderBy: (p, { desc }) => [desc(p.createdAt)],
  });

  const statusConfig: Record<string, { label: string; className: string }> = {
    paid: { label: t("statusPaid"), className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
    pending: { label: t("statusPending"), className: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
    failed: { label: t("statusFailed"), className: "bg-red-500/10 text-red-500 border-red-500/20" },
    refunded: { label: "Refunded", className: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-700">
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
           <FileText size={16} />
           <span className="text-xs font-black uppercase tracking-widest">{tNav("transactions")}</span>
        </div>
        <h1 className="text-3xl font-black text-foreground tracking-tight uppercase">{t("transactions")}</h1>
        <p className="text-muted-foreground font-medium">{t("transactions")}</p>
      </header>

      <SectionTabBar tabs={[
        { label: tNav("transactions"), href: "/transactions" },
        { label: tNav("subscriptions"), href: "/subscriptions" },
      ]} />

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: t("totalTransactions"), value: payments.length, color: "text-foreground" },
          { label: t("successfulTransactions"), value: payments.filter(p => p.status === "paid").length, color: "text-emerald-500" },
          { label: t("pendingTransactions"), value: payments.filter(p => p.status === "pending").length, color: "text-amber-500" },
          { label: t("failedTransactions"), value: payments.filter(p => p.status === "failed").length, color: "text-red-500" },
        ].map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-2 shadow-xs">
            <span className={`text-3xl font-black ${stat.color}`}>{stat.value}</span>
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Main Content Card */}
      <div className="bg-card border border-border rounded-3xl p-6 flex flex-col gap-6 backdrop-blur-sm shadow-xs">
         {/* Scrollable Table */}
         <div className="overflow-x-auto -mx-2">
         <div className="min-w-[640px] px-2">
         <div className="bg-muted/30 border border-border/50 rounded-2xl overflow-hidden backdrop-blur-md">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="border-b border-border/50 bg-muted/50">
                     <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t("colNumber")}</th>
                     <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t("colCourse")}</th>
                     <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t("colTotal")}</th>
                     <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t("colStatus")}</th>
                     <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t("colDate")}</th>
                     <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right">{t("colAction")}</th>
                  </tr>
               </thead>
               <tbody>
                  {payments.length > 0 ? payments.map((payment, idx) => {
                    const status = statusConfig[payment.status] ?? { label: payment.status, className: "bg-muted text-muted-foreground border-border" };
                    return (
                      <tr key={payment.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors group">
                         <td className="px-6 py-5 text-[10px] font-black text-muted-foreground">{String(idx + 1).padStart(2, "0")}</td>
                         <td className="px-6 py-5">
                           <div className="flex items-center gap-3">
                             {payment.course.thumbnail && (
                               <img src={payment.course.thumbnail} alt="" className="w-10 h-10 rounded-xl object-cover" />
                             )}
                              <div>
                                <p className="text-xs font-black text-foreground">{tDb(payment.course.title, locale)}</p>
                                <p className="text-[10px] text-muted-foreground font-bold">ID: {payment.gatewayId || "—"}</p>
                              </div>
                           </div>
                         </td>
                         <td className="px-6 py-5">
                           <span className="text-sm font-black text-foreground">
                             {Number(payment.amount).toLocaleString(locale, { style: "currency", currency: payment.currency, maximumFractionDigits: 0 })}
                           </span>
                         </td>
                         <td className="px-6 py-5">
                           <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${status.className}`}>
                             {status.label}
                           </span>
                         </td>
                         <td className="px-6 py-5">
                           <span className="text-[10px] font-bold text-muted-foreground">
                             {new Date(payment.createdAt).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" })}
                           </span>
                         </td>
                         <td className="px-6 py-5 text-right">
                           {payment.status === "pending" ? (
                             <ResumePaymentButton courseSlug={payment.course.slug} />
                           ) : payment.status === "paid" ? (
                             <Link href="/my-courses" className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-blue-400 transition-colors flex items-center gap-1 justify-end">
                               {t("actionLearn")} <ChevronRight size={12} />
                             </Link>
                           ) : (
                             <span className="text-[10px] text-muted-foreground font-bold">—</span>
                           )}
                         </td>
                      </tr>
                    );
                  }) : (
                    <tr className="h-64">
                       <td colSpan={6} className="px-6 py-4">
                          <div className="flex flex-col items-center justify-center gap-6">
                             <div className="p-8 bg-muted rounded-full border border-border text-muted-foreground shadow-inner">
                                <LayoutGrid size={48} />
                             </div>
                             <div className="text-center space-y-2">
                                <p className="text-xl font-black text-foreground uppercase tracking-widest">{t("noTransactionsTitle")}</p>
                                <p className="text-xs text-muted-foreground font-bold uppercase tracking-[0.2em]">{t("noTransactionsDesc")}</p>
                             </div>
                             <Link href="/courses" className="px-8 py-3 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-primary/90 transition-all shadow-md">
                               {t("browseCourses")}
                             </Link>
                          </div>
                       </td>
                    </tr>
                  )}
               </tbody>
            </table>
         </div>
         </div>
         </div>
      </div>
    </div>
  );
}
