import { NextResponse } from 'next/server';

// Route segment config
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/hizli/incoming
 * Hızlı e-fatura gelen faturaları listeler
 */
export async function GET(request: Request) {
  // Backend endpoint henüz mevcut değil
  return NextResponse.json({
    success: false,
    message: 'Hızlı e-fatura entegrasyonu henüz aktif değil',
    data: [],
    error: 'BACKEND_NOT_CONFIGURED'
  });
}
