import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../store/slices/authSlice';
import {
    User,
    Mail,
    Lock,
    Phone,
    MapPin,
    AlertCircle,
    CheckCircle,
    Eye,
    EyeOff,
    Loader2,
    GraduationCap,
    Hash
} from 'lucide-react';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        studentId: '',
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        year: '',
        address: {
            street: '',
            city: '',
            state: '',
            pincode: '',
        },
    });

    const [formErrors, setFormErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isLoading, error, isAuthenticated } = useSelector((state) => state.auth);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        dispatch(clearError());
    }, [dispatch]);

    const validateForm = () => {
        const errors = {};

        if (!formData.studentId.match(/^\d{5}$/)) {
            errors.studentId = 'Roll number must be exactly 5 digits (e.g., 24305)';
        }

        if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            errors.email = 'Please enter a valid email address';
        }

        if (formData.password.length < 6) {
            errors.password = 'Password must be at least 6 characters long';
        }

        if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        if (!formData.phone.match(/^\d{10}$/)) {
            errors.phone = 'Phone number must be 10 digits';
        }

        const requiredFields = ['studentId', 'name', 'email', 'password', 'phone', 'year'];
        requiredFields.forEach(field => {
            if (!formData[field]) {
                errors[field] = 'This field is required';
            }
        });

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('address.')) {
            const addressField = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                address: {
                    ...prev.address,
                    [addressField]: value,
                },
            }));
            // پاک کردن ارور آدرس
            if (formErrors[addressField]) {
                setFormErrors(prev => ({
                    ...prev,
                    [addressField]: '',
                }));
            }
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value,
            }));
            if (formErrors[name]) {
                setFormErrors(prev => ({
                    ...prev,
                    [name]: '',
                }));
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            const result = await dispatch(registerUser(formData));
            if (registerUser.fulfilled.match(result)) {
                setSuccessMessage('Registration successful! Please wait for admin approval before you can log in.');
                setFormData({
                    studentId: '',
                    name: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                    phone: '',
                    year: '',
                    address: {
                        street: '',
                        city: '',
                        state: '',
                        pincode: '',
                    },
                });
                setFormErrors({});
            }
        } catch (error) {
            console.error('Registration error:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <div className="text-center">
                    <div className="flex justify-center">
                        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white text-2xl">📚</span>
                        </div>
                    </div>
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
                        Create your account
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                            Sign in here
                        </Link>
                    </p>
                </div>

                <div className="mt-8 bg-white shadow sm:rounded-lg">
                    <div className="px-4 py-8 sm:px-10">
                        {successMessage && (
                            <div className="mb-6 rounded-md bg-green-50 p-4">
                                <div className="flex">
                                    <CheckCircle className="h-5 w-5 text-green-400" />
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-green-800">Registration Successful!</h3>
                                        <div className="mt-2 text-sm text-green-700">{successMessage}</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="mb-6 rounded-md bg-red-50 p-4">
                                <div className="flex">
                                    <AlertCircle className="h-5 w-5 text-red-400" />
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-800">Registration Failed</h3>
                                        <div className="mt-2 text-sm text-red-700">{error}</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Personal Information</h3>
                                </div>

                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <div>
                                        <label htmlFor="studentId" className="block text-sm font-medium text-gray-700">Roll Number *</label>
                                        <div className="mt-1 relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Hash className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                id="studentId"
                                                name="studentId"
                                                type="text"
                                                required
                                                maxLength="5"
                                                value={formData.studentId}
                                                onChange={handleChange}
                                                className={`appearance-none block w-full pl-10 pr-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${formErrors.studentId ? 'border-red-300' : 'border-gray-300'}`}
                                                placeholder="24305"
                                            />
                                        </div>
                                        {formErrors.studentId && <p className="mt-2 text-sm text-red-600">{formErrors.studentId}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name *</label>
                                        <div className="mt-1 relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <User className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                id="name"
                                                name="name"
                                                type="text"
                                                required
                                                value={formData.name}
                                                onChange={handleChange}
                                                className={`appearance-none block w-full pl-10 pr-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${formErrors.name ? 'border-red-300' : 'border-gray-300'}`}
                                                placeholder="Enter your full name"
                                            />
                                        </div>
                                        {formErrors.name && <p className="mt-2 text-sm text-red-600">{formErrors.name}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address *</label>
                                        <div className="mt-1 relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Mail className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                id="email"
                                                name="email"
                                                type="email"
                                                required
                                                value={formData.email}
                                                onChange={handleChange}
                                                className={`appearance-none block w-full pl-10 pr-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${formErrors.email ? 'border-red-300' : 'border-gray-300'}`}
                                                placeholder="Enter your email"
                                            />
                                        </div>
                                        {formErrors.email && <p className="mt-2 text-sm text-red-600">{formErrors.email}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number *</label>
                                        <div className="mt-1 relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Phone className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                id="phone"
                                                name="phone"
                                                type="tel"
                                                required
                                                maxLength="10"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className={`appearance-none block w-full pl-10 pr-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${formErrors.phone ? 'border-red-300' : 'border-gray-300'}`}
                                                placeholder="1234567890"
                                            />
                                        </div>
                                        {formErrors.phone && <p className="mt-2 text-sm text-red-600">{formErrors.phone}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <div>
                                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password *</label>
                                        <div className="mt-1 relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Lock className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                id="password"
                                                name="password"
                                                type={showPassword ? 'text' : 'password'}
                                                required
                                                value={formData.password}
                                                onChange={handleChange}
                                                className={`appearance-none block w-full pl-10 pr-10 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${formErrors.password ? 'border-red-300' : 'border-gray-300'}`}
                                                placeholder="Enter password"
                                            />
                                            <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowPassword(!showPassword)}>
                                                {showPassword ? <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500" /> : <Eye className="h-5 w-5 text-gray-400 hover:text-gray-500" />}
                                            </button>
                                        </div>
                                        {formErrors.password && <p className="mt-2 text-sm text-red-600">{formErrors.password}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password *</label>
                                        <div className="mt-1 relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Lock className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                required
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                className={`appearance-none block w-full pl-10 pr-10 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${formErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'}`}
                                                placeholder="Confirm password"
                                            />
                                            <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                                {showConfirmPassword ? <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500" /> : <Eye className="h-5 w-5 text-gray-400 hover:text-gray-500" />}
                                            </button>
                                        </div>
                                        {formErrors.confirmPassword && <p className="mt-2 text-sm text-red-600">{formErrors.confirmPassword}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="year" className="block text-sm font-medium text-gray-700">Academic Year *</label>
                                        <div className="mt-1 relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <GraduationCap className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <select
                                                id="year"
                                                name="year"
                                                required
                                                value={formData.year}
                                                onChange={handleChange}
                                                className={`appearance-none block w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${formErrors.year ? 'border-red-300' : 'border-gray-300'}`}
                                            >
                                                <option value="">Select Year</option>
                                                <option value="1">1st Year</option>
                                                <option value="2">2nd Year</option>
                                                <option value="3">3rd Year</option>
                                                <option value="4">4th Year</option>
                                            </select>
                                        </div>
                                        {formErrors.year && <p className="mt-2 text-sm text-red-600">{formErrors.year}</p>}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                                            Address (Optional)
                                        </h3>
                                    </div>

                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <div className="sm:col-span-2">
                                            <label htmlFor="address.street" className="block text-sm font-medium text-gray-700">
                                                Street Address
                                            </label>
                                            <div className="mt-1 relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <MapPin className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <input
                                                    id="address.street"
                                                    name="address.street"
                                                    type="text"
                                                    value={formData.address.street}
                                                    onChange={handleChange}
                                                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                    placeholder="Enter street address"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="address.city" className="block text-sm font-medium text-gray-700">
                                                City
                                            </label>
                                            <div className="mt-1">
                                                <input
                                                    id="address.city"
                                                    name="address.city"
                                                    type="text"
                                                    value={formData.address.city}
                                                    onChange={handleChange}
                                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                    placeholder="Enter city"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="address.state" className="block text-sm font-medium text-gray-700">
                                                State
                                            </label>
                                            <div className="mt-1">
                                                <input
                                                    id="address.state"
                                                    name="address.state"
                                                    type="text"
                                                    value={formData.address.state}
                                                    onChange={handleChange}
                                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                    placeholder="Enter state"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="address.pincode" className="block text-sm font-medium text-gray-700">
                                                PIN Code
                                            </label>
                                            <div className="mt-1">
                                                <input
                                                    id="address.pincode"
                                                    name="address.pincode"
                                                    type="text"
                                                    maxLength="6"
                                                    value={formData.address.pincode}
                                                    onChange={handleChange}
                                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                    placeholder="Enter PIN code"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none sm:text-sm"
                                    >
                                        {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Register'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
