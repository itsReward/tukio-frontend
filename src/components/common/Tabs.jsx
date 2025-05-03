import React from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const Tabs = ({ tabs, activeTab, onChange, variant = 'default', size = 'md', iconPosition = 'none' }) => {
  // Different size classes
  const sizeClasses = {
    sm: 'text-sm px-3 py-1.5',
    md: 'text-base px-4 py-2',
    lg: 'text-lg px-5 py-2.5'
  };

  // Different variant classes
  const variantClasses = {
    default: {
      wrapper: 'border-b border-neutral-200',
      tab: {
        active: 'border-b-2 border-primary-600 text-primary-600 font-medium',
        inactive: 'border-b-2 border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300'
      }
    },
    pills: {
      wrapper: 'flex-wrap gap-2',
      tab: {
        active: 'bg-primary-600 text-white font-medium rounded-full',
        inactive: 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-800 rounded-full'
      }
    },
    boxed: {
      wrapper: 'bg-neutral-100 p-1 rounded-lg',
      tab: {
        active: 'bg-white text-primary-600 font-medium shadow-sm rounded-md',
        inactive: 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/50 rounded-md'
      }
    },
    underlined: {
      wrapper: 'border-b border-neutral-200',
      tab: {
        active: 'border-b-2 border-primary-600 text-primary-600 font-medium -mb-px',
        inactive: 'border-b-2 border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300'
      }
    }
  };

  // Icon position classes
  const getIconWrapperClasses = () => {
    switch (iconPosition) {
      case 'left':
        return 'flex items-center gap-2';
      case 'top':
        return 'flex flex-col items-center gap-1';
      default:
        return '';
    }
  };

  // Animation for the active indicator
  const tabAnimation = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.15 }
  };

  return (
    <div className="w-full">
      <nav className={`flex ${variantClasses[variant].wrapper}`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              ${sizeClasses[size]} 
              ${activeTab === tab.id ? variantClasses[variant].tab.active : variantClasses[variant].tab.inactive}
              transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50
            `}
            aria-current={activeTab === tab.id ? 'page' : undefined}
          >
            <span className={getIconWrapperClasses()}>
              {tab.icon && iconPosition !== 'none' && (
                <tab.icon 
                  className={`${
                    size === 'sm' ? 'h-4 w-4' : size === 'md' ? 'h-5 w-5' : 'h-6 w-6'
                  } ${activeTab === tab.id ? 'text-primary-600' : 'text-neutral-500'}`}
                />
              )}
              <span>{tab.label}</span>
            </span>
            
            {variant === 'underlined' && activeTab === tab.id && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"
                {...tabAnimation}
              />
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};

Tabs.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      icon: PropTypes.elementType
    })
  ).isRequired,
  activeTab: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  variant: PropTypes.oneOf(['default', 'pills', 'boxed', 'underlined']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  iconPosition: PropTypes.oneOf(['none', 'left', 'top'])
};

export default Tabs;