'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PaymentsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to purchase payments for now
    router.replace('/payments/purchase');
  }, [router]);

  return null;
}
