import {
  createLoader,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";
import { DEFAULT_PAGE } from "@/constants";

export const historySearchParams = {
  search: parseAsString
    .withDefault("")
    .withOptions({ clearOnDefault: true, shallow: true }),
  type: parseAsStringEnum(["semua", "teks", "dokumen"])
    .withDefault("semua")
    .withOptions({ clearOnDefault: true, shallow: true }),
  status: parseAsStringEnum(["semua", "penipuan", "normal", "belum-pasti"])
    .withDefault("semua")
    .withOptions({ clearOnDefault: true, shallow: true }),
  page: parseAsInteger
    .withDefault(DEFAULT_PAGE)
    .withOptions({ clearOnDefault: true, shallow: true }),
};

export const loadHistoryParams = createLoader(historySearchParams);
