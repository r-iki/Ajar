import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ShieldCheck, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="mt-auto border-t bg-card/60 backdrop-blur-md">
      <div className="mx-auto w-full max-w-6xl px-4 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand & About Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <Image
                src="/favicon.jpg"
                alt="Ajar Logo"
                width={32}
                height={32}
                className="size-8 rounded-xl object-cover shadow-xs border border-primary/20"
              />
              <span className="text-lg font-black tracking-tight text-foreground">{t("brandName")}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed font-medium">
              {t("tagline")}. Belajar dari modul terstruktur, kuis interaktif, dan raih sertifikat kompetensi industri.
            </p>
            <div className="flex items-center gap-2 rounded-2xl bg-muted/50 p-2.5 text-[11px] text-muted-foreground font-medium border border-border/50">
              <ShieldCheck className="size-4 text-emerald-500 shrink-0" />
              <span>DOKU Verified Merchant</span>
            </div>
          </div>

          {/* Product & Courses Links */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-foreground">{t("productsTitle")}</h3>
            <ul className="space-y-2.5 text-xs text-muted-foreground font-medium">
              <li>
                <Link href="/courses" className="transition-colors hover:text-primary">
                  {t("courses")}
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="transition-colors hover:text-primary">
                  {t("leaderboard")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Policy Links */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-foreground">{t("legalTitle")}</h3>
            <ul className="space-y-2.5 text-xs text-muted-foreground font-medium">
              <li>
                <Link href="/privacy" className="transition-colors hover:text-primary">
                  {t("privacy")}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="transition-colors hover:text-primary">
                  {t("terms")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="transition-colors hover:text-primary">
                  {t("contact")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Business Contact */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-foreground">{t("contactTitle")}</h3>
            <ul className="space-y-2.5 text-xs text-muted-foreground font-medium">
              <li className="flex items-center gap-2">
                <Mail className="size-3.5 text-primary shrink-0" />
                <a href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@example.com"}`} className="hover:text-primary transition-colors">
                  {process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@example.com"}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="size-3.5 text-primary shrink-0" />
                <a href={`https://wa.me/${(process.env.NEXT_PUBLIC_SUPPORT_PHONE || "+628000000000").replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">
                  {process.env.NEXT_PUBLIC_SUPPORT_PHONE || "+62 800-0000-0000"}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="size-3.5 text-primary shrink-0 mt-0.5" />
                <span className="leading-tight">{process.env.NEXT_PUBLIC_COMPANY_ADDRESS || "Bandung, Indonesia"}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & payment disclaimer */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-dashed pt-6 text-center text-xs text-muted-foreground sm:flex-row sm:text-left">
          <div>
            &copy; {new Date().getFullYear()} <span className="font-bold text-foreground">{t("brandName")}</span>. {t("rights")}
          </div>
          <div className="text-[11px] text-muted-foreground max-w-md">
            {t("paymentNote")}
          </div>
        </div>
      </div>
    </footer>
  );
}
