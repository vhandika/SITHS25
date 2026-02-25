import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { useToast, ToastType } from '../contexts/ToastContext';

const iconMap: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle size={18} />,
    error: <XCircle size={18} />,
    info: <Info size={18} />,
};

const styleMap: Record<ToastType, string> = {
    success: 'bg-green-600/90 border-green-400/50 text-white',
    error: 'bg-red-600/90 border-red-400/50 text-white',
    info: 'bg-yellow-500/90 border-yellow-400/50 text-black',
};

const ToastItem: React.FC<{ id: number; message: string; type: ToastType; onClose: (id: number) => void }> = ({ id, message, type, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);

    useEffect(() => {
        requestAnimationFrame(() => setIsVisible(true));
        const timer = setTimeout(() => {
            setIsLeaving(true);
            setTimeout(() => onClose(id), 300);
        }, 3000);
        return () => clearTimeout(timer);
    }, [id, onClose]);

    return (
        <div
            className={`flex items-center gap-2 px-4 py-3 rounded-lg border shadow-2xl backdrop-blur-sm max-w-sm w-full transition-all duration-300 ${styleMap[type]} ${isVisible && !isLeaving ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
            style={{ pointerEvents: 'auto' }}
        >
            <span className="shrink-0">{iconMap[type]}</span>
            <span className="text-sm font-medium flex-1 break-words">{message}</span>
            <button
                onClick={() => { setIsLeaving(true); setTimeout(() => onClose(id), 300); }}
                className="shrink-0 opacity-70 hover:opacity-100 transition-opacity"
            >
                <X size={16} />
            </button>
        </div>
    );
};

const ToastContainer: React.FC = () => {
    const { toasts, removeToast } = useToast();

    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-2 pointer-events-none px-4 w-full max-w-sm">
            {toasts.map(toast => (
                <ToastItem key={toast.id} {...toast} onClose={removeToast} />
            ))}
        </div>
    );
};

export default ToastContainer;
