import { NextResponse } from 'next/server';

// Route segment config
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/hizli/auto-login
 * Hızlı e-fatura otomatik giriş işlemi
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3011';

    // Backend endpoint mevcut değilse hemen bildir
    return NextResponse.json({
      success: false,
      message: 'Hızlı e-fatura entegrasyonu henüz aktif değil. Lütfen sistem yöneticisiyle iletişime geçin.',
      error: 'BACKEND_NOT_CONFIGURED',
      authenticated: false
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Hızlı e-fatura entegrasyonu henüz aktif değil',
        error: 'BACKEND_NOT_CONFIGURED',
        authenticated: false
      },
      { status: 200 }
    );
  }
}
