import React, { useRef, useState } from 'react';

const Button = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  className = '',
  disabled = false,
  type = 'button',
  ...props
}) => {
  const btnRef = useRef(null);
  const [ripple, setRipple] = useState(null);

  const handleClick = (e) => {
    if (disabled) return;
    const rect = btnRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setRipple({ x, y, id: Date.now() });
    setTimeout(() => setRipple(null), 600);
    onClick?.(e);
  };

  const variants = {
    primary: {
      wrapper: 'bg-[#1C1C1E] text-[#F5E6C8] border border-[#3A3A3C] hover:border-[#C9A96E]',
      shine: 'from-[#C9A96E]/20 via-transparent to-transparent',
      iconWrap: 'bg-[#C9A96E] text-[#1C1C1E]',
      ring: 'focus-visible:ring-[#C9A96E]/40',
      rippleColor: 'bg-[#C9A96E]/20',
      label: 'tracking-wide',
    },
    luxury: {
      wrapper: 'bg-gradient-to-br from-[#F9F4EC] to-[#EDE3D0] text-[#2C1A0E] border border-[#D4B896] hover:border-[#B8956A] shadow-[0_2px_20px_rgba(180,140,90,0.2)]',
      shine: 'from-white/60 via-transparent to-transparent',
      iconWrap: 'bg-[#2C1A0E] text-[#F9F4EC]',
      ring: 'focus-visible:ring-[#B8956A]/40',
      rippleColor: 'bg-[#B8956A]/20',
      label: 'tracking-widest uppercase text-xs font-semibold',
    },
    modern: {
      wrapper: 'bg-[#0F172A] text-white border border-[#1E293B] hover:border-[#38BDF8] shadow-[0_0_0_0_rgba(56,189,248,0)] hover:shadow-[0_0_20px_rgba(56,189,248,0.15)]',
      shine: 'from-[#38BDF8]/15 via-transparent to-transparent',
      iconWrap: 'bg-[#38BDF8] text-[#0F172A]',
      ring: 'focus-visible:ring-[#38BDF8]/40',
      rippleColor: 'bg-[#38BDF8]/15',
      label: 'tracking-wide',
    },
    ghost: {
      wrapper: 'bg-transparent text-[#1C1C1E] border border-[#1C1C1E]/20 hover:bg-[#1C1C1E]/5 hover:border-[#1C1C1E]/40',
      shine: 'from-black/5 via-transparent to-transparent',
      iconWrap: 'bg-[#1C1C1E] text-white',
      ring: 'focus-visible:ring-black/20',
      rippleColor: 'bg-black/10',
      label: 'tracking-wide',
    },
  };

  const sizes = {
    sm: { wrap: 'h-9 px-3.5 gap-2 text-sm rounded-xl', icon: 'w-6 h-6 rounded-lg', iconInner: 'w-3.5 h-3.5' },
    md: { wrap: 'h-11 px-5 gap-3 text-sm rounded-2xl', icon: 'w-7 h-7 rounded-xl', iconInner: 'w-4 h-4' },
    lg: { wrap: 'h-14 px-7 gap-3.5 text-base rounded-2xl', icon: 'w-9 h-9 rounded-xl', iconInner: 'w-5 h-5' },
  };

  const v = variants[variant] || variants.primary;
  const s = sizes[size] || sizes.md;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600&display=swap');

        .btn-root {
          font-family: 'DM Sans', sans-serif;
          -webkit-font-smoothing: antialiased;
        }
        .btn-root::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          opacity: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 60%);
          transition: opacity 200ms ease;
          pointer-events: none;
        }
        .btn-root:hover::before { opacity: 1; }

        @keyframes ripple-spread {
          to { transform: scale(5); opacity: 0; }
        }
        .ripple-circle {
          animation: ripple-spread 600ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        @keyframes icon-pop {
          0%   { transform: scale(1); }
          45%  { transform: scale(0.85); }
          100% { transform: scale(1); }
        }
        .btn-root:active .icon-badge {
          animation: icon-pop 280ms ease;
        }
      `}</style>

      <button
        ref={btnRef}
        type={type}
        disabled={disabled}
        onClick={handleClick}
        className={[
          'btn-root',
          'relative inline-flex items-center font-medium',
          'transition-all duration-200 ease-out',
          'cursor-pointer select-none',
          'focus:outline-none focus-visible:ring-4 focus-visible:ring-offset-2',
          'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none',
          'overflow-hidden',
          v.wrapper,
          v.ring,
          s.wrap,
          className,
        ].join(' ')}
        {...props}
      >
        {/* Diagonal shine layer */}
        <span
          className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${v.shine} opacity-0 hover:opacity-100 transition-opacity duration-300`}
          aria-hidden
        />

        {/* Click ripple */}
        {ripple && (
          <span
            key={ripple.id}
            className={`ripple-circle absolute rounded-full w-16 h-16 -translate-x-1/2 -translate-y-1/2 ${v.rippleColor}`}
            style={{ left: ripple.x, top: ripple.y }}
            aria-hidden
          />
        )}

        {/* Label */}
        <span className={`relative z-10 leading-none ${v.label}`}>
          {children}
        </span>

        {/* Icon badge */}
        {Icon && (
          <span
            className={`icon-badge relative z-10 flex items-center justify-center shrink-0 ${v.iconWrap} ${s.icon} transition-transform duration-150`}
          >
            <Icon className={s.iconInner} strokeWidth={2.2} />
          </span>
        )}
      </button>
    </>
  );
};

export default Button;

