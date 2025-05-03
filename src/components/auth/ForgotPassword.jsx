import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import authService from '../../services/authService';
import { motion } from 'framer-motion';

const ForgotPassword = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [error, setError] = useState(null);

    // Validation schema
    const validationSchema = Yup.object({
        email: Yup.string()
            .email('Invalid email address')
            .required('Email is required')
    });

    // Formik setup
    const formik = useFormik({
        initialValues: {
            email: ''
        },
        validationSchema,
        onSubmit: async (values) => {
            setIsSubmitting(true);
            setError(null);

            try {
                // In a real implementation, call to password reset API
                // await authService.resetPassword(values.email);

                // Show success message
                setSubmitSuccess(true);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to send password reset email');
            } finally {
                setIsSubmitting(false);
            }
        }
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-neutral-900">Reset Your Password</h1>
                <p className="mt-2 text-neutral-600">
                    {!submitSuccess ? (
                        "Enter your email and we'll send you a link to reset your password."
                    ) : (
                        "We've sent a password reset link to your email."
                    )}
                </p>
            </div>

            {error && (
                <div className="bg-accent-50 text-accent-700 p-4 rounded-md mb-6 border border-accent-200">
                    <p>{error}</p>
                </div>
            )}

            {!submitSuccess ? (
                <form onSubmit={formik.handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">
                            Email Address
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            className={`form-input ${
                                formik.touched.email && formik.errors.email ? 'border-accent-500' : ''
                            }`}
                            value={formik.values.email}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                        />
                        {formik.touched.email && formik.errors.email && (
                            <p className="mt-1 text-sm text-accent-600">{formik.errors.email}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        className={`btn btn-primary w-full ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <div className="flex items-center justify-center">
                                <svg
                                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                                Sending...
                            </div>
                        ) : (
                            'Send Reset Link'
                        )}
                    </button>

                    <div className="text-center mt-6">
                        <p className="text-sm text-neutral-600">
                            Remember your password?{' '}
                            <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-500">
                                Log in
                            </Link>
                        </p>
                    </div>
                </form>
            ) : (
                <div className="space-y-6">
                    <div className="bg-success-50 text-success-700 p-4 rounded-md mb-6 border border-success-200">
                        <p>
                            A password reset link has been sent to <span className="font-medium">{formik.values.email}</span>. Please check your email and follow the instructions to reset your password.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <Link
                            to="/login"
                            className="btn btn-primary w-full block text-center"
                        >
                            Return to Login
                        </Link>

                        <button
                            type="button"
                            className="btn btn-outline w-full"
                            onClick={() => {
                                setSubmitSuccess(false);
                                formik.resetForm();
                            }}
                        >
                            Try Another Email
                        </button>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default ForgotPassword;