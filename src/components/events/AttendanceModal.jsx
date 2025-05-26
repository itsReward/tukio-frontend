// src/components/events/AttendanceModal.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-hot-toast';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Loader from '../common/Loader';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

/**
 * AttendanceModal Component
 * Allows users to mark their attendance for an event
 */
const AttendanceModal = ({
                             isOpen,
                             onClose,
                             event,
                             currentAttendance,
                             onAttendanceUpdate,
                             loading = false
                         }) => {
    const [selectedAttendance, setSelectedAttendance] = useState(
        currentAttendance?.attended !== undefined ? currentAttendance.attended : null
    );
    const [submitting, setSubmitting] = useState(false);

    // Handle attendance submission
    const handleSubmit = async () => {
        if (selectedAttendance === null) {
            toast.error('Please select your attendance status');
            return;
        }

        try {
            setSubmitting(true);
            await onAttendanceUpdate(selectedAttendance);
            onClose();
        } catch (error) {
            console.error('Error updating attendance:', error);
            // Error handling is done in the parent component
        } finally {
            setSubmitting(false);
        }
    };

    // Reset form when modal opens/closes
    React.useEffect(() => {
        if (isOpen) {
            setSelectedAttendance(
                currentAttendance?.attended !== undefined ? currentAttendance.attended : null
            );
        }
    }, [isOpen, currentAttendance]);

    if (!event) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Mark Attendance"
            size="md"
            closeOnOverlayClick={!submitting}
        >
            <div className="space-y-6">
                {/* Event Info */}
                <div className="bg-neutral-50 rounded-lg p-4">
                    <h3 className="font-semibold text-neutral-900 mb-2">{event.title}</h3>
                    <p className="text-sm text-neutral-600">
                        Please confirm your attendance for this event. This information helps
                        organizers track engagement and may affect your ability to rate the event.
                    </p>
                </div>

                {/* Attendance Options */}
                <div className="space-y-4">
                    <h4 className="font-medium text-neutral-900">Did you attend this event?</h4>

                    <div className="space-y-3">
                        {/* Attended Option */}
                        <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors hover:bg-neutral-50">
                            <input
                                type="radio"
                                name="attendance"
                                value="true"
                                checked={selectedAttendance === true}
                                onChange={() => setSelectedAttendance(true)}
                                className="form-radio text-success-600 focus:ring-success-500"
                                disabled={submitting}
                            />
                            <div className="ml-3 flex items-center">
                                <CheckCircleIcon className="h-6 w-6 text-success-600 mr-3" />
                                <div>
                                    <div className="font-medium text-neutral-900">Yes, I attended</div>
                                    <div className="text-sm text-neutral-600">
                                        You participated in this event and can rate it after it ends
                                    </div>
                                </div>
                            </div>
                        </label>

                        {/* Did Not Attend Option */}
                        <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors hover:bg-neutral-50">
                            <input
                                type="radio"
                                name="attendance"
                                value="false"
                                checked={selectedAttendance === false}
                                onChange={() => setSelectedAttendance(false)}
                                className="form-radio text-accent-600 focus:ring-accent-500"
                                disabled={submitting}
                            />
                            <div className="ml-3 flex items-center">
                                <XCircleIcon className="h-6 w-6 text-accent-600 mr-3" />
                                <div>
                                    <div className="font-medium text-neutral-900">No, I did not attend</div>
                                    <div className="text-sm text-neutral-600">
                                        You were registered but did not participate in this event
                                    </div>
                                </div>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Current Status */}
                {currentAttendance && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                    <span className="text-blue-600 text-sm font-medium">ℹ️</span>
                                </div>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-blue-800">
                                    Current Status: {currentAttendance.attended ? 'Attended' : 'Did Not Attend'}
                                </h3>
                                <div className="text-sm text-blue-700">
                                    You can update your attendance status if needed.
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-neutral-200">
                    <Button
                        variant="outline-neutral"
                        onClick={onClose}
                        disabled={submitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSubmit}
                        loading={submitting}
                        disabled={selectedAttendance === null || submitting}
                    >
                        {submitting ? 'Updating...' : 'Update Attendance'}
                    </Button>
                </div>

                {/* Loading Overlay */}
                {loading && (
                    <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
                        <Loader size="lg" />
                    </div>
                )}
            </div>
        </Modal>
    );
};

AttendanceModal.propTypes = {
    /** Whether the modal is open */
    isOpen: PropTypes.bool.isRequired,
    /** Function to call when modal should close */
    onClose: PropTypes.func.isRequired,
    /** Event object */
    event: PropTypes.object,
    /** Current attendance record */
    currentAttendance: PropTypes.object,
    /** Function to call when attendance is updated */
    onAttendanceUpdate: PropTypes.func.isRequired,
    /** Whether the modal is in loading state */
    loading: PropTypes.bool,
};

export default AttendanceModal;