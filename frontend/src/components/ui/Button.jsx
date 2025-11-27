import React from 'react';

const Button = ({ children, variant = 'primary', className = '', icon: Icon, isLoading = false, ...props }) => {
    const baseStyle = "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95";
    const variants = {
        primary: "bg-primary text-white hover:bg-primaryHover",
        secondary: "bg-white border border-primary text-primary hover:bg-blue-50",
        danger: "bg-error text-white hover:bg-red-600",
        ghost: "text-textSecondary hover:bg-gray-100"
    };

    const variantClass = variants[variant] || variants.primary;

    return (
        <button className={`${baseStyle} ${variantClass} ${className}`} disabled={isLoading || props.disabled} {...props}>
            {isLoading ? (
                <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : (
                Icon && <Icon size={16} />
            )}
            {children}
        </button>
    );
};

export default Button;
