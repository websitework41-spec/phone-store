'use client';

import dynamic from 'next/dynamic';

const HelperBot = dynamic(
  () => import('@/components/HelperBot').then((mod) => mod.HelperBot),
  { ssr: false }
);

const AuthModal = dynamic(
  () => import('@/components/AuthModal').then((mod) => mod.AuthModal),
  { ssr: false }
);

export function DeferredModals() {
  return (
    <>
      <AuthModal />
      <HelperBot />
    </>
  );
}
