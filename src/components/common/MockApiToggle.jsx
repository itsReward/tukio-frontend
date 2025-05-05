import React from 'react';
import { useMockApi } from '../../contexts/MockApiContext';
import { Switch } from '@headlessui/react';

/**
 * MockApiToggle Component
 * Provides a toggle switch for enabling/disabling mock API mode
 */
const MockApiToggle = ({ className = '' }) => {
    // Update this line to destructure correctly from the context
    const { useMockApi: isMockEnabled, toggleMockApi } = useMockApi();

    return (
        <div className={`flex items-center ${className}`}>
            <Switch
                checked={isMockEnabled}
                onChange={toggleMockApi}
                className={`${
                    isMockEnabled ? 'bg-primary-600' : 'bg-neutral-300'
                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
            >
        <span
            className={`${
                isMockEnabled ? 'translate-x-6' : 'translate-x-1'
            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
        />
            </Switch>
            <span className="ml-2 text-sm font-medium text-neutral-700">
        {isMockEnabled ? 'Demo Mode' : 'Live API'}
      </span>

            {isMockEnabled && (
                <div className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                    Using Mock Data
                </div>
            )}
        </div>
    );
};

export default MockApiToggle;