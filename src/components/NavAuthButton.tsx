'use client';

/* ===========================
   NavAuthButton — 네비게이션 로그인/로그아웃 버튼
   =========================== */

import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { getClientAuth } from '@/lib/firebase/client';
import { onAuthStateChanged } from 'firebase/auth';
import { signOut } from '@/lib/firebase/auth';

interface NavAuthButtonProps {
    locale: string;
}

export default function NavAuthButton({ locale }: NavAuthButtonProps) {
    const [user, setUser] = useState<User | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const auth = getClientAuth();
        if (!auth) return;
        const unsub = onAuthStateChanged(auth, (u) => setUser(u));
        return unsub;
    }, []);

    if (!mounted) return null;

    const labels: Record<string, Record<string, string>> = {
        login: { ko: '로그인', ja: 'ログイン', en: 'Login', zh: '登录' },
        logout: { ko: '로그아웃', ja: 'ログアウト', en: 'Logout', zh: '退出' },
    };

    const loc = (['ko', 'ja', 'en', 'zh'].includes(locale) ? locale : 'en');

    if (user) {
        return (
            <button
                onClick={async () => {
                    await signOut();
                    window.location.href = `/${locale}`;
                }}
                className="nav-auth-btn nav-auth-logout"
            >
                {labels.logout[loc]}
            </button>
        );
    }

    return (
        <a href={`/${locale}/account`} className="nav-auth-btn nav-auth-login">
            {labels.login[loc]}
        </a>
    );
}
