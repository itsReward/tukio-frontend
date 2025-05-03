import React from 'react';
import PropTypes from 'prop-types';

/**
 * Badge Component
 * Displays a styled badge with configurable appearance
 */
const Badge = ({
                   children,
                   variant = 'primary',
                   size = 'md',
                   rounded = 'full',
                   className = '',
                   ...props
               }) => {
    // Base styles
    const baseClasses = 'inline-flex items-center justify-center font-medium';

    // Size classes
    const sizeClasses = {
        sm: 'px-1.5 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm'
    };

    // Variant classes (background and text colors)
    const variantClasses = {
        primary: 'bg-primary-100 text-primary-800',
        secondary: 'bg-secondary-100 text-secondary-800',
        accent: 'bg-accent-100 text-accent-800',
        success: 'bg-success-100 text-success-800',
        warning: 'bg-warning-100 text-warning-800',
        error: 'bg-accent-100 text-accent-800',
        info: 'bg-blue-100 text-blue-800',
        neutral: 'bg-neutral-100 text-neutral-800',
        default: 'bg-white text-neutral-800 border border-neutral-200',
        dark: 'bg-neutral-800 text-white'
    };

    // Rounded classes
    const roundedClasses = {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        full: 'rounded-full'
    };

    const classes = [
        baseClasses,
        sizeClasses[size] || sizeClasses.md,
        variantClasses[variant] || variantClasses.primary,
        roundedClasses[rounded] || roundedClasses.full,
        className
    ].join(' ');

    return (
        <span className={classes} {...props}>
      {children}
    </span>
    );
};

Badge.propTypes = {
    /** Badge content */
    children: PropTypes.node.isRequired,
    /** Badge appearance variant */
    variant: PropTypes.oneOf([
        'primary', 'secondary', 'accent', 'success',
        'warning', 'error', 'info', 'neutral', 'default', 'dark'
    ]),
    /** Badge size */
    size: PropTypes.oneOf(['sm', 'md', 'lg']),
    /** Badge corner rounding */
    rounded: PropTypes.oneOf(['none', 'sm', 'md', 'lg', 'full']),
    /** Additional CSS classes */
    className: PropTypes.string
};

export default Badge;