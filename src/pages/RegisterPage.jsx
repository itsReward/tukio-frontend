import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../hooks/useAuth';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const RegisterPage = () => {
    const {register, isLoading} = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [registerError, setRegisterError] = useState(null);

    // Validation schema
    const validationSchema = Yup.object({
        firstName: Yup.string().required('First name is required'),
        lastName: Yup.string().required('Last name is required'),
        username: Yup.string()
            .min(3, 'Username must be at least 3 characters')
            .max(20, 'Username must not exceed 20 characters')
            .required('Username is required'),
        email: Yup.string()
            .email('Invalid email address')
            .required('Email is required'),
        password: Yup.string()
            .min(8, 'Password must be at least 8 characters')
            .matches(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                'Password must contain at least one uppercase letter, one lowercase letter, and one number'
            )
            .required('Password is required'),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref('password')], 'Passwords must match')
            .required('Please confirm your password'),
        department: Yup.string(),
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
            acceptTerms: false
        },
        validationSchema,
        onSubmit: async (values) => {
            setRegisterError(null);
            try {
                const {confirmPassword, acceptTerms, ...registerData} = values;
                const result = await register(registerData);
                if (!result.success) {
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

    // Department options
    const departments = [
        {value: '', label: 'Select a department'},
        {value: 'computerScience', label: 'Computer Science'},
        {value: 'engineering', label: 'Engineering'},
        {value: 'business', label: 'Business'},
        {value: 'arts', label: 'Arts & Humanities'},
        {value: 'science', label: 'Sciences'},
        {value: 'medicine', label: 'Medicine & Health'},
        {value: 'education', label: 'Education'},
        {value: 'law', label: 'Law'},
        {value: 'socialSciences', label: 'Social Sciences'},
        {value: 'other', label: 'Other'}
    ];

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
                        {departments.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
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
                            <Link to="/terms" className="text-primary-600 hover:text-primary-500">
                                Terms and Conditions
                            </Link>{' '}
                            and{' '}
                            <Link to="/privacy" className="text-primary-600 hover:text-primary-500">
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

                <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-neutral-300"></div>
                    </div>
                    <div className="relative flex justify-center">
                        <span className="bg-white px-4 text-sm text-neutral-500">Or continue with</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        className="btn btn-outline flex items-center justify-center"
                    >
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                            <path
                                fill="currentColor"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="currentColor"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        Google
                    </button>
                    <button
                        type="button"
                        className="btn btn-outline flex items-center justify-center"
                    >
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84"></path>
                        </svg>
                        Twitter
                    </button>
                </div>

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
}

export default RegisterPage;