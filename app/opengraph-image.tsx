import { ImageResponse } from 'next/og';

export const runtime = 'edge';

// Image metadata
export const alt = 'Prohori - Digital Resilience Suite';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  // Font loading (optional, using system fonts for simplicity and reliability)
  // If we wanted custom fonts, we'd fetch them here.

  return new ImageResponse(
    (
      <div
        style={{
          background: '#0A0E1A',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
          }}
        >
            {/* Shield Icon */}
            <svg
              width="120"
              height="120"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#00D4A0"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
        </div>

        <div
          style={{
            color: 'white',
            fontSize: 80,
            fontWeight: 'bold',
            letterSpacing: '-0.05em',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          PROHORI
        </div>

        <div
          style={{
            color: '#9CA3AF', // Gray-400
            fontSize: 32,
            textAlign: 'center',
            maxWidth: '80%',
            lineHeight: 1.4,
          }}
        >
          Digital Resilience Suite for Smart Bangladesh
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
