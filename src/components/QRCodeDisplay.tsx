import { QRCodeSVG } from 'qrcode.react';

interface QRCodeDisplayProps {
  url: string;
  size?: number;
}

export default function QRCodeDisplay({ url, size = 200 }: QRCodeDisplayProps) {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 16,
        padding: 16,
        display: 'inline-block',
        boxShadow: '0 0 32px 4px rgba(28,176,246,0.3)',
      }}
    >
      <QRCodeSVG value={url} size={size} />
    </div>
  );
}
