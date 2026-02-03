import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const Alert = ({ 
  type = 'info', // 'success', 'error', 'warning', 'info'
  message, 
  onClose,
  duration = 5000, // Auto-close after 5 seconds
  autoClose = true
}) => {
  useEffect(() => {
    if (autoClose && duration) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  const alertStyles = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: CheckCircle,
      iconColor: 'text-green-600'
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: AlertCircle,
      iconColor: 'text-red-600'
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-800',
      icon: AlertTriangle,
      iconColor: 'text-amber-600'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: Info,
      iconColor: 'text-blue-600'
    }
  };

  const style = alertStyles[type] || alertStyles.info;
  const Icon = style.icon;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={`${style.bg} ${style.border} border-2 rounded-2xl p-4 shadow-lg min-w-[300px] max-w-md`}>
        <div className="flex items-start gap-3">
          <Icon className={`w-6 h-6 ${style.iconColor} flex-shrink-0 mt-0.5`} />
          
          <div className="flex-1">
            <p className={`${style.text} font-medium leading-relaxed`}>
              {message}
            </p>
          </div>
          
          <button
            onClick={onClose}
            className={`${style.text} hover:opacity-70 transition-opacity flex-shrink-0`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Alert;