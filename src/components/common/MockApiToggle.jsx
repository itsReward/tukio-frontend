// src/components/common/MockApiToggle.jsx - Remove mock toggle completely
import React from 'react';

/**
 * MockApiToggle Component - Now disabled since we're using real API only
 */
const MockApiToggle = ({ className = '' }) => {
    return (
        <div className={`flex items-center ${className}`}>
            <div className="flex items-center opacity-50">
                <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-neutral-300">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
                </div>
                <span className="ml-2 text-sm font-medium text-neutral-500">
                    Live API Only
                </span>
            </div>
        </div>
    );
};

export default MockApiToggle;