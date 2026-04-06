'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PartRequestsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to part-procurement as it handles both management and requests in the new architecture
    router.replace('/service/part-procurement');
  }, [router]);

  return null;
}
