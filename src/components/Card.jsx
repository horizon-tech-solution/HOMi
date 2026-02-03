import React from 'react';

const Card = ({ children, hover = false, className = '', onClick }) => {
  const baseStyles = 'bg-white rounded-xl overflow-hidden';
  const hoverStyles = hover ? 'hover: hover:-translate-y-1 transition-all duration-300 cursor-pointer' : '';
  
  return (
    <div className={`${baseStyles} ${hoverStyles} ${className}`} onClick={onClick}>
      {children}
    </div>
  );
};

export default Card;