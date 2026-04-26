"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Download, Share2, Loader2, Check } from "lucide-react";

type CertificateActionsProps = {
  certId: string;
  courseName: string;
  userName: string;
};

export function CertificateActions({ certId, courseName, userName }: CertificateActionsProps) {
  const [downloading, setDownloading] = useState(false);
  const [shared, setShared] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      // Primary: download server-rendered PDF
      const res = await fetch(`/api/certificates/${certId}/download`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);

      const data = await res.blob();
      const blob = new Blob([data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `Sertifikat-${courseName.replace(/\s+/g, "-")}.pdf`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);

      toast.success("Sertifikat berhasil diunduh!");
    } catch (err) {
      console.error("PDF download failed, trying html2canvas fallback:", err);
      // Fallback: screenshot the visible certificate card
      try {
        const { default: html2canvas } = await import("html2canvas");
        const element = document.getElementById("certificate-card");
        if (!element) throw new Error("Certificate element not found");

        const canvas = await html2canvas(element, {
          scale: 3,
          useCORS: true,
          backgroundColor: "#ffffff",
          logging: false,
        });

        const link = document.createElement("a");
        link.download = `Sertifikat-${courseName.replace(/\s+/g, "-")}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();

        toast.success("Sertifikat diunduh sebagai gambar!");
      } catch (fallbackErr) {
        console.error(fallbackErr);
        toast.error("Gagal mengunduh sertifikat.");
      }
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareData = {
      title: "Sertifikat Kelulusan – Ajar LMS",
      text: `🎉 ${userName} telah berhasil menyelesaikan kursus "${courseName}" di Ajar LMS!`,
      url: shareUrl,
    };

    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
        toast.success("Berhasil dibagikan!");
      } else {
        throw new Error("Web Share API not available");
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return; // User cancelled – do nothing
      // Fallback: copy link
      try {
        await navigator.clipboard.writeText(shareUrl);
        setShared(true);
        toast.success("Link sertifikat disalin ke clipboard!");
        setTimeout(() => setShared(false), 3000);
      } catch {
        toast.error("Gagal membagikan sertifikat. Salin URL secara manual.");
      }
    }
  };

  return (
    <div className="flex flex-wrap gap-4 justify-center">
      <button
        id="btn-download-certificate"
        onClick={handleDownload}
        disabled={downloading}
        className="flex items-center gap-2 rounded-xl bg-slate-900 px-8 py-4 font-black text-white shadow-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-70 disabled:scale-100 dark:bg-white dark:text-slate-900"
      >
        {downloading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Download className="size-4" />
        )}
        {downloading ? "Mengunduh..." : "DOWNLOAD PDF"}
      </button>

      <button
        id="btn-share-certificate"
        onClick={handleShare}
        className="flex items-center gap-2 rounded-xl border px-8 py-4 font-black transition-all hover:bg-muted active:scale-95"
      >
        {shared ? (
          <Check className="size-4 text-green-500" />
        ) : (
          <Share2 className="size-4" />
        )}
        {shared ? "LINK DISALIN!" : "BAGIKAN"}
      </button>
    </div>
  );
}
