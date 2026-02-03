import React from 'react';

const button = ({ 
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
  // Base styles: clean, elevated, with subtle shadow + warm tone
  const baseStyles = `
    inline-flex items-center font-medium transition-all duration-200
    disabled: disabled:cursor-not-allowed
    focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-amber-200
    rounded-lg relative overflow-hidden group
  `;

  // Variant styles (color schemes for real estate)
  const variants = {
    primary: {
      text: 'text-amber-800',
      bg: 'bg-white',
      border: 'border-amber-100',
      hover: 'hover:bg-amber-50 hover:border-amber-200',
      iconBg: 'bg-amber-700',
      iconText: 'text-white',
      
    },
    luxury: {
      text: 'text-gray-800',
      bg: 'bg-white',
      border: 'border-gray-100',
      hover: 'hover:bg-gray-50',
      iconBg: 'bg-gray-800',
      iconText: 'text-white',
      
    },
    modern: {
      text: 'text-blue-800',
      bg: 'bg-white',
      border: 'border-blue-100',
      hover: 'hover:bg-blue-50',
      iconBg: 'bg-blue-700',
      iconText: 'text-white',
      
    }
  };

  const currentVariant = variants[variant] || variants.primary;
  const { text, bg, border, hover, iconBg, iconText, shadow } = currentVariant;

  // Size classes
  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-2',
    md: 'px-4 py-2 text-base gap-2.5',
    lg: 'px-6 py-3 text-lg gap-3',
  };

  const sizeClass = sizes[size] || sizes.md;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${bg} ${border} ${shadow} ${hover} ${text} ${sizeClass} ${className}`}
      {...props}
    >
      {/* Text */}
      <span className="relative z-10">{children}</span>

      {/* Icon on right — badge style with warm accent */}
      {Icon && (
        <span className={`flex items-center justify-center w-8 h-8 rounded-full ${iconBg} ml-2 transition-transform `}>
          <Icon className={`w-4 h-4 ${iconText}`} />
        </span>
      )}
    </button>
  );
};

export default button;