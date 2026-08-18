import { Document, Page, StyleSheet, Text, View, Image } from "@react-pdf/renderer";
import { tDb } from "@/lib/i18n/db-helper";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: "#ffffff",
  },
  container: {
    position: "relative",
    width: "100%",
    height: "100%",
    border: "16pt solid #0f172a",
    padding: 40,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    textAlign: "center",
  },
  cornerLeft: {
    position: "absolute",
    top: -40,
    left: -40,
    width: 100,
    height: 100,
    backgroundColor: "#0f172a",
    transform: "rotate(45deg)",
  },
  cornerRight: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 100,
    height: 100,
    backgroundColor: "#0f172a",
    transform: "rotate(45deg)",
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 10,
  },
  header: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  subHeading: {
    fontSize: 20,
    color: "#94a3b8",
    letterSpacing: 6,
    textTransform: "uppercase",
    fontWeight: "bold",
  },
  line: {
    height: 2,
    width: 60,
    backgroundColor: "#0f172a",
    marginTop: 8,
  },
  mainSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
  },
  label: {
    fontSize: 16,
    fontStyle: "italic",
    color: "#475569",
  },
  userName: {
    fontSize: 48,
    fontWeight: "heavy",
    color: "#0f172a",
    marginVertical: 10,
  },
  courseTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#334155",
    textTransform: "uppercase",
  },
  footer: {
    width: "100%",
    borderTop: "1pt solid #e2e8f0",
    paddingTop: 20,
    paddingHorizontal: 60,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerSide: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    gap: 2,
    width: "45%",
  },
  platformText: {
    marginTop: 10,
  },
  platformName: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#0f172a",
  },
  footerLabel: {
    fontSize: 8,
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  qrSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    width: "30%",
  },
  qrImage: {
    width: 50,
    height: 50,
  },
  qrLabel: {
    fontSize: 6,
    color: "#94a3b8",
    maxWidth: 80,
    textAlign: "center",
  },
  digitalSign: {
    fontSize: 7,
    color: "#10b981",
    fontWeight: "bold",
  },
  certInfo: {
    fontSize: 8,
    color: "#94a3b8",
    textAlign: "right",
  },
  rightSide: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    gap: 2,
    width: "45%",
  },
  signature: {
    width: 60,
    height: 30,
    marginVertical: 2,
  },
  
  // Curriculum Page Styles
  curriculumPage: {
    padding: 40,
    backgroundColor: "#ffffff",
  },
  curriculumHeader: {
    borderBottom: "1pt solid #0f172a",
    paddingBottom: 10,
    marginBottom: 20,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  curriculumTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0f172a",
  },
  curriculumLogo: {
    width: 30,
    height: 30,
  },
  moduleItem: {
    marginBottom: 12,
  },
  moduleTitleRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    padding: 5,
    marginBottom: 4,
  },
  moduleTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#0f172a",
  },
  moduleTime: {
    fontSize: 8,
    color: "#64748b",
    fontWeight: "bold",
  },
  lessonList: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
    paddingLeft: 10,
  },
  lessonItem: {
    fontSize: 8,
    color: "#64748b",
    width: "30%",
  },
});

type CertificateDocumentProps = {
  userName: string;
  courseTitle: string;
  certificateCode: string;
  issuedAt: string;
  certId: string;
  modules?: Array<{
    id: string;
    title?: any;
    titleId?: string;
    lessons: Array<{
      id: string;
      title?: any;
      titleId?: string;
      duration: number;
    }>;
  }>;
  expiryDate?: string | null;
  logoData?: string;
  ttdData?: string;
  locale?: string;
};

export function CertificateDocument({
  userName,
  courseTitle,
  certificateCode,
  issuedAt,
  modules = [],
  expiryDate,
  logoData,
  ttdData,
  locale = "id",
}: CertificateDocumentProps) {
  const formattedDate = new Date(issuedAt).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const logoPath = logoData;
  const ttdPath = ttdData;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const publicUrl = `${appUrl}/id/v/${certificateCode}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(publicUrl)}`;

  const formatMinutes = (mins: number) => {
    const hrs = Math.floor(mins / 60);
    const m = mins % 60;
    return hrs > 0 ? `${hrs} jam ${m} mnt` : `${m} mnt`;
  };

  const validUntil = expiryDate 
    ? new Date(expiryDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
    : "Selamanya";

  const totalTime = modules.reduce((acc, m) => acc + m.lessons.reduce((lAcc, l) => lAcc + (l.duration || 0), 0), 0);
  const signerName = process.env.NEXT_PUBLIC_SIGNER_NAME || "Lead Instructor";
  const signerTitle = process.env.NEXT_PUBLIC_SIGNER_TITLE || "CEO & Founder";
  const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || "Ajar LMS";
  const displayDomain = appUrl.replace(/^https?:\/\//, "");

  return (
    <Document
      title={`Sertifikat Kelulusan - ${userName}`}
      author={brandName}
      subject="Sertifikat Digital Bertandatangan Elektronik"
      keywords="digitally signed, ajar lms, certificate"
    >
      {/* Page 1: The Certificate (Landscape) */}
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.container}>
          <View style={styles.cornerLeft} />
          <View style={styles.cornerRight} />

          <View style={styles.header}>
            {logoPath && <Image src={logoPath} style={styles.logo} />}
            <Text style={styles.subHeading}>Certificate of Excellence</Text>
            <Text style={{ fontSize: 8, color: "#94a3b8", marginTop: 4, letterSpacing: 1, fontFamily: "Courier" }}>ID: {certificateCode}</Text>
            <View style={styles.line} />
          </View>

          <View style={styles.mainSection}>
            <Text style={styles.label}>This is to certify that</Text>
            <Text style={styles.userName}>{userName}</Text>
            <Text style={styles.label}>has successfully completed the course</Text>
            <Text style={styles.courseTitle}>{courseTitle}</Text>
          </View>

          <View style={styles.footer}>
            <View style={styles.footerSide}>
              <Text style={{ fontSize: 8, color: "#94a3b8", marginBottom: 2 }}>{formattedDate}</Text>
              {ttdPath && <Image src={ttdPath} style={styles.signature} />}
              <Text style={{ fontSize: 12, fontWeight: "bold", color: "#0f172a" }}>{signerName}</Text>
              <Text style={styles.footerLabel}>{signerTitle}</Text>
              <Text style={{ fontSize: 7, color: "#94a3b8", marginTop: 2 }}>{displayDomain}</Text>
            </View>

            <View style={styles.qrSection}>
            </View>

            <View style={styles.rightSide}>
              {qrCodeUrl && <Image src={qrCodeUrl} style={styles.qrImage} />}
              <View style={{ marginTop: 2, alignItems: "center" }}>
                <Text style={{ fontSize: 9, fontWeight: "bold", color: "#0f172a" }}>{brandName} Partner</Text>
              </View>
              <View style={{ height: 4 }} />
              <Text style={{ fontSize: 7, color: "#94a3b8", fontWeight: "bold" }}>BERLAKU SAMPAI: {validUntil.toUpperCase()}</Text>
            </View>
          </View>
        </View>
      </Page>

      {/* Page 2: Curriculum / Transkrip (Landscape) */}
      <Page size="A4" orientation="landscape" style={styles.curriculumPage}>
        <View style={styles.curriculumHeader}>
          <View>
            <Text style={styles.curriculumTitle}>Daftar Kompetensi & Transkrip Belajar</Text>
            <Text style={{ fontSize: 10, color: "#64748b" }}>{courseTitle}</Text>
          </View>
          <View style={{ textAlign: "right" }}>
            {logoPath && <Image src={logoPath} style={styles.curriculumLogo} />}
            <Text style={{ fontSize: 8, color: "#94a3b8", marginTop: 4 }}>Total: {formatMinutes(totalTime)}</Text>
          </View>
        </View>

        <View style={{ marginBottom: 15, display: "flex", flexDirection: "row", gap: 30 }}>
            <View>
                <Text style={{ fontSize: 8, color: "#94a3b8", textTransform: "uppercase" }}>Nama Siswa</Text>
                <Text style={{ fontSize: 10, fontWeight: "bold" }}>{userName}</Text>
            </View>
            <View>
                <Text style={{ fontSize: 8, color: "#94a3b8", textTransform: "uppercase" }}>ID Sertifikat</Text>
                <Text style={{ fontSize: 10, fontWeight: "bold" }}>{certificateCode}</Text>
            </View>
            <View>
                <Text style={{ fontSize: 8, color: "#94a3b8", textTransform: "uppercase" }}>Tanggal Terbit</Text>
                <Text style={{ fontSize: 10, fontWeight: "bold" }}>{formattedDate}</Text>
            </View>
        </View>

        <View>
            {modules.map((module, idx) => {
                const moduleTime = module.lessons.reduce((acc, l) => acc + (l.duration || 0), 0);
                return (
                    <View key={module.id} style={styles.moduleItem} wrap={false}>
                        <View style={styles.moduleTitleRow}>
                            <Text style={styles.moduleTitle}>{idx + 1}. {tDb(module.title || module.titleId, locale)}</Text>
                            <Text style={styles.moduleTime}>{formatMinutes(moduleTime)}</Text>
                        </View>
                        <View style={styles.lessonList}>
                            {module.lessons.map((lesson) => (
                                <Text key={lesson.id} style={styles.lessonItem}>• {tDb(lesson.title || lesson.titleId, locale)} ({lesson.duration}m)</Text>
                            ))}
                        </View>
                    </View>
                );
            })}
        </View>

        <View style={{ marginTop: "auto", borderTop: "1pt solid #e2e8f0", paddingTop: 8 }}>
            <Text style={{ fontSize: 7, color: "#94a3b8", textAlign: "center" }}>
                Halaman ini adalah lampiran resmi dari sertifikat ID {certificateCode}. Verifikasi keaslian dokumen dapat dilakukan di {displayDomain}/{locale}/v/{certificateCode}.
            </Text>
        </View>
      </Page>
    </Document>
  );
}
