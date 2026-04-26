import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("common");

  return (
    <footer className="mt-auto border-t bg-background/80">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 text-sm text-muted-foreground">
        {t("brand")} - {t("subtitle")}
      </div>
    </footer>
  );
}
