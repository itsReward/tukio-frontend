import React, { Fragment, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

/**
 * Modal Component
 * A customizable modal dialog
 */
const Modal = ({
                   isOpen,
                   onClose,
                   title,
                   children,
                   size = 'md',
                   closeOnOverlayClick = true,
                   showCloseButton = true,
                   footer = null,
                   className = '',
                   overlayClassName = '',
                   initialFocus = null,
                   ...props
               }) => {
    // Size classes
    const sizeClasses = {
        xs: 'max-w-xs',
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
        '3xl': 'max-w-3xl',
        '4xl': 'max-w-4xl',
        '5xl': 'max-w-5xl',
        '6xl': 'max-w-6xl',
        '7xl': 'max-w-7xl',
        full: 'max-w-full'
    };

    // Close modal when Escape key is pressed
    useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEsc);
        }

        return () => {
            document.removeEventListener('keydown', handleEsc);
        };
    }, [isOpen, onClose]);

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog
                as="div"
                className="relative z-50"
                onClose={closeOnOverlayClick ? onClose : () => {}}
                initialFocus={initialFocus}
                {...props}
            >
                {/* Backdrop */}
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div
                        className={`fixed inset-0 bg-neutral-900 bg-opacity-75 transition-opacity ${overlayClassName}`}
                    />
                </Transition.Child>

                {/* Modal dialog */}
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel
                                className={`w-full ${sizeClasses[size] || sizeClasses.md} transform overflow-hidden rounded-xl bg-white p-6 text-left align-middle shadow-xl transition-all ${className}`}
                            >
                                {/* Header */}
                                {(title || showCloseButton) && (
                                    <div className="flex items-start justify-between mb-4">
                                        {title && (
                                            <Dialog.Title
                                                as="h3"
                                                className="text-lg font-semibold leading-6 text-neutral-900"
                                            >
                                                {title}
                                            </Dialog.Title>
                                        )}

                                        {showCloseButton && (
                                            <button
                                                type="button"
                                                className="ml-auto bg-white rounded-md text-neutral-400 hover:text-neutral-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                                                onClick={onClose}
                                            >
                                                <span className="sr-only">Close</span>
                                                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                            </button>
                                        )}
                                    </div>
                                )}

                                {/* Body */}
                                <div className="mt-2">{children}</div>

                                {/* Footer */}
                                {footer && <div className="mt-4 border-t border-neutral-200 pt-4">{footer}</div>}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

Modal.propTypes = {
    /** Is the modal open */
    isOpen: PropTypes.bool.isRequired,
    /** Function to call when modal should close */
    onClose: PropTypes.func.isRequired,
    /** Modal title */
    title: PropTypes.node,
    /** Modal content */
    children: PropTypes.node.isRequired,
    /** Modal size */
    size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', 'full']),
    /** Should the modal close when the overlay is clicked */
    closeOnOverlayClick: PropTypes.bool,
    /** Should the close button be shown */
    showCloseButton: PropTypes.bool,
    /** Footer content */
    footer: PropTypes.node,
    /** Additional CSS classes for the modal panel */
    className: PropTypes.string,
    /** Additional CSS classes for the overlay */
    overlayClassName: PropTypes.string,
    /** Ref to the element that should receive focus when the modal opens */
    initialFocus: PropTypes.shape({ current: PropTypes.any })
};

export default Modal;