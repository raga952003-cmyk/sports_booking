import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface QRCodeSVGProps {
  value: string;
  size?: number; // width/height in px
}

export default function QRCodeSVG({ value, size = 180 }: QRCodeSVGProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, value, {
        width: size,
        margin: 1,
        color: {
          dark: '#0f172a', // slate-900 color for dark pixels
          light: '#ffffff' // white background
        },
        errorCorrectionLevel: 'M'
      }, (error) => {
        if (error) console.error('QR Code generation error:', error);
      });
    }
  }, [value, size]);

  return (
    <div className="flex justify-center items-center bg-white p-3 rounded-2xl border border-slate-200 shadow-inner">
      <canvas 
        ref={canvasRef} 
        className="max-w-full"
        style={{ width: `${size}px`, height: `${size}px` }}
      />
    </div>
  );
}
