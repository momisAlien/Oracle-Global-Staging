/* ===========================
   Firebase Admin SDK — 서버 전용
   ===========================
   
   절대 클라이언트(브라우저)에서 import하지 마세요.
   API 라우트와 서버 컴포넌트에서만 사용하세요.
*/

import {
    initializeApp,
    getApps,
    cert,
    App,
} from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

function getAdminApp(): App {
    if (getApps().length > 0) return getApps()[0];

    // 환경변수에서 서비스 계정 정보 로드
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (projectId && clientEmail && privateKey) {
        return initializeApp({
            credential: cert({ projectId, clientEmail, privateKey }),
            projectId,
        });
    }

    // 서비스 계정 JSON 파일 경로 (대안)
    const serviceAccountPath = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT;
    if (serviceAccountPath) {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const serviceAccount = require(serviceAccountPath);
        return initializeApp({
            credential: cert(serviceAccount),
            projectId: serviceAccount.project_id,
        });
    }

    // 기본 자격 증명 (Cloud 환경)
    return initializeApp({ projectId });
}

const adminApp = getAdminApp();

/** Admin Firestore instance (서버 전용) */
export const adminDb: Firestore = getFirestore(adminApp);

/** Admin Auth instance (서버 전용) */
export const adminAuth: Auth = getAuth(adminApp);

export default adminApp;
