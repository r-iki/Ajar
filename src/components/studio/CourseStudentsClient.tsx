"use client";

import { useState } from "react";
import { 
  Users, 
  Search, 
  Mail, 
  Calendar, 
  GraduationCap, 
  ArrowLeft, 
  UserPlus, 
  Check, 
  X, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  Loader2, 
  MoreVertical 
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { 
  approveStudentEnrollment, 
  rejectStudentEnrollment, 
  removeStudentFromCourse, 
  manualEnrollStudent 
} from "@/actions/student-management";
import { cn } from "@/lib/utils";

type StudentData = {
  enrollmentId: string;
  userId: string;
  name: string;
  email: string;
  image: string | null;
  enrolledAt: Date;
  completedAt: Date | null;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  progress: number;
};

interface CourseStudentsClientProps {
  courseId: string;
  courseTitle: string;
  enrollmentType: "public" | "manual";
  initialStudents: StudentData[];
}

export function CourseStudentsClient({
  courseId,
  courseTitle,
  enrollmentType,
  initialStudents,
}: CourseStudentsClientProps) {
  const t = useTranslations("studio");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  const [students, setStudents] = useState<StudentData[]>(initialStudents);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "active" | "pending" | "completed">("all");
  
  // Modal State for Manual Enrollment
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [studentEmail, setStudentEmail] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Filter calculations
  const pendingStudents = students.filter(s => s.paymentStatus === "pending");
  const activeStudents = students.filter(s => s.paymentStatus === "paid");
  const completedStudents = students.filter(s => s.completedAt !== null);

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    if (activeTab === "active") return student.paymentStatus === "paid";
    if (activeTab === "pending") return student.paymentStatus === "pending";
    if (activeTab === "completed") return student.completedAt !== null;
    return true;
  });

  const avgProgress = activeStudents.length > 0
    ? Math.round(activeStudents.reduce((acc, s) => acc + s.progress, 0) / activeStudents.length)
    : 0;

  // Actions
  const handleApprove = async (enrollmentId: string) => {
    try {
      setActionLoading(enrollmentId);
      await approveStudentEnrollment(enrollmentId);
      setStudents(prev => prev.map(s => s.enrollmentId === enrollmentId ? { ...s, paymentStatus: "paid" } : s));
      toast.success(tCommon("success"));
    } catch (err: any) {
      toast.error(err.message || tCommon("error"));
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (enrollmentId: string) => {
    if (!confirm(t("removeStudentConfirm"))) return;
    try {
      setActionLoading(enrollmentId);
      await rejectStudentEnrollment(enrollmentId);
      setStudents(prev => prev.filter(s => s.enrollmentId !== enrollmentId));
      toast.success(tCommon("success"));
    } catch (err: any) {
      toast.error(err.message || tCommon("error"));
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemove = async (enrollmentId: string) => {
    if (!confirm(t("removeStudentConfirm"))) return;
    try {
      setActionLoading(enrollmentId);
      await removeStudentFromCourse(enrollmentId);
      setStudents(prev => prev.filter(s => s.enrollmentId !== enrollmentId));
      toast.success(tCommon("success"));
    } catch (err: any) {
      toast.error(err.message || tCommon("error"));
    } finally {
      setActionLoading(null);
    }
  };

  const handleManualEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentEmail.trim()) return;

    try {
      setActionLoading("manual-enroll");
      const res = await manualEnrollStudent(courseId, studentEmail.trim());
      if (res.success) {
        toast.success(`Berhasil mendaftarkan ${res.userName || studentEmail}`);
        setIsAddModalOpen(false);
        setStudentEmail("");
        // Reload page data
        window.location.reload();
      }
    } catch (err: any) {
      toast.error(err.message || tCommon("error"));
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between border-b pb-8">
        <div className="space-y-2">
          <Link 
            href="/studio/courses"
            className="group flex items-center gap-2 text-xs font-black text-muted-foreground uppercase tracking-widest hover:text-primary transition-colors"
          >
            <ArrowLeft className="size-3 transition-transform group-hover:-translate-x-1" />
            {t("backToStudio")}
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-black tracking-tight leading-tight">
              {t("studentManagement")}: <span className="text-primary">{courseTitle}</span>
            </h1>
            <span className={cn(
              "px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full border",
              enrollmentType === "manual" 
                ? "bg-amber-500/10 text-amber-500 border-amber-500/20" 
                : "bg-primary/10 text-primary border-primary/20"
            )}>
              {enrollmentType === "manual" ? t("enrollmentManual") : t("enrollmentPublic")}
            </span>
          </div>
          <p className="text-muted-foreground text-xs font-medium">{t("studentManagementDesc")}</p>
        </div>

        {/* Action Button: Manual Enroll */}
        <div>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-xs font-black uppercase tracking-wider text-primary-foreground hover:bg-primary/90 transition-all shadow-md shadow-primary/20 active:scale-95"
          >
            <UserPlus className="size-4" />
            {t("manualEnrollBtn")}
          </button>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
        <div className="rounded-3xl border bg-card p-6 shadow-xs">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t("totalStudents")}</p>
          <p className="mt-1 text-3xl font-black">{activeStudents.length}</p>
        </div>
        <div className="rounded-3xl border bg-card p-6 shadow-xs relative overflow-hidden">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t("tabPending")}</p>
          <p className={cn("mt-1 text-3xl font-black", pendingStudents.length > 0 && "text-amber-500")}>
            {pendingStudents.length}
          </p>
          {pendingStudents.length > 0 && (
            <span className="absolute top-4 right-4 flex size-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full size-2 bg-amber-500"></span>
            </span>
          )}
        </div>
        <div className="rounded-3xl border bg-card p-6 shadow-xs">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t("completedStudents")}</p>
          <p className="mt-1 text-3xl font-black text-emerald-500">{completedStudents.length}</p>
        </div>
        <div className="rounded-3xl border bg-card p-6 shadow-xs">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t("avgProgress")}</p>
          <p className="mt-1 text-3xl font-black">{avgProgress}%</p>
        </div>
      </div>

      {/* Toolbar: Tabs & Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-muted/40 rounded-2xl border w-fit overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
              activeTab === "all" ? "bg-card text-foreground shadow-xs border" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t("tabAll")} ({students.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("active")}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
              activeTab === "active" ? "bg-card text-foreground shadow-xs border" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t("tabActive")} ({activeStudents.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("pending")}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5",
              activeTab === "pending" ? "bg-card text-foreground shadow-xs border" : "text-muted-foreground hover:text-foreground",
              pendingStudents.length > 0 && "text-amber-500 font-black"
            )}
          >
            {t("tabPending")}
            {pendingStudents.length > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-500 rounded-full text-[9px]">
                {pendingStudents.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("completed")}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
              activeTab === "completed" ? "bg-card text-foreground shadow-xs border" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t("tabCompleted")} ({completedStudents.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative min-w-[260px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("searchStudentPlaceholder")}
            className="w-full rounded-2xl border bg-card pl-10 pr-4 py-2.5 text-xs font-bold text-foreground focus:ring-2 focus:ring-primary/20 outline-hidden transition-all shadow-2xs"
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-hidden rounded-[2.5rem] border bg-card shadow-xl shadow-primary/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t("studentCol")}</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t("enrolledAtCol")}</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t("progressCol")}</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">{t("actionCol")}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredStudents.map((student) => {
                const isPending = student.paymentStatus === "pending";
                const isLoading = actionLoading === student.enrollmentId;

                return (
                  <tr key={student.enrollmentId} className="group transition-colors hover:bg-muted/30">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="relative size-12 shrink-0 overflow-hidden rounded-2xl bg-muted border-2 border-background shadow-xs">
                          {student.image ? (
                            <Image src={student.image} alt={student.name} fill sizes="48px" className="object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
                              <span className="font-black">{student.name?.[0]?.toUpperCase() || "U"}</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-black leading-tight text-sm text-foreground">{student.name}</p>
                            {isPending ? (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                {t("statusPendingApproval")}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                {t("statusActive")}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground font-medium mt-0.5">{student.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-6">
                      <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                        <Calendar className="size-3.5" />
                        {new Date(student.enrolledAt).toLocaleDateString(locale === "id" ? "id-ID" : "en-US", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </td>

                    <td className="p-6">
                      {isPending ? (
                        <span className="text-xs text-muted-foreground italic font-medium">
                          {t("statusPendingApproval")}
                        </span>
                      ) : (
                        <div className="w-48 space-y-2">
                          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                            <span>{student.progress}% {t("completed")}</span>
                            {student.completedAt && (
                              <span className="text-emerald-500 flex items-center gap-1">
                                <GraduationCap className="size-3" />
                                {t("statusGraduated")}
                              </span>
                            )}
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                            <div 
                              className={`h-full transition-all duration-500 ${student.progress === 100 ? 'bg-emerald-500' : 'bg-primary'}`} 
                              style={{ width: `${student.progress}%` }} 
                            />
                          </div>
                        </div>
                      )}
                    </td>

                    <td className="p-6 text-right">
                      {isLoading ? (
                        <div className="flex justify-end p-2">
                          <Loader2 className="size-4 animate-spin text-muted-foreground" />
                        </div>
                      ) : isPending ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleApprove(student.enrollmentId)}
                            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-[11px] font-black uppercase tracking-wider text-white hover:bg-emerald-700 transition-all shadow-xs active:scale-95"
                          >
                            <Check className="size-3.5" />
                            {t("approveBtn")}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReject(student.enrollmentId)}
                            className="flex items-center gap-1.5 rounded-xl border border-destructive/30 bg-destructive/10 px-3.5 py-2 text-[11px] font-black uppercase tracking-wider text-destructive hover:bg-destructive/20 transition-all active:scale-95"
                          >
                            <X className="size-3.5" />
                            {t("rejectBtn")}
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1">
                          <a
                            href={`mailto:${student.email}`}
                            className="rounded-xl p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                            title={t("contactStudentBtn")}
                          >
                            <Mail className="size-4" />
                          </a>
                          <button
                            type="button"
                            onClick={() => handleRemove(student.enrollmentId)}
                            className="rounded-xl p-2.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                            title={t("removeStudentBtn")}
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-20 text-center">
                    <div className="mx-auto size-16 rounded-full bg-muted flex items-center justify-center mb-4">
                      <Users className="size-8 text-muted-foreground/30" />
                    </div>
                    <p className="font-black text-lg text-foreground">{t("noStudentsTitle")}</p>
                    <p className="text-xs text-muted-foreground font-medium mt-1">{t("noStudentsDesc")}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Enroll Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="space-y-1">
                <h3 className="text-base font-black tracking-tight text-foreground">{t("manualEnrollTitle")}</h3>
                <p className="text-xs text-muted-foreground">{t("manualEnrollDesc")}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleManualEnroll} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-foreground">
                  Email Siswa
                </label>
                <input
                  type="email"
                  required
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  placeholder={t("studentEmailPlaceholder")}
                  className="w-full rounded-2xl border bg-muted/20 px-4 py-3 text-xs font-bold text-foreground focus:ring-2 focus:ring-primary/20 outline-hidden transition-all shadow-inner"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-xs font-black uppercase text-muted-foreground hover:bg-muted"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === "manual-enroll"}
                  className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-xs font-black uppercase text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20 disabled:opacity-50 active:scale-95"
                >
                  {actionLoading === "manual-enroll" ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <UserPlus className="size-3.5" />
                  )}
                  {t("enrollStudentSubmit")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
