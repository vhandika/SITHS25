
import React from 'react';

interface SkewedButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    icon?: React.ReactNode;
    variant?: 'primary' | 'secondary';
    href?: string;
    target?: string;
}

const SkewedButton: React.FC<SkewedButtonProps> = ({
    children,
    onClick,
    className = '',
    icon,
    variant = 'primary',
    href,
    target,
}) => {
    const baseClasses = "relative inline-block group cursor-pointer select-none text-white font-bold tracking-wider uppercase transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-black";

    const variantClasses = {
        primary: {
            bg: 'bg-yellow-400',
            text: 'text-black',
            hoverBg: 'hover:bg-yellow-300',
            border: 'border-yellow-400'
        },
        secondary: {
            bg: 'bg-transparent',
            text: 'text-white',
            hoverBg: 'hover:bg-gray-800',
            border: 'border-white'
        }
    };
    const selectedVariant = variantClasses[variant];

    const content = (
        <>
            <div className={`relative z-10 flex items-center justify-center gap-2 px-8 py-3 transform -skew-x-12 ${selectedVariant.bg} ${selectedVariant.hoverBg} ${selectedVariant.text}`}>
                {icon && <span className='transform skew-x-12'>{icon}</span>}
                <span className="transform skew-x-12">{children}</span>
            </div>
            <div className={`absolute inset-0 z-0 transform -skew-x-12 border-2 ${selectedVariant.border} transition-transform duration-300 group-hover:translate-x-1 group-hover:translate-y-1`}></div>
        </>
    );

    if (href) {
        return (
            <a
                href={href}
                target={target}
                rel={target === '_blank' ? 'noopener noreferrer' : undefined}
                className={`${baseClasses} ${className}`}
            >
                {content}
            </a>
        );
    }

    return (
        <button
            onClick={onClick}
            type="button"
            className={`${baseClasses} ${className}`}
        >
            {content}
        </button>
    );
};

export default SkewedButton;