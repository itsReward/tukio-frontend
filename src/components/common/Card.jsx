import React from 'react';
import PropTypes from 'prop-types';

/**
 * Card Component
 * A flexible card component for displaying content with various style options
 */
const Card = ({
                  children,
                  variant = 'default',
                  padding = 'default',
                  shadow = 'md',
                  border = true,
                  hover = false,
                  className = '',
                  ...props
              }) => {
    // Base classes
    const baseClasses = 'bg-white rounded-xl overflow-hidden';

    // Shadow classes
    const shadowClasses = {
        none: '',
        sm: 'shadow-sm',
        md: 'shadow-card',
        lg: 'shadow-lg',
        xl: 'shadow-xl'
    };

    // Hover effect classes
    const hoverClasses = {
        none: '',
        shadow: 'hover:shadow-lg transition-shadow duration-200',
        scale: 'hover:scale-[1.02] transition-transform duration-200',
        lift: 'hover:-translate-y-1 transition-transform duration-200',
        glow: 'hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-shadow duration-200'
    };

    // Border classes
    const borderClass = border ? 'border border-neutral-200' : '';

    // Padding classes
    const paddingClasses = {
        none: '',
        sm: 'p-3',
        default: 'p-5',
        lg: 'p-7',
        xl: 'p-9'
    };

    // Variant classes
    const variantClasses = {
        default: '',
        primary: 'bg-primary-50 border-primary-200',
        secondary: 'bg-secondary-50 border-secondary-200',
        accent: 'bg-accent-50 border-accent-200',
        success: 'bg-success-50 border-success-200',
        warning: 'bg-warning-50 border-warning-200',
        error: 'bg-accent-50 border-accent-200',
        info: 'bg-blue-50 border-blue-200',
        neutral: 'bg-neutral-50 border-neutral-200'
    };

    // Combine all classes
    const classes = [
        baseClasses,
        shadowClasses[shadow] || shadowClasses.md,
        hover ? (typeof hover === 'string' ? hoverClasses[hover] : hoverClasses.shadow) : '',
        borderClass,
        padding ? (paddingClasses[padding] || paddingClasses.default) : '',
        variantClasses[variant] || variantClasses.default,
        className
    ].join(' ');

    return (
        <div className={classes} {...props}>
            {children}
        </div>
    );
};

// Sub-components to create a standard card layout
Card.Header = ({ children, className = '', ...props }) => (
    <div className={`border-b border-neutral-200 pb-4 mb-4 ${className}`} {...props}>
        {children}
    </div>
);

Card.Title = ({ children, className = '', ...props }) => (
    <h3 className={`font-semibold text-lg text-neutral-900 ${className}`} {...props}>
        {children}
    </h3>
);

Card.Subtitle = ({ children, className = '', ...props }) => (
    <p className={`text-sm text-neutral-600 mt-1 ${className}`} {...props}>
        {children}
    </p>
);

Card.Body = ({ children, className = '', ...props }) => (
    <div className={className} {...props}>
        {children}
    </div>
);

Card.Footer = ({ children, className = '', ...props }) => (
    <div className={`border-t border-neutral-200 pt-4 mt-4 ${className}`} {...props}>
        {children}
    </div>
);

Card.propTypes = {
    /** Card content */
    children: PropTypes.node.isRequired,
    /** Card appearance variant */
    variant: PropTypes.oneOf([
        'default', 'primary', 'secondary', 'accent', 'success',
        'warning', 'error', 'info', 'neutral'
    ]),
    /** Card padding */
    padding: PropTypes.oneOf(['none', 'sm', 'default', 'lg', 'xl']),
    /** Card shadow */
    shadow: PropTypes.oneOf(['none', 'sm', 'md', 'lg', 'xl']),
    /** Card border */
    border: PropTypes.bool,
    /** Card hover effect */
    hover: PropTypes.oneOfType([
        PropTypes.bool,
        PropTypes.oneOf(['shadow', 'scale', 'lift', 'glow'])
    ]),
    /** Additional CSS classes */
    className: PropTypes.string
};

Card.Header.propTypes = {
    children: PropTypes.node,
    className: PropTypes.string
};

Card.Title.propTypes = {
    children: PropTypes.node,
    className: PropTypes.string
};

Card.Subtitle.propTypes = {
    children: PropTypes.node,
    className: PropTypes.string
};

Card.Body.propTypes = {
    children: PropTypes.node,
    className: PropTypes.string
};

Card.Footer.propTypes = {
    children: PropTypes.node,
    className: PropTypes.string
};

export default Card;