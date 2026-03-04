/* ===========================
   Middleware — i18n + Device Token + Grade Gate
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
const GRADE_COOKIE = 'tarotai_grade';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

/* Routes that require grade selection (relative to /{locale}) */
const GATED_SUFFIXES = new Set([
    '',           // locale root  /{locale}
    '/saju',
    '/tarot',
    '/astrology',
    '/horoscope',
    '/today-report',
    '/love',
]);

/* Routes exempt from grade gate (relative to /{locale}) */
const EXEMPT_PREFIXES = [
    '/grade',
    '/login',
    '/account',
    '/mypage',
    '/pricing',
    '/checkout',
    '/privacy',
    '/terms',
    '/contact',
    '/about',
];

export default function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

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

    // ─── Grade Gate ───
    // Only applies to /{locale}/... paths
    const localePattern = /^\/(ko|ja|en|zh)(\/.*)?$/;
    const match = pathname.match(localePattern);

    if (match) {
        const locale = match[1];
        const rest = match[2] || ''; // e.g. '/saju' or ''

        // Check if this path is exempt
        const isExempt = EXEMPT_PREFIXES.some((prefix) => rest.startsWith(prefix));

        if (!isExempt && GATED_SUFFIXES.has(rest)) {
            // Check grade cookie
            const gradeCookie = request.cookies.get(GRADE_COOKIE);

            if (!gradeCookie?.value) {
                // Redirect to grade selection with ?next= param
                const nextPath = pathname; // already includes locale
                const gradeUrl = new URL(`/${locale}/grade`, request.url);
                gradeUrl.searchParams.set('next', nextPath);
                return NextResponse.redirect(gradeUrl);
            }
        }
    }

    return response;
}

export const config = {
    matcher: ['/', '/(ko|ja|en|zh)/:path*'],
};
