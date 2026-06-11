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
        return JSON.parse(value) as TData;
      } catch {
        return value as unknown as TData;
      }
    },
  })(name);
