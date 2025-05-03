import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../hooks/useAuth';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { DEPARTMENTS, VALIDATION_MESSAGES } from '../../utils/constants';

const Register = () => {
    const { register, isLoading } = useAuth();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [registerError, setRegisterError] = useState(null);

    // Validation schema
    const validationSchema = Yup.object({
        firstName: Yup.string().required('First name is required'),
        lastName: Yup.string().required('Last name is required'),
        username: Yup.string()
            .min(3, VALIDATION_MESSAGES.USERNAME_MIN_LENGTH)
            .max(20, VALIDATION_MESSAGES.USERNAME_MAX_LENGTH)
            .required('Username is required'),
        email: Yup.string()
            .email(VALIDATION_MESSAGES.EMAIL_INVALID)
            .required('Email is required'),
        password: Yup.string()
            .min(8, VALIDATION_MESSAGES.PASSWORD_MIN_LENGTH)
            .matches(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                VALIDATION_MESSAGES.PASSWORD_COMPLEXITY
            )
            .required('Password is required'),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref('password')], VALIDATION_MESSAGES.PASSWORDS_MUST_MATCH)
            .required('Please confirm your password'),
        department: Yup.string(),
        graduationYear: Yup.number().nullable(),
        acceptTerms: Yup.boolean()
            .oneOf([true], 'You must accept the terms and conditions')
    });

    // Formik setup
    const formik = useFormik({
        initialValues: {
            firstName: '',
            lastName: '',
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
            department: '',
            graduationYear: null,
            acceptTerms: false
        },
        validationSchema,
        onSubmit: async (values) => {
            setRegisterError(null);
            try {
                const { confirmPassword, acceptTerms, ...registerData } = values;
                const result = await register(registerData);
                if (result.success) {
                    navigate('/login', { state: { registered: true } });
                } else {
                    setRegisterError(result.error);
                }
            } catch (error) {
                setRegisterError(error.message || 'Registration failed. Please try again.');
            }
        }
    });

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    // Generate graduation year options
    const currentYear = new Date().getFullYear();
    const graduationYears = [];
    for (let year = currentYear; year <= currentYear + 6; year++) {
        graduationYears.push(year);
    }

    return (
        <div>
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-neutral-900">Create an Account</h1>
                <p className="mt-2 text-neutral-600">
                    Join Tukio to discover and participate in campus events.
                </p>
            </div>

            {registerError && (
                <div className="bg-accent-50 text-accent-700 p-4 rounded-md mb-6 border border-accent-200">
                    <p>{registerError}</p>
                </div>
            )}

            <form onSubmit={formik.handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* First Name */}
                    <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-neutral-700 mb-1">
                            First Name
                        </label>
                        <input
                            id="firstName"
                            name="firstName"
                            type="text"
                            className={`form-input ${
                                formik.touched.firstName && formik.errors.firstName ? 'border-accent-500' : ''
                            }`}
                            value={formik.values.firstName}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                        />
                        {formik.touched.firstName && formik.errors.firstName && (
                            <p className="mt-1 text-sm text-accent-600">{formik.errors.firstName}</p>
                        )}
                    </div>

                    {/* Last Name */}
                    <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-neutral-700 mb-1">
                            Last Name
                        </label>
                        <input
                            id="lastName"
                            name="lastName"
                            type="text"
                            className={`form-input ${
                                formik.touched.lastName && formik.errors.lastName ? 'border-accent-500' : ''
                            }`}
                            value={formik.values.lastName}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                        />
                        {formik.touched.lastName && formik.errors.lastName && (
                            <p className="mt-1 text-sm text-accent-600">{formik.errors.lastName}</p>
                        )}
                    </div>
                </div>

                {/* Username */}
                <div>
                    <label htmlFor="username" className="block text-sm font-medium text-neutral-700 mb-1">
                        Username
                    </label>
                    <input
                        id="username"
                        name="username"
                        type="text"
                        autoComplete="username"
                        className={`form-input ${
                            formik.touched.username && formik.errors.username ? 'border-accent-500' : ''
                        }`}
                        value={formik.values.username}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                    />
                    {formik.touched.username && formik.errors.username && (
                        <p className="mt-1 text-sm text-accent-600">{formik.errors.username}</p>
                    )}
                </div>

                {/* Email */}
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Department */}
                    <div>
                        <label htmlFor="department" className="block text-sm font-medium text-neutral-700 mb-1">
                            Department (Optional)
                        </label>
                        <select
                            id="department"
                            name="department"
                            className="form-select"
                            value={formik.values.department}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                        >
                            {DEPARTMENTS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Graduation Year */}
                    <div>
                        <label htmlFor="graduationYear" className="block text-sm font-medium text-neutral-700 mb-1">
                            Graduation Year (Optional)
                        </label>
                        <select
                            id="graduationYear"
                            name="graduationYear"
                            className="form-select"
                            value={formik.values.graduationYear || ''}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                        >
                            <option value="">Select Year</option>
                            {graduationYears.map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Password */}
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1">
                        Password
                    </label>
                    <div className="relative">
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            className={`form-input pr-10 ${
                                formik.touched.password && formik.errors.password ? 'border-accent-500' : ''
                            }`}
                            value={formik.values.password}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={togglePasswordVisibility}
                        >
                            {showPassword ? (
                                <EyeSlashIcon className="h-5 w-5 text-neutral-500"/>
                            ) : (
                                <EyeIcon className="h-5 w-5 text-neutral-500"/>
                            )}
                        </button>
                    </div>
                    {formik.touched.password && formik.errors.password && (
                        <p className="mt-1 text-sm text-accent-600">{formik.errors.password}</p>
                    )}
                </div>

                {/* Confirm Password */}
                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 mb-1">
                        Confirm Password
                    </label>
                    <div className="relative">
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type={showPassword ? 'text' : 'password'}
                            className={`form-input pr-10 ${
                                formik.touched.confirmPassword && formik.errors.confirmPassword ? 'border-accent-500' : ''
                            }`}
                            value={formik.values.confirmPassword}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                        />
                    </div>
                    {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                        <p className="mt-1 text-sm text-accent-600">{formik.errors.confirmPassword}</p>
                    )}
                </div>

                {/* Terms and Conditions */}
                <div className="flex items-start">
                    <div className="flex items-center h-5">
                        <input
                            id="acceptTerms"
                            name="acceptTerms"
                            type="checkbox"
                            className="form-checkbox"
                            checked={formik.values.acceptTerms}
                            onChange={formik.handleChange}
                        />
                    </div>
                    <div className="ml-3 text-sm">
                        <label htmlFor="acceptTerms" className="text-neutral-600">
                            I agree to the{' '}
                            <Link to="/terms" className="font-semibold text-primary-600 hover:text-primary-500">
                                Terms and Conditions
                            </Link>{' '}
                            and{' '}
                            <Link to="/privacy" className="font-semibold text-primary-600 hover:text-primary-500">
                                Privacy Policy
                            </Link>
                        </label>
                        {formik.touched.acceptTerms && formik.errors.acceptTerms && (
                            <p className="mt-1 text-sm text-accent-600">{formik.errors.acceptTerms}</p>
                        )}
                    </div>
                </div>

                {/* Register Button */}
                <button
                    type="submit"
                    className={`btn btn-primary w-full ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                 xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                        strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Creating Account...
                        </div>
                    ) : (
                        'Create Account'
                    )}
                </button>

                <div className="text-center mt-6">
                    <p className="text-sm text-neutral-600">
                        Already have an account?{' '}
                        <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-500">
                            Log in
                        </Link>
                    </p>
                </div>
            </form>
        </div>
    );
};

export default Register;