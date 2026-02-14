/* ===========================
   Firebase Client SDK — 브라우저 전용
   ===========================
   
   지연 초기화 패턴: SSR 빌드 시 에러 방지
   getAuth() / getFirestore()는 브라우저에서만 호출
*/

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'placeholder',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

function getFirebaseApp(): FirebaseApp {
    if (getApps().length > 0) return getApp();
    return initializeApp(firebaseConfig);
}

/** 
 * 지연 초기화: 실제 사용 시점에만 인스턴스 생성
 * SSR 빌드 시 빈 API 키로 인한 에러 방지
 */
let _auth: Auth | null = null;
let _db: Firestore | null = null;

/** Firebase Auth instance (client) */
export function getClientAuth(): Auth {
    if (!_auth) {
        _auth = getAuth(getFirebaseApp());
    }
    return _auth;
}

/** Firestore instance (client) */
export function getClientDb(): Firestore {
    if (!_db) {
        _db = getFirestore(getFirebaseApp());
    }
    return _db;
}

// 하위 호환성을 위한 getter
export const auth = typeof window !== 'undefined' ? getClientAuth() : (null as unknown as Auth);
export const db = typeof window !== 'undefined' ? getClientDb() : (null as unknown as Firestore);
