/* ===========================
   Firebase Auth 헬퍼 — 브라우저 전용
   =========================== */

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    User,
    UserCredential,
} from 'firebase/auth';
import { getClientAuth } from './client';

const googleProvider = new GoogleAuthProvider();

/** 이메일/비밀번호 회원가입 */
export async function signUpWithEmailPassword(
    email: string,
    password: string
): Promise<UserCredential> {
    return createUserWithEmailAndPassword(getClientAuth(), email, password);
}

/** 이메일/비밀번호 로그인 */
export async function signInWithEmailPassword(
    email: string,
    password: string
): Promise<UserCredential> {
    return signInWithEmailAndPassword(getClientAuth(), email, password);
}

/** Google 로그인 */
export async function signInWithGoogle(): Promise<UserCredential> {
    return signInWithPopup(getClientAuth(), googleProvider);
}

/** 로그아웃 */
export async function signOut(): Promise<void> {
    return firebaseSignOut(getClientAuth());
}

/** 현재 사용자 가져오기 (동기) */
export function getCurrentUser(): User | null {
    return getClientAuth().currentUser;
}

/** 인증 상태 변경 리스너 */
export function onAuthChange(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(getClientAuth(), callback);
}

/** ID 토큰 가져오기 (API 요청용) */
export async function getIdToken(): Promise<string | null> {
    const user = getClientAuth().currentUser;
    if (!user) return null;
    return user.getIdToken();
}
