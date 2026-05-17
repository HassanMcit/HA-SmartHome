import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request, { params }: { params: Promise<{ size: string }> }) {
  const resolvedParams = await params;
  const size = parseInt(resolvedParams.size) || 192;
  
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: `${size * 0.22}px`,
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={size * 0.6}
          height={size * 0.6}
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      </div>
    ),
    {
      width: size,
      height: size,
    }
  );
}
