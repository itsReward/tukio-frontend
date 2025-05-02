import React from 'react';

const Loader = ({ size = 'md', color = 'primary' }) => {
    // Map size to width and height classes
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12',
        xl: 'h-16 w-16'
    };

    // Map color to border classes
    const colorClasses = {
        primary: 'border-primary-500',
        secondary: 'border-secondary-500',
        accent: 'border-accent-500',
        white: 'border-white',
        neutral: 'border-neutral-500'
    };

    return (
        <div className="flex items-center justify-center">
            <div
                className={`${sizeClasses[size]} animate-spin rounded-full border-t-2 border-b-2 ${colorClasses[color]}`}
            />
        </div>
    );
};

export default Loader;