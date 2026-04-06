import { NextResponse } from 'next/server';

// Route segment config
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/hizli/token-status
 * Hızlı e-fatura token durumunu kontrol eder
 */
export async function GET() {
  // Backend endpoint henüz mevcut değil
  return NextResponse.json({
    success: false,
    authenticated: false,
    message: 'Hızlı e-fatura entegrasyonu henüz aktif değil',
    error: 'BACKEND_NOT_CONFIGURED'
  });
}
