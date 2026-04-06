import { NextResponse } from 'next/server';

// Route segment config
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/hizli/document-content
 * Hızlı e-fatura belge içeriğini (PDF) indirir
 */
export async function GET(request: Request) {
  // Backend endpoint henüz mevcut değil
  return NextResponse.json({
    success: false,
    message: 'Hızlı e-fatura entegrasyonu henüz aktif değil',
    error: 'BACKEND_NOT_CONFIGURED'
  });
}
