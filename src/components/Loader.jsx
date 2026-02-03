import React from 'react';

const Loader = ({ 
  text = 'Loading...', 
  size = 'md',
  className = '' 
}) => {
  const sizes = {
    sm: 'w-6 h-6 border-2',
    md: 'w-12 h-12 border-4',
    lg: 'w-16 h-16 border-4'
  };
  
  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      <div 
        className={`${sizes[size]} border-amber-200 border-t-amber-700 rounded-full animate-spin`}
      ></div>
      {text && <p className="mt-4 text-gray-600 font-medium">{text}</p>}
    </div>
  );
};

export default Loader;