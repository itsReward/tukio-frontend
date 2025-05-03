import React from 'react';
import PropTypes from 'prop-types';

/**
 * EmptyState Component
 * 
 * A reusable component for displaying empty states with customizable icon, title, description, and action button.
 */
const EmptyState = ({ 
  title, 
  description, 
  icon: Icon, 
  action,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center py-12 px-4 ${className}`}>
      {Icon && (
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-6">
          <Icon className="h-8 w-8 text-gray-500 dark:text-gray-400" />
        </div>
      )}
      
      <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
        {title}
      </h3>
      
      {description && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          {description}
        </p>
      )}
      
      {action && (
        <div className="mt-6">
          {action}
        </div>
      )}
    </div>
  );
};

EmptyState.propTypes = {
  /** The title displayed in the empty state */
  title: PropTypes.string.isRequired,
  /** Optional description text explaining the empty state */
  description: PropTypes.string,
  /** Icon component to display (should be a component, not an instance) */
  icon: PropTypes.elementType,
  /** Optional action button or component to display */
  action: PropTypes.node,
  /** Additional CSS classes */
  className: PropTypes.string
};

export default EmptyState;
