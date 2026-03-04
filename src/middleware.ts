/* ===========================
   Middleware — i18n + Device Token
   =========================== */

import { NextRequest } from 'next/server';
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

    // ─── Device token cookie ───
    const existing = request.cookies.get(DEVICE_COOKIE);
    if (!existing) {
        const deviceId = crypto.randomUUID();
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
