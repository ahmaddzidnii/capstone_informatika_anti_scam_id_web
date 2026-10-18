
import pino from "pino";

const isDevelopment = process.env.NODE_ENV !== "production";

export const logger = pino({
    level: process.env.LOG_LEVEL ?? (isDevelopment ? "debug" : "info"),

    name: "antiscamid",

    redact: {
        paths: [
            "req.headers.authorization",
            "req.headers.cookie",
            "headers.authorization",
            "headers.cookie",
            "password",
            "accessToken",
            "refreshToken",
        ],
        censor: "[REDACTED]",
    },

    ...(isDevelopment && {
        transport: {
            target: "pino-pretty",
            options: {
                colorize: true,
                levelFirst: true,
                translateTime: "SYS:standard",
                ignore: "pid,hostname",
                singleLine: true,
            },
        },
    }),
});
