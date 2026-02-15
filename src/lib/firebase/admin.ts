/* ===========================
   Firebase Admin SDK — 서버 전용
   ===========================
   
   절대 클라이언트(브라우저)에서 import하지 마세요.
   API 라우트와 서버 컴포넌트에서만 사용하세요.
   
   Lazy 초기화 패턴: 모듈 로드 시점이 아닌 최초 사용 시점에 초기화
*/

import {
    initializeApp,
    getApps,
    cert,
    App,
} from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

let _adminApp: App | null = null;
let _adminDb: Firestore | null = null;
let _adminAuth: Auth | null = null;

function getAdminApp(): App {
    if (_adminApp) return _adminApp;
    if (getApps().length > 0) {
        _adminApp = getApps()[0];
        return _adminApp;
    }

    // 환경변수에서 서비스 계정 정보 로드
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

    console.log('[Firebase Admin] Initializing...', {
        hasProjectId: !!projectId,
        hasClientEmail: !!clientEmail,
        hasPrivateKey: !!privateKey,
        privateKeyLength: privateKey?.length || 0,
    });

    if (privateKey) {
        // 따옴표 제거 (Amplify 등 환경 변수 설정 시 실수 방지)
        privateKey = privateKey.trim();
        if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
            privateKey = privateKey.substring(1, privateKey.length - 1);
        }
        if (privateKey.startsWith("'") && privateKey.endsWith("'")) {
            privateKey = privateKey.substring(1, privateKey.length - 1);
        }
        // \n 이스케이프 문자를 실제 줄바꿈으로 변환
        privateKey = privateKey.replace(/\\n/g, '\n');
    }

    if (projectId && clientEmail && privateKey) {
        try {
            _adminApp = initializeApp({
                credential: cert({ projectId, clientEmail, privateKey }),
                projectId,
            });
            console.log('[Firebase Admin] Initialized successfully with service account');
            return _adminApp;
        } catch (error) {
            console.error('[Firebase Admin] Failed to initialize with service account:', error);
            // 서비스 계정 초기화 실패 시 기본 자격 증명으로 폴백
        }
    }

    // 서비스 계정 JSON 파일 경로 (대안)
    const serviceAccountPath = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT;
    if (serviceAccountPath) {
        try {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const serviceAccount = require(serviceAccountPath);
            _adminApp = initializeApp({
                credential: cert(serviceAccount),
                projectId: serviceAccount.project_id,
            });
            return _adminApp;
        } catch (error) {
            console.error('[Firebase Admin] Failed to load service account file:', error);
        }
    }

    // 기본 자격 증명 (Cloud 환경)
    console.warn('[Firebase Admin] Falling back to default credentials');
    _adminApp = initializeApp({ projectId });
    return _adminApp;
}

/** Admin Firestore instance (서버 전용) — 지연 초기화 */
export function getAdminDb(): Firestore {
    if (!_adminDb) {
        _adminDb = getFirestore(getAdminApp());
    }
    return _adminDb;
}

/** Admin Auth instance (서버 전용) — 지연 초기화 */
export function getAdminAuth(): Auth {
    if (!_adminAuth) {
        _adminAuth = getAuth(getAdminApp());
    }
    return _adminAuth;
}

// 하위 호환을 위한 getter 프로퍼티
export const adminDb = new Proxy({} as Firestore, {
    get(_, prop) {
        return (getAdminDb() as unknown as Record<string, unknown>)[prop as string];
    },
});

export const adminAuth = new Proxy({} as Auth, {
    get(_, prop) {
        return (getAdminAuth() as unknown as Record<string, unknown>)[prop as string];
    },
});

export default getAdminApp;
