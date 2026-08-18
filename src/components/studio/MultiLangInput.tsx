"use client";

import React, { useState, useEffect } from "react";
import { getLangVal, type MultiLangField } from "@/lib/i18n/db-helper";
import { Plus, X, Globe, Copy, Check, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export interface LocaleOption {
  code: string;
  label: string;
  flag: string;
}

export const ALL_AVAILABLE_LOCALES: LocaleOption[] = [
  { code: "id", label: "Indonesia", flag: "🇮🇩" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "ja", label: "Japanese", flag: "🇯🇵" },
  { code: "es", label: "Spanish", flag: "🇪🇸" },
  { code: "zh", label: "Mandarin", flag: "🇨🇳" },
  { code: "ar", label: "Arabic", flag: "🇸🇦" },
  { code: "de", label: "German", flag: "🇩🇪" },
  { code: "fr", label: "French", flag: "🇫🇷" },
];

export interface MultiLangInputProps {
  label?: string;
  namePrefix: string;
  defaultValue?: MultiLangField;
  type?: "input" | "textarea";
  required?: boolean;
  placeholder?: string;
  rows?: number;
  className?: string;
  onChange?: (val: Record<string, string>) => void;
}

export function MultiLangInput({
  label,
  namePrefix,
  defaultValue,
  type = "input",
  required = false,
  placeholder = "",
  rows = 4,
  className = "",
  onChange,
}: MultiLangInputProps) {
  const t = useTranslations("common");

  // Determine active locales from defaultValue or default to ["id"]
  const [activeLocales, setActiveLocales] = useState<string[]>(() => {
    if (defaultValue && typeof defaultValue === "object") {
      const keys = Object.keys(defaultValue).filter(
        (k) => typeof defaultValue[k] === "string" && defaultValue[k].trim() !== ""
      );
      if (keys.length > 0) {
        return keys;
      }
    }
    return ["id"];
  });

  const [activeTab, setActiveTab] = useState<string>(() => {
    return activeLocales[0] || "id";
  });

  const [showAddMenu, setShowAddMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    if (defaultValue && typeof defaultValue === "object") {
      Object.entries(defaultValue).forEach(([k, v]) => {
        if (typeof v === "string") init[k] = v;
      });
    } else if (typeof defaultValue === "string" && defaultValue) {
      init["id"] = defaultValue;
    }
    return init;
  });

  // Sync if defaultValue changes
  useEffect(() => {
    if (defaultValue !== undefined) {
      const next: Record<string, string> = {};
      if (typeof defaultValue === "object" && defaultValue !== null) {
        Object.entries(defaultValue).forEach(([k, v]) => {
          if (typeof v === "string") next[k] = v;
        });
      } else if (typeof defaultValue === "string") {
        next["id"] = defaultValue;
      }
      setValues(next);

      const keys = Object.keys(next).filter((k) => next[k]?.trim() !== "");
      if (keys.length > 0) {
        setActiveLocales((prev) => Array.from(new Set([...prev, ...keys])));
      }
    }
  }, [defaultValue]);

  const handleValChange = (code: string, text: string) => {
    const nextVal = { ...values, [code]: text };
    setValues(nextVal);
    if (onChange) {
      onChange(nextVal);
    }
  };

  const handleAddLanguage = (code: string) => {
    if (!activeLocales.includes(code)) {
      setActiveLocales([...activeLocales, code]);
    }
    setActiveTab(code);
    setShowAddMenu(false);
  };

  const handleRemoveLanguage = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeLocales.length <= 1) {
      toast.error(t("multiLang.minOneError"));
      return;
    }

    const updated = activeLocales.filter((l) => l !== code);
    setActiveLocales(updated);
    
    const nextVal = { ...values };
    delete nextVal[code];
    setValues(nextVal);
    if (onChange) onChange(nextVal);

    if (activeTab === code) {
      setActiveTab(updated[0]);
    }
  };

  const handleCopyFromActive = () => {
    const currentText = values[activeTab] || "";
    if (!currentText.trim()) {
      toast.error(t("multiLang.emptyCopyError"));
      return;
    }

    const nextVal = { ...values };
    activeLocales.forEach((loc) => {
      if (!nextVal[loc] || !nextVal[loc].trim()) {
        nextVal[loc] = currentText;
      }
    });

    setValues(nextVal);
    if (onChange) onChange(nextVal);
    setCopied(true);
    toast.success(t("multiLang.copiedSuccess"));
    setTimeout(() => setCopied(false), 2000);
  };

  const getLocaleMeta = (code: string) => {
    return (
      ALL_AVAILABLE_LOCALES.find((l) => l.code === code) || {
        code,
        label: code.toUpperCase(),
        flag: "🌐",
      }
    );
  };

  const availableToAdd = ALL_AVAILABLE_LOCALES.filter(
    (l) => !activeLocales.includes(l.code)
  );

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header Info & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {label && (
          <label className="block text-xs font-black uppercase tracking-widest text-muted-foreground">
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}

        <div className="flex items-center gap-2">
          {/* Copy helper */}
          {activeLocales.length > 1 && (
            <button
              type="button"
              onClick={handleCopyFromActive}
              className="text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 bg-muted/50 hover:bg-muted px-2.5 py-1 rounded-lg border border-border/50"
              title={t("multiLang.copyToOther")}
            >
              {copied ? <Check className="size-3 text-green-500" /> : <Copy className="size-3" />}
              <span>{copied ? t("multiLang.copied") : t("multiLang.copyToOther")}</span>
            </button>
          )}

          {/* Add language button / dropdown */}
          {availableToAdd.length > 0 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowAddMenu(!showAddMenu)}
                className="text-[10px] font-black uppercase tracking-wider text-primary hover:bg-primary/10 transition-all flex items-center gap-1 px-2.5 py-1 rounded-lg border border-primary/20"
              >
                <Plus className="size-3" />
                <span>{t("multiLang.addLanguage")}</span>
                <ChevronDown className="size-3 opacity-60" />
              </button>

              {showAddMenu && (
                <div className="absolute right-0 top-full mt-1.5 w-44 rounded-2xl border border-border bg-card p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-2 py-1 text-[9px] font-black uppercase tracking-widest text-muted-foreground border-b border-border/50 mb-1">
                    {t("multiLang.selectLanguage")}
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-0.5 scrollbar-hide">
                    {availableToAdd.map((loc) => (
                      <button
                        key={loc.code}
                        type="button"
                        onClick={() => handleAddLanguage(loc.code)}
                        className="w-full text-left px-2.5 py-1.5 text-xs font-semibold rounded-xl hover:bg-primary/10 hover:text-primary flex items-center justify-between transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <span>{loc.flag}</span>
                          <span>{loc.label}</span>
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground uppercase">
                          {loc.code}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Hidden inputs for Server Action form serialization */}
      <input type="hidden" name={namePrefix} value={JSON.stringify(values)} />
      {activeLocales.map((code) => (
        <input
          key={code}
          type="hidden"
          name={`${namePrefix}${code.charAt(0).toUpperCase() + code.slice(1)}`}
          value={values[code] || ""}
        />
      ))}

      {/* Language Tabs Strip */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-muted/40 rounded-2xl border border-border/60">
        {activeLocales.map((code) => {
          const loc = getLocaleMeta(code);
          const isActive = activeTab === code;
          const hasContent = Boolean(values[code]?.trim());

          return (
            <div
              key={code}
              onClick={() => setActiveTab(code)}
              className={`group px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 select-none ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/80"
              }`}
            >
              <span>{loc.flag}</span>
              <span className="uppercase tracking-wider text-[11px]">{loc.label}</span>

              {/* Status dot / badge */}
              {hasContent ? (
                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-primary-foreground" : "bg-emerald-500"}`} />
              ) : (
                <span className={`text-[9px] px-1 rounded ${isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {t("multiLang.optional")}
                </span>
              )}

              {/* Close / Remove button if more than 1 locale */}
              {activeLocales.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => handleRemoveLanguage(code, e)}
                  title={t("multiLang.remove", { label: loc.label })}
                  className={`rounded-full p-0.5 opacity-60 hover:opacity-100 hover:bg-black/20 dark:hover:bg-white/20 transition-all ${
                    isActive ? "text-primary-foreground" : "text-muted-foreground"
                  }`}
                >
                  <X className="size-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Input / Textarea for the active language tab */}
      <div className="relative">
        {activeLocales.map((code) => {
          if (code !== activeTab) return null;
          const loc = getLocaleMeta(code);
          const isFirst = code === activeLocales[0];

          return type === "textarea" ? (
            <textarea
              key={code}
              rows={rows}
              required={required && isFirst && activeLocales.length === 1}
              value={values[code] || ""}
              onChange={(e) => handleValChange(code, e.target.value)}
              placeholder={`${placeholder} (${loc.label})...`}
              className="w-full rounded-2xl border border-border bg-background/50 px-4 py-3 text-sm font-medium text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-hidden transition-all resize-y shadow-xs"
            />
          ) : (
            <input
              key={code}
              type="text"
              required={required && isFirst && activeLocales.length === 1}
              value={values[code] || ""}
              onChange={(e) => handleValChange(code, e.target.value)}
              placeholder={`${placeholder} (${loc.label})...`}
              className="w-full rounded-2xl border border-border bg-background/50 px-4 py-3.5 text-sm font-medium text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-hidden transition-all shadow-xs"
            />
          );
        })}
      </div>
    </div>
  );
}
