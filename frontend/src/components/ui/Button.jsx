import React from 'react';

const Button = ({ children, variant = 'primary', className = '', icon: Icon, ...props }) => {
    const baseStyle = "px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
    const variants = {
        primary: "bg-primary text-white hover:bg-primaryHover",
        secondary: "bg-white border border-primary text-primary hover:bg-blue-50",
        danger: "bg-error text-white hover:bg-red-600",
        ghost: "text-textSecondary hover:bg-gray-100"
    };

    // Use the variant string to select the class string, fallback to primary if not found
    const variantClass = variants[variant] || variants.primary;

    return (
        <button className={`${baseStyle} ${variantClass} ${className}`} {...props}>
            {Icon && <Icon size={16} />}
            {children}
        </button>
    );
};

export default Button;
