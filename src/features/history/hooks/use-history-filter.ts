import {
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
  useQueryStates,
} from "nuqs";
import { DEFAULT_PAGE } from "@/constants";

export const useHistoryFilter = () => {
  return useQueryStates({
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
  });
};
