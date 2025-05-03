import React from 'react';
import PropTypes from 'prop-types';

/**
 * Loader Component
 * Displays a customizable loading spinner
 */
const Loader = ({
                    size = 'md',
                    variant = 'primary',
                    type = 'spinner',
                    overlay = false,
                    fullScreen = false,
                    text = '',
                    className = '',
                    ...props
                }) => {
    // Size classes
    const sizeMap = {
        xs: {
            spinner: 'h-4 w-4',
            dots: 'space-x-1',
            dotSize: 'h-1 w-1',
            bounce: 'h-4 space-x-1',
            bounceSize: 'h-4 w-1',
            pulse: 'h-4 w-4',
            text: 'text-xs'
        },
        sm: {
            spinner: 'h-6 w-6',
            dots: 'space-x-1.5',
            dotSize: 'h-1.5 w-1.5',
            bounce: 'h-6 space-x-1.5',
            bounceSize: 'h-6 w-1.5',
            pulse: 'h-6 w-6',
            text: 'text-sm'
        },
        md: {
            spinner: 'h-8 w-8',
            dots: 'space-x-2',
            dotSize: 'h-2 w-2',
            bounce: 'h-8 space-x-2',
            bounceSize: 'h-8 w-2',
            pulse: 'h-8 w-8',
            text: 'text-base'
        },
        lg: {
            spinner: 'h-12 w-12',
            dots: 'space-x-3',
            dotSize: 'h-3 w-3',
            bounce: 'h-12 space-x-3',
            bounceSize: 'h-12 w-3',
            pulse: 'h-12 w-12',
            text: 'text-lg'
        },
        xl: {
            spinner: 'h-16 w-16',
            dots: 'space-x-4',
            dotSize: 'h-4 w-4',
            bounce: 'h-16 space-x-4',
            bounceSize: 'h-16 w-4',
            pulse: 'h-16 w-16',
            text: 'text-xl'
        }
    };

    // Color classes
    const colorMap = {
        primary: 'text-primary-600',
        secondary: 'text-secondary-600',
        accent: 'text-accent-600',
        success: 'text-success-600',
        warning: 'text-warning-500',
        error: 'text-accent-600',
        info: 'text-blue-600',
        neutral: 'text-neutral-600',
        white: 'text-white'
    };

    // Get the specific sizes for the current size setting
    const sizeClass = sizeMap[size] || sizeMap.md;
    const color = colorMap[variant] || colorMap.primary;

    // Spinner Loader
    const renderSpinner = () => (
        <svg
            className={`animate-spin ${sizeClass.spinner} ${color}`}
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

    // Dots Loader
    const renderDots = () => (
        <div className={`flex ${sizeClass.dots}`}>
            <div className={`animate-bounce ${sizeClass.dotSize} ${color} rounded-full delay-100`}></div>
            <div className={`animate-bounce ${sizeClass.dotSize} ${color} rounded-full delay-300`}></div>
            <div className={`animate-bounce ${sizeClass.dotSize} ${color} rounded-full delay-500`}></div>
        </div>
    );

    // Bounce Loader
    const renderBounce = () => (
        <div className={`flex items-end ${sizeClass.bounce}`}>
            <div className={`animate-bounce ${sizeClass.bounceSize} ${color} rounded-full delay-100`}></div>
            <div className={`animate-bounce ${sizeClass.bounceSize} ${color} rounded-full delay-300`}></div>
            <div className={`animate-bounce ${sizeClass.bounceSize} ${color} rounded-full delay-500`}></div>
        </div>
    );

    // Pulse Loader
    const renderPulse = () => (
        <div className={`animate-pulse ${sizeClass.pulse} ${color} rounded-full`}></div>
    );

    // Render the selected loader type
    const renderLoader = () => {
        switch (type) {
            case 'dots':
                return renderDots();
            case 'bounce':
                return renderBounce();
            case 'pulse':
                return renderPulse();
            case 'spinner':
            default:
                return renderSpinner();
        }
    };

    // Full screen loader with overlay
    if (fullScreen) {
        return (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-neutral-900 bg-opacity-50">
                <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-white shadow-lg">
                    {renderLoader()}
                    {text && <p className={`mt-3 ${color} ${sizeClass.text} font-medium`}>{text}</p>}
                </div>
            </div>
        );
    }

    // Loader with overlay
    if (overlay) {
        return (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-white bg-opacity-80">
                <div className="flex flex-col items-center justify-center">
                    {renderLoader()}
                    {text && <p className={`mt-3 ${color} ${sizeClass.text} font-medium`}>{text}</p>}
                </div>
            </div>
        );
    }

    // Standard loader
    return (
        <div className={`flex flex-col items-center justify-center ${className}`} {...props}>
            {renderLoader()}
            {text && <p className={`mt-2 ${color} ${sizeClass.text} font-medium`}>{text}</p>}
        </div>
    );
};

Loader.propTypes = {
    /** Size of the loader */
    size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
    /** Color variant */
    variant: PropTypes.oneOf([
        'primary', 'secondary', 'accent', 'success',
        'warning', 'error', 'info', 'neutral', 'white'
    ]),
    /** Type of loader animation */
    type: PropTypes.oneOf(['spinner', 'dots', 'bounce', 'pulse']),
    /** Show loader as overlay */
    overlay: PropTypes.bool,
    /** Show loader as fullscreen overlay */
    fullScreen: PropTypes.bool,
    /** Loading text */
    text: PropTypes.string,
    /** Additional CSS classes */
    className: PropTypes.string
};

export default Loader;