import { useEffect, useRef, useState } from 'react';

interface TimerProps {
  seconds: number;
  onComplete?: () => void;
  isRunning: boolean;
}

export default function Timer({ seconds, onComplete, isRunning }: TimerProps) {
  const [remaining, setRemaining] = useState(seconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          onCompleteRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const ratio = remaining / seconds;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const stroke = circumference * (1 - ratio);

  const color =
    ratio > 0.5 ? '#58CC02' : ratio > 0.25 ? '#FFC800' : '#FF4B4B';

  const isPulsing = remaining <= 3 && isRunning;

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        animation: isPulsing ? 'pulse-glow 0.6s ease-in-out infinite' : undefined,
      }}
    >
      <svg width={100} height={100}>
        <circle cx={50} cy={50} r={radius} fill="none" stroke="#2A2F52" strokeWidth={8} />
        <circle
          cx={50}
          cy={50}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeDasharray={circumference}
          strokeDashoffset={stroke}
          strokeLinecap="round"
          style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
        />
      </svg>
      <span
        style={{
          position: 'absolute',
          fontSize: 28,
          fontWeight: 900,
          color,
          fontFamily: 'Nunito, sans-serif',
        }}
      >
        {remaining}
      </span>
    </div>
  );
}
