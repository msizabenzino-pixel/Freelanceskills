import { customType } from "drizzle-orm/pg-core";

/** A single portfolio project entry stored on a freelancer profile. */
export type PortfolioProject = {
  id: string;
  title: string;
  description?: string;
  link: string;
  technologies: string[];
};

/**
 * A `text` column that transparently serializes/deserializes JSON.
 *
 * The underlying Postgres column stays `text` (so no migration is needed for
 * existing JSON-string data), but Drizzle hands you the parsed value on read
 * and stringifies it on write. This eliminates manual JSON.parse/JSON.stringify
 * at every API boundary.
 */
function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&#x2F;/g, "/")
    .replace(/&#x27;/g, "'")
    .replace(/&#x22;/g, '"')
    .replace(/&#x3C;/g, "<")
    .replace(/&#x3E;/g, ">")
    .replace(/&#x26;/g, "&")
    .replace(/&#x2B;/g, "+")
    .replace(/&#x2C;/g, ",")
    .replace(/&#x3B;/g, ";")
    .replace(/&#x3A;/g, ":");
}

export const jsonText = <TData>(name: string) =>
  customType<{ data: TData; driverData: string }>({
    dataType() {
      return "text";
    },
    toDriver(value: TData): string {
      return JSON.stringify(value ?? null);
    },
    fromDriver(value: string): TData {
      if (value == null) return value as unknown as TData;
      if (typeof value !== "string") return value as TData;
      try {
        const parsed = JSON.parse(decodeHtmlEntities(value)) as TData;
        // Also recursively decode nested strings (e.g., link fields inside arrays)
        const deepDecode = (obj: any): any => {
          if (typeof obj === "string") return decodeHtmlEntities(obj);
          if (Array.isArray(obj)) return obj.map(deepDecode);
          if (obj && typeof obj === "object") {
            const out: any = {};
            for (const [k, v] of Object.entries(obj)) {
              out[k] = deepDecode(v);
            }
            return out;
          }
          return obj;
        };
        return deepDecode(parsed);
      } catch {
        return decodeHtmlEntities(value) as unknown as TData;
      }
    },
  })(name);
