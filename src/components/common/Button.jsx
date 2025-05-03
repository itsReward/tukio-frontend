import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

/**
 * Button Component
 * A customizable button that can be rendered as a button or link
 */
const Button = ({
                    children,
                    variant = 'primary',
                    size = 'md',
                    rounded = 'md',
                    fullWidth = false,
                    disabled = false,
                    loading = false,
                    icon = null,
                    iconPosition = 'left',
                    as = 'button',
                    to = '',
                    href = '',
                    className = '',
                    onClick = () => {},
                    ...props
                }) => {
    // Base styles
    const baseClasses = 'inline-flex items-center justify-center transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2';

    // Size classes
    const sizeClasses = {
        xs: 'px-2 py-1 text-xs',
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-sm',
        lg: 'px-5 py-2.5 text-base',
        xl: 'px-6 py-3 text-lg'
    };

    // Variant classes
    const variantClasses = {
        primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 border border-transparent',
        secondary: 'bg-secondary-600 text-white hover:bg-secondary-700 focus:ring-secondary-500 border border-transparent',
        accent: 'bg-accent-600 text-white hover:bg-accent-700 focus:ring-accent-500 border border-transparent',
        success: 'bg-success-600 text-white hover:bg-success-700 focus:ring-success-500 border border-transparent',
        warning: 'bg-warning-600 text-white hover:bg-warning-700 focus:ring-warning-500 border border-transparent',
        danger: 'bg-accent-600 text-white hover:bg-accent-700 focus:ring-accent-500 border border-transparent',
        info: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 border border-transparent',
        neutral: 'bg-neutral-600 text-white hover:bg-neutral-700 focus:ring-neutral-500 border border-transparent',
        light: 'bg-white text-neutral-700 hover:bg-neutral-50 focus:ring-primary-500 border border-neutral-300',
        dark: 'bg-neutral-800 text-white hover:bg-neutral-900 focus:ring-neutral-500 border border-transparent',
        outline: 'bg-transparent text-primary-600 hover:bg-primary-50 focus:ring-primary-500 border border-primary-600',
        'outline-neutral': 'bg-transparent text-neutral-700 hover:bg-neutral-50 focus:ring-neutral-500 border border-neutral-300',
        ghost: 'bg-transparent text-primary-600 hover:bg-primary-50 hover:text-primary-700 focus:ring-primary-500 border border-transparent',
        'ghost-neutral': 'bg-transparent text-neutral-700 hover:bg-neutral-50 hover:text-neutral-800 focus:ring-neutral-500 border border-transparent',
        link: 'bg-transparent text-primary-600 hover:text-primary-700 hover:underline focus:ring-0 border-0 p-0',
        'link-neutral': 'bg-transparent text-neutral-700 hover:text-neutral-800 hover:underline focus:ring-0 border-0 p-0'
    };

    // Rounded classes
    const roundedClasses = {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        full: 'rounded-full'
    };

    // States
    const stateClasses = {
        disabled: 'opacity-60 cursor-not-allowed',
        loading: 'opacity-80 cursor-wait'
    };

    // Width
    const widthClass = fullWidth ? 'w-full' : '';

    // Combine all classes
    const classes = [
        baseClasses,
        sizeClasses[size] || sizeClasses.md,
        variantClasses[variant] || variantClasses.primary,
        roundedClasses[rounded] || roundedClasses.md,
        disabled || loading ? stateClasses.disabled : '',
        loading ? stateClasses.loading : '',
        widthClass,
        className
    ].join(' ');

    // Loading spinner
    const loadingSpinner = (
        <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
        >
            <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
            ></circle>
            <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
        </svg>
    );

    // Icon rendering
    const renderIcon = () => {
        if (loading) {
            return loadingSpinner;
        }

        if (icon) {
            return React.cloneElement(icon, {
                className: `${children ? (iconPosition === 'left' ? 'mr-2' : 'ml-2') : ''} h-5 w-5`
            });
        }

        return null;
    };

    // Button content
    const buttonContent = (
        <>
            {(icon || loading) && iconPosition === 'left' && renderIcon()}
            {children}
            {icon && iconPosition === 'right' && renderIcon()}
        </>
    );

    // Render based on 'as' prop
    if (as === 'link' && to) {
        return (
            <Link
                to={to}
                className={classes}
                {...(disabled ? { tabIndex: -1, 'aria-disabled': true } : {})}
                {...props}
            >
                {buttonContent}
            </Link>
        );
    }

    if (as === 'a' && href) {
        return (
            <a
                href={href}
                className={classes}
                {...(disabled ? { tabIndex: -1, 'aria-disabled': true } : {})}
                {...props}
            >
                {buttonContent}
            </a>
        );
    }

    return (
        <button
            type={props.type || 'button'}
            className={classes}
            disabled={disabled || loading}
            onClick={onClick}
            {...props}
        >
            {buttonContent}
        </button>
    );
};

Button.propTypes = {
    /** Button content */
    children: PropTypes.node,
    /** Button appearance variant */
    variant: PropTypes.oneOf([
        'primary', 'secondary', 'accent', 'success', 'warning', 'danger',
        'info', 'neutral', 'light', 'dark', 'outline', 'outline-neutral',
        'ghost', 'ghost-neutral', 'link', 'link-neutral'
    ]),
    /** Button size */
    size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
    /** Button corner rounding */
    rounded: PropTypes.oneOf(['none', 'sm', 'md', 'lg', 'xl', 'full']),
    /** Make button full width */
    fullWidth: PropTypes.bool,
    /** Disable button */
    disabled: PropTypes.bool,
    /** Show loading state */
    loading: PropTypes.bool,
    /** Icon element */
    icon: PropTypes.node,
    /** Icon position */
    iconPosition: PropTypes.oneOf(['left', 'right']),
    /** Render as different element */
    as: PropTypes.oneOf(['button', 'link', 'a']),
    /** React Router link destination */
    to: PropTypes.string,
    /** HTML anchor href */
    href: PropTypes.string,
    /** Additional CSS classes */
    className: PropTypes.string,
    /** Click handler */
    onClick: PropTypes.func,
};

export default Button;