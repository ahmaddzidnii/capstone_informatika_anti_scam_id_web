import { z } from "zod";

const BASE62_ALPHABET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

export const callbackPayloadSchema = z.object({
  path: z
    .string()
    .min(1)
    .refine((val) => val.startsWith("/") && !val.startsWith("//"), {
      message: "Callback path harus berupa relative internal path.",
    }),
  query: z.record(z.string(), z.string()).optional(),
  intent: z.string().optional(),
});

export type CallbackPayload = z.infer<typeof callbackPayloadSchema>;

/**
 * Mengubah Uint8Array (basis 256) menjadi string Base62 tanpa BigInt
 */
function bytesToBase62(bytes: Uint8Array): string {
  if (bytes.length === 0) return "";

  let leadingZeros = 0;
  while (leadingZeros < bytes.length && bytes[leadingZeros] === 0) {
    leadingZeros++;
  }

  const digits: number[] = [];
  for (let i = leadingZeros; i < bytes.length; i++) {
    let carry = bytes[i] ?? 0;
    for (let j = 0; j < digits.length; j++) {
      carry += (digits[j] ?? 0) << 8;
      digits[j] = carry % 62;
      carry = (carry / 62) | 0;
    }
    while (carry > 0) {
      digits.push(carry % 62);
      carry = (carry / 62) | 0;
    }
  }

  let encoded = "0".repeat(leadingZeros);
  for (let i = digits.length - 1; i >= 0; i--) {
    encoded += BASE62_ALPHABET[digits[i] ?? 0] ?? "";
  }
  return encoded;
}

/**
 * Mengembalikan string Base62 menjadi Uint8Array (basis 256) tanpa BigInt
 */
function base62ToBytes(str: string): Uint8Array | null {
  if (!str) return null;

  let leadingZeros = 0;
  while (leadingZeros < str.length && str[leadingZeros] === "0") {
    leadingZeros++;
  }

  const bytes: number[] = [];
  for (let i = leadingZeros; i < str.length; i++) {
    const charIndex = BASE62_ALPHABET.indexOf(str[i] ?? "");
    if (charIndex === -1) return null;

    let carry = charIndex;
    for (let j = 0; j < bytes.length; j++) {
      carry += (bytes[j] ?? 0) * 62;
      bytes[j] = carry & 0xff;
      carry >>= 8;
    }
    while (carry > 0) {
      bytes.push(carry & 0xff);
      carry >>= 8;
    }
  }

  const result = new Uint8Array(leadingZeros + bytes.length);
  for (let i = 0; i < bytes.length; i++) {
    result[leadingZeros + i] = bytes[bytes.length - 1 - i] ?? 0;
  }
  return result;
}

export const callbackSDK = {
  encode(payload: CallbackPayload): string {
    const valid = callbackPayloadSchema.parse(payload);
    const json = JSON.stringify(valid);
    const bytes = new TextEncoder().encode(json);
    return bytesToBase62(bytes);
  },

  decode(token: string | null | undefined): CallbackPayload | null {
    if (!token) return null;

    try {
      const bytes = base62ToBytes(token.trim());
      if (!bytes) return null;

      const json = new TextDecoder().decode(bytes);
      const parsed: unknown = JSON.parse(json);
      const result = callbackPayloadSchema.safeParse(parsed);

      return result.success ? result.data : null;
    } catch {
      return null;
    }
  },

  toUrl(token: string | null | undefined, fallback = "/"): string {
    const decoded = this.decode(token);
    if (!decoded) return fallback;

    if (!decoded.query || Object.keys(decoded.query).length === 0) {
      return decoded.path;
    }

    const params = new URLSearchParams(decoded.query);
    return `${decoded.path}?${params.toString()}`;
  },

  createLoginRedirect(
    payload: CallbackPayload,
    options?: { loginPath?: string; paramKey?: string },
  ): string {
    const loginPath = options?.loginPath ?? "/login";
    const paramKey = options?.paramKey ?? "cb";
    const token = this.encode(payload);

    return `${loginPath}?${paramKey}=${token}`;
  },
};
