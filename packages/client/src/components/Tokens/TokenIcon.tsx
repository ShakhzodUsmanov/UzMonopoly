import React from 'react';
import type { TokenId } from '@uzmonopoly/shared';

interface TokenIconProps {
  token: TokenId;
  size?: number;
  className?: string;
  glow?: boolean;
}

export const TokenIcon: React.FC<TokenIconProps> = ({
  token,
  size = 32,
  className = '',
  glow = false,
}) => {
  const glowStyle = glow ? { filter: 'drop-shadow(0 0 6px rgba(245, 158, 11, 0.6))' } : {};

  switch (token) {
    case 'doppi':
      // Traditional Uzbek Chust Doppi (Black skullcap with white almond motifs)
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" className={className} style={glowStyle}>
          <ellipse
            cx="32"
            cy="46"
            rx="26"
            ry="10"
            fill="#0F172A"
            stroke="#F8FAFC"
            strokeWidth="2.5"
          />
          <path
            d="M8 44 C8 24, 20 12, 32 12 C44 12, 56 24, 56 44 Z"
            fill="#1E293B"
            stroke="#F8FAFC"
            strokeWidth="2.5"
          />
          {/* Almond / Bodom motifs in white */}
          <path d="M22 36 Q18 26 26 24 Q24 32 22 36 Z" fill="#F8FAFC" />
          <path d="M42 36 Q46 26 38 24 Q40 32 42 36 Z" fill="#F8FAFC" />
          <path d="M32 30 Q30 20 34 18 Q34 26 32 30 Z" fill="#F8FAFC" />
          <path
            d="M12 44 Q32 49 52 44"
            fill="none"
            stroke="#F8FAFC"
            strokeWidth="2"
            strokeDasharray="3 3"
          />
        </svg>
      );

    case 'choynak':
      // Traditional Paxta (Cotton) blue/white teapot
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" className={className} style={glowStyle}>
          <ellipse cx="32" cy="52" rx="16" ry="4" fill="#0F172A" opacity="0.4" />
          {/* Spout */}
          <path
            d="M44 32 C54 26 56 16 58 14 C56 18 50 28 42 38 Z"
            fill="#0284C7"
            stroke="#FFF"
            strokeWidth="1.5"
          />
          {/* Handle */}
          <path
            d="M18 24 C10 24 10 42 20 44"
            fill="none"
            stroke="#0284C7"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d="M18 24 C10 24 10 42 20 44"
            fill="none"
            stroke="#F59E0B"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Body */}
          <ellipse
            cx="32"
            cy="36"
            rx="18"
            ry="14"
            fill="#0284C7"
            stroke="#F8FAFC"
            strokeWidth="2"
          />
          {/* Paxta pattern */}
          <circle cx="32" cy="36" r="5" fill="#FFF" />
          <circle cx="32" cy="36" r="2.5" fill="#F59E0B" />
          <path
            d="M32 27 L32 45 M23 36 L41 36"
            stroke="#FFF"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Lid & Knob */}
          <ellipse
            cx="32"
            cy="22"
            rx="10"
            ry="3.5"
            fill="#0369A1"
            stroke="#FFF"
            strokeWidth="1.5"
          />
          <circle cx="32" cy="18" r="3" fill="#F59E0B" stroke="#FFF" strokeWidth="1" />
        </svg>
      );

    case 'qozon':
      // Uzbek Iron Cauldron / Kazan with steam
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" className={className} style={glowStyle}>
          {/* Steam */}
          <path
            d="M26 16 Q24 10 28 6"
            fill="none"
            stroke="#94A3B8"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.6"
          />
          <path
            d="M34 14 Q38 8 34 4"
            fill="none"
            stroke="#94A3B8"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.6"
          />
          {/* Cauldron base */}
          <path
            d="M12 28 C12 48, 52 48, 52 28 C52 24, 12 24, 12 28 Z"
            fill="#334155"
            stroke="#64748B"
            strokeWidth="2.5"
          />
          {/* Rim */}
          <ellipse cx="32" cy="27" rx="20" ry="5" fill="#475569" stroke="#94A3B8" strokeWidth="2" />
          {/* Inner plov gold */}
          <ellipse cx="32" cy="27" rx="16" ry="3.5" fill="#F59E0B" />
          {/* Handles */}
          <path
            d="M8 27 C6 25 6 31 10 32"
            fill="none"
            stroke="#64748B"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M56 27 C58 25 58 31 54 32"
            fill="none"
            stroke="#64748B"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Legs */}
          <path
            d="M20 46 L16 54 M32 48 L32 56 M44 46 L48 54"
            stroke="#1E293B"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      );

    case 'tarvuz':
      // Juicy sliced Uzbek watermelon
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" className={className} style={glowStyle}>
          {/* Shadow */}
          <ellipse cx="32" cy="54" rx="20" ry="4" fill="#0F172A" opacity="0.4" />
          {/* Rind */}
          <path d="M10 24 C10 46 54 46 54 24 Z" fill="#15803D" stroke="#166534" strokeWidth="2" />
          {/* White inner rim */}
          <path d="M13 25 C13 43 51 43 51 25 Z" fill="#DCFCE7" />
          {/* Red pulp */}
          <path d="M15 26 C15 41 49 41 49 26 Z" fill="#EF4444" />
          {/* Black seeds */}
          <circle cx="24" cy="32" r="1.5" fill="#0F172A" />
          <circle cx="32" cy="35" r="1.5" fill="#0F172A" />
          <circle cx="40" cy="32" r="1.5" fill="#0F172A" />
          <circle cx="28" cy="28" r="1.5" fill="#0F172A" />
          <circle cx="36" cy="28" r="1.5" fill="#0F172A" />
        </svg>
      );

    case 'damas':
      // Iconic Damas microbus
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" className={className} style={glowStyle}>
          {/* Shadow */}
          <ellipse cx="32" cy="52" rx="24" ry="4" fill="#0F172A" opacity="0.5" />
          {/* Damas Car Body */}
          <path
            d="M10 44 L10 28 C10 24 14 20 18 18 L44 18 C48 18 52 22 53 26 L56 36 C57 38 57 44 57 44 Z"
            fill="#F8FAFC"
            stroke="#94A3B8"
            strokeWidth="2"
          />
          {/* Blue Stripe */}
          <rect x="10" y="38" width="46" height="4" fill="#0284C7" />
          {/* Windows */}
          <rect x="15" y="22" width="10" height="10" rx="2" fill="#38BDF8" opacity="0.7" />
          <rect x="28" y="22" width="12" height="10" rx="2" fill="#38BDF8" opacity="0.7" />
          <path d="M43 22 L51 26 L50 32 L43 32 Z" fill="#38BDF8" opacity="0.7" />
          {/* Wheels */}
          <circle cx="20" cy="46" r="6" fill="#1E293B" stroke="#64748B" strokeWidth="2" />
          <circle cx="20" cy="46" r="2.5" fill="#CBD5E1" />
          <circle cx="46" cy="46" r="6" fill="#1E293B" stroke="#64748B" strokeWidth="2" />
          <circle cx="46" cy="46" r="2.5" fill="#CBD5E1" />
          {/* Headlights */}
          <circle cx="55" cy="40" r="2" fill="#FBBF24" />
        </svg>
      );

    case 'tulpar':
      // Winged horse / Pegasus in golden silhouette
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" className={className} style={glowStyle}>
          {/* Glow backdrop */}
          <circle cx="32" cy="32" r="24" fill="#F59E0B" opacity="0.15" />
          {/* Horse body & wings */}
          <path
            d="M18 42 C20 36 24 34 28 34 C30 30 32 24 30 18 C30 14 36 12 38 16 C40 14 44 16 42 22 C48 20 52 24 50 28 C46 32 40 36 34 38 L36 50 L30 48 L28 42 L22 48 L18 42 Z"
            fill="#F59E0B"
            stroke="#D97706"
            strokeWidth="1.5"
          />
          {/* Wing Feathers */}
          <path
            d="M30 32 C26 22 20 18 12 16 C16 22 22 28 28 32 Z"
            fill="#FBBF24"
            stroke="#D97706"
            strokeWidth="1"
          />
          <path
            d="M32 28 C28 20 22 14 16 10 C20 18 26 24 30 28 Z"
            fill="#FDE68A"
            stroke="#D97706"
            strokeWidth="1"
          />
          {/* Eye */}
          <circle cx="37" cy="18" r="1.2" fill="#1E293B" />
        </svg>
      );

    default:
      return <div style={{ width: size, height: size, borderRadius: '50%', background: '#FFF' }} />;
  }
};
