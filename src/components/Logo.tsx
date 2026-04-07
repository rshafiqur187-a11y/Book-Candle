export default function Logo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 500 500" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect width="500" height="500" fill="#F97316" rx="100" />
      
      {/* Book Icon */}
      <g transform="translate(30, 160) scale(0.8)">
        <path d="M 20 40 Q 90 10 150 40 L 150 220 Q 90 190 20 220 Z" fill="white" />
        <path d="M 160 40 Q 220 10 290 40 L 290 220 Q 220 190 160 220 Z" fill="white" />
        {/* Pages effect */}
        <path d="M 20 220 Q 90 190 150 220 L 150 240 Q 90 210 20 240 Z" fill="#fdba74" />
        <path d="M 160 220 Q 220 190 290 220 L 290 240 Q 220 210 160 240 Z" fill="#fdba74" />
      </g>

      {/* Text */}
      <text 
        x="270" 
        y="235" 
        fontFamily="Impact, system-ui, sans-serif" 
        fontSize="90" 
        fill="white" 
        letterSpacing="1"
      >
        BOOK
      </text>
      <text 
        x="270" 
        y="325" 
        fontFamily="Impact, system-ui, sans-serif" 
        fontSize="90" 
        fill="white" 
        letterSpacing="1"
      >
        CANDLE
      </text>
    </svg>
  );
}
