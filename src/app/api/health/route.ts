/* ===========================
   Health Check API — 디버깅용
   GET /api/health
   =========================== */

import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
    const envCheck = {
        hasOpenAiKey: !!process.env.OPENAI_API_KEY,
        hasGeminiKey: !!process.env.GEMINI_API_KEY,
        hasFirebaseProjectId: !!process.env.FIREBASE_ADMIN_PROJECT_ID || !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        hasFirebaseClientEmail: !!process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        hasFirebasePrivateKey: !!process.env.FIREBASE_ADMIN_PRIVATE_KEY,
        privateKeyLength: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.length || 0,
        privateKeyStartsWith: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.substring(0, 30) || 'N/A',
        nodeVersion: process.version,
        timestamp: new Date().toISOString(),
    };

    // Firebase Admin 초기화 테스트
    let firebaseStatus = 'not_tested';
    try {
        const { getAdminAuth } = await import('@/lib/firebase/admin');
        const auth = getAdminAuth();
        firebaseStatus = auth ? 'initialized' : 'null';
    } catch (error) {
        firebaseStatus = `error: ${error instanceof Error ? error.message : String(error)}`;
    }

    return NextResponse.json({
        status: 'ok',
        env: envCheck,
        firebase: firebaseStatus,
    });
}
