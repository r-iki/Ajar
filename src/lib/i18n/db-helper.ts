/**
 * Utility helper untuk localization berbasis kolom JSONB di database Drizzle.
 * Mendukung N-languages dengan fallback otomatis yang aman.
 */

export type MultiLangField = Record<string, string> | string | null | undefined;

/**
 * Mengambil teks localized dari kolom JSONB database.
 * @param field - Nilai kolom dari database (biasanya Record<string, string>, atau string lama)
 * @param locale - Kode bahasa aktif (misal: "id", "en", "es", "ja")
 * @param fallbackLocale - Bahasa cadangan jika bahasa yang diminta tidak tersedia (default: "id")
 */
export function tDb(
  field: MultiLangField,
  locale: string = "id",
  fallbackLocale: string = "id"
): string {
  if (!field) return "";

  // Jika data di database masih berupa string tunggal (belum bermigrasi sepenuhnya atau fallback string biasa)
  if (typeof field === "string") {
    return field;
  }

  if (typeof field === "object") {
    // 1. Coba ambil dari locale aktif yang diminta
    if (field[locale] && typeof field[locale] === "string" && field[locale].trim() !== "") {
      return field[locale];
    }

    // 2. Coba ambil dari fallback locale ("id")
    if (field[fallbackLocale] && typeof field[fallbackLocale] === "string" && field[fallbackLocale].trim() !== "") {
      return field[fallbackLocale];
    }

    // 3. Coba ambil dari "en" jika fallback bukan en
    if (field["en"] && typeof field["en"] === "string" && field["en"].trim() !== "") {
      return field["en"];
    }

    // 4. Ambil string pertama apapun yang tersedia di dalam object
    for (const key of Object.keys(field)) {
      const val = field[key];
      if (typeof val === "string" && val.trim() !== "") {
        return val;
      }
    }
  }

  return "";
}

/**
 * Mengambil nilai spesifik untuk bahasa tertentu (dipakai oleh form editor di Instructor Studio).
 * @param field - Nilai kolom dari database
 * @param lang - Kode bahasa yang ingin diedit di tab (misal: "id", "en")
 */
export function getLangVal(field: MultiLangField, lang: string): string {
  if (!field) return "";
  if (typeof field === "string") {
    return lang === "id" ? field : "";
  }
  if (typeof field === "object") {
    return field[lang] || "";
  }
  return "";
}

/**
 * Memastikan input tersimpan dalam format objek Record<string, string> yang bersih untuk JSONB.
 * @param input - Data input dari form/action
 * @param fallbackStr - String cadangan jika input kosong
 */
export function toDbJson(
  input: MultiLangField,
  fallbackStr: string = ""
): Record<string, string> {
  if (!input) {
    return { id: fallbackStr, en: fallbackStr };
  }
  if (typeof input === "string") {
    return { id: input, en: input };
  }
  if (typeof input === "object") {
    const clean: Record<string, string> = {};
    for (const [k, v] of Object.entries(input)) {
      if (typeof v === "string") {
        clean[k] = v;
      } else if (v !== null && v !== undefined) {
        clean[k] = String(v);
      }
    }
    // Pastikan minimal ada id atau en
    if (!clean.id && clean.en) clean.id = clean.en;
    if (!clean.en && clean.id) clean.en = clean.id;
    if (!clean.id && !clean.en) {
      clean.id = fallbackStr;
      clean.en = fallbackStr;
    }
    return clean;
  }
  return { id: fallbackStr, en: fallbackStr };
}

/**
 * Mengekstrak data multi-bahasa dari FormData (mendukung prefixId/prefixEn, prefix_lang, atau string JSON).
 * @param formData - FormData dari input server action
 * @param prefix - Nama field dasar (misal: "title", "description", "content", "name", "question", "text")
 * @param defaultVal - Nilai default jika kosong
 */
export function getFormMultiLang(
  formData: FormData,
  prefix: string,
  defaultVal: string = ""
): Record<string, string> {
  const result: Record<string, string> = {};

  // 1. Coba baca sebagai JSON string langsung (misal dari input hidden atau payload studio baru)
  const jsonStr = formData.get(prefix) as string;
  if (jsonStr && typeof jsonStr === "string" && jsonStr.trim().startsWith("{")) {
    try {
      const parsed = JSON.parse(jsonStr);
      if (typeof parsed === "object" && parsed !== null) {
        return toDbJson(parsed, defaultVal);
      }
    } catch (e) {
      // Abaikan jika bukan JSON valid
    }
  }

  // 2. Baca format camelCase lama (misal: titleId, titleEn) atau snake_case (title_id, title_en)
  const idVal = (formData.get(`${prefix}Id`) || formData.get(`${prefix}_id`) || (typeof jsonStr === "string" && !jsonStr.startsWith("{") ? jsonStr : "")) as string;
  const enVal = (formData.get(`${prefix}En`) || formData.get(`${prefix}_en`) || idVal) as string;

  if (idVal && idVal.trim() !== "") result["id"] = idVal.trim();
  if (enVal && enVal.trim() !== "") result["en"] = enVal.trim();

  // 3. Baca format dinamis untuk N-bahasa lain (misal: title_es, title_ja, title_ar)
  formData.forEach((val, key) => {
    if (key.startsWith(`${prefix}_`) && key !== `${prefix}_id` && key !== `${prefix}_en`) {
      const lang = key.replace(`${prefix}_`, "").toLowerCase().trim();
      if (lang && typeof val === "string" && val.trim() !== "") {
        result[lang] = val.trim();
      }
    }
  });

  if (Object.keys(result).length === 0) {
    result["id"] = defaultVal;
    result["en"] = defaultVal;
  } else {
    if (!result["en"] && result["id"]) result["en"] = result["id"];
    if (!result["id"] && result["en"]) result["id"] = result["en"];
  }

  return result;
}

