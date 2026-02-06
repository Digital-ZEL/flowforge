'use client';

import dynamic from 'next/dynamic';

const WelcomeToast = dynamic(() => import('./WelcomeToast'), { ssr: false });

export default function WelcomeToastWrapper() {
  return <WelcomeToast />;
}
