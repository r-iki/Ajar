import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import { Mail, Phone, MapPin, MessageSquare, Clock, ShieldCheck } from "lucide-react";
import { ContactForm } from "@/components/contact/ContactForm";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("legal");
  return {
    title: `${t("contactTitle")} | ${process.env.NEXT_PUBLIC_BRAND_NAME || "Ajar"}`,
    description: t("contactSubtitle"),
  };
}

export default async function ContactPage() {
  const t = await getTranslations("legal");
  const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || "Ajar LMS";
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@example.com";
  const supportPhone = process.env.NEXT_PUBLIC_SUPPORT_PHONE || "+62 800-0000-0000";
  const cleanPhone = supportPhone.replace(/[^0-9]/g, "");
  const companyAddress = process.env.NEXT_PUBLIC_COMPANY_ADDRESS || "Bandung, Indonesia";

  return (
    <div className="mx-auto max-w-5xl space-y-12 pb-20 pt-6">
      {/* Header */}
      <header className="space-y-4 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border bg-primary/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-primary">
          <MessageSquare className="size-4" />
          {brandName} Support & Inquiry
        </div>
        <h1 className="text-4xl font-black tracking-tight sm:text-5xl bg-linear-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
          {t("contactTitle")}
        </h1>
        <p className="mx-auto max-w-2xl text-base text-muted-foreground font-medium sm:text-lg">
          {t("contactSubtitle")}
        </p>
      </header>

      <div className="grid gap-12 lg:grid-cols-5">
        {/* Contact Info Cards (2 cols) */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-[2.5rem] border bg-card p-8 shadow-lg space-y-6">
            <h2 className="text-2xl font-black tracking-tight">{t("businessInfo")}</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t("businessDesc")}
            </p>

            <div className="space-y-5 pt-2">
              <div className="flex items-start gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Mail className="size-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t("emailSupport")}</p>
                  <a href={`mailto:${supportEmail}`} className="text-sm font-black text-foreground hover:text-primary transition-colors">
                    {supportEmail}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
                  <Phone className="size-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t("phoneSupport")}</p>
                  <a href={`https://wa.me/${cleanPhone}`} target="_blank" rel="noreferrer" className="text-sm font-black text-foreground hover:text-primary transition-colors">
                    {supportPhone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500">
                  <MapPin className="size-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t("officeAddress")}</p>
                  <p className="text-xs font-medium leading-relaxed text-foreground">
                    {brandName}<br />
                    {companyAddress}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 border-t border-dashed pt-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-500">
                  <Clock className="size-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t("supportHours")}</p>
                  <p className="text-xs font-medium text-foreground whitespace-pre-line">
                    {t("supportHoursValue")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border bg-card/60 p-6 flex items-center gap-4 shadow-sm backdrop-blur-sm">
            <ShieldCheck className="size-8 text-primary shrink-0" />
            <div className="text-xs">
              <p className="font-bold text-foreground">{t("verifiedDokuMerchant")}</p>
              <p className="text-muted-foreground">{t("verifiedDokuMerchantDesc")}</p>
            </div>
          </div>
        </div>

        {/* Interactive Contact Form (3 cols) */}
        <div className="lg:col-span-3">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
