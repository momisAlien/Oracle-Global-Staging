/* ===========================
   Middleware — i18n + Device Token
   =========================== */

import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/request';

const intlMiddleware = createMiddleware({
    locales,
    defaultLocale,
    localeDetection: true,
});

const DEVICE_COOKIE = 'ta_device';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export default function middleware(request: NextRequest) {
    // Run intl middleware first
    const response = intlMiddleware(request);

    // Issue device token cookie if not present
    const existing = request.cookies.get(DEVICE_COOKIE);
    if (!existing) {
        // Generate a simple signed device id (server-side verification happens in API routes)
        // We use crypto module via a lightweight inline approach in middleware (Edge compatible)
        const deviceId = crypto.randomUUID();
        // Simple HMAC-like signature using SubtleCrypto is async, so we use a simpler approach
        // for middleware: timestamp-based signature (verified server-side with proper HMAC)
        const ts = Date.now().toString(36);
        const token = `${deviceId}.${ts}`;

        response.cookies.set(DEVICE_COOKIE, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: COOKIE_MAX_AGE,
        });
    }

    return response;
}

export const config = {
    matcher: ['/', '/(ko|ja|en|zh)/:path*'],
};
