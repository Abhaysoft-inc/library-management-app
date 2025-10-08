import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { User, Mail, Phone, MapPin, Calendar, BookOpen, Edit2, Save, X, Eye, EyeOff } from 'lucide-react';

const ProfilePage = () => {
    const { user } = useSelector((state) => state.auth);
    const [isEditing, setIsEditing] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || '',
        dateOfBirth: user?.dateOfBirth || '',
        rollNumber: user?.rollNumber || '',
        branch: user?.branch || '',
        year: user?.year || '',
        password: '',
        confirmPassword: ''
    });

    // Mock data for user statistics
    const userStats = {
        booksIssued: 15,
        booksReturned: 12,
        currentlyIssued: 3,
        overdueBooks: 1,
        joinDate: '2024-01-15'
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = () => {
        // Here you would typically make an API call to update the user profile
        console.log('Saving profile data:', formData);
        setIsEditing(false);
    };

    const handleCancel = () => {
        // Reset form data to original values
        setFormData({
            name: user?.name || '',
            email: user?.email || '',
            phone: user?.phone || '',
            address: user?.address || '',
            dateOfBirth: user?.dateOfBirth || '',
            rollNumber: user?.rollNumber || '',
            branch: user?.branch || '',
            year: user?.year || '',
            password: '',
            confirmPassword: ''
        });
        setIsEditing(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your account settings and library information</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Profile Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-300">
                            {/* Avatar */}
                            <div className="text-center mb-6">
                                <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-full h-24 w-24 flex items-center justify-center mx-auto mb-4">
                                    <User className="h-12 w-12 text-white" />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{user?.name}</h2>
                                <p className="text-gray-600 dark:text-gray-400">{user?.role}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-500">Roll: {user?.rollNumber}</p>
                            </div>

                            {/* Quick Stats */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-300">
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Books Issued</span>
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">{userStats.booksIssued}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-300">
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Books Returned</span>
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">{userStats.booksReturned}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-300">
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Currently Issued</span>
                                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{userStats.currentlyIssued}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-300">
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Overdue Books</span>
                                    <span className={`text-sm font-bold ${userStats.overdueBooks > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                                        {userStats.overdueBooks}
                                    </span>
                                </div>
                            </div>

                            {/* Member Since */}
                            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    <span>Member since {new Date(userStats.joinDate).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Profile Details */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md transition-colors duration-300">
                            {/* Header */}
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Personal Information</h3>
                                    {!isEditing ? (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="flex items-center space-x-2 px-4 py-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                            <span>Edit</span>
                                        </button>
                                    ) : (
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={handleSave}
                                                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                                            >
                                                <Save className="h-4 w-4" />
                                                <span>Save</span>
                                            </button>
                                            <button
                                                onClick={handleCancel}
                                                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                            >
                                                <X className="h-4 w-4" />
                                                <span>Cancel</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Form */}
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            />
                                        ) : (
                                            <div className="flex items-center space-x-2 py-2">
                                                <User className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                                <span className="text-gray-900 dark:text-white">{formData.name}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                                        {isEditing ? (
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            />
                                        ) : (
                                            <div className="flex items-center space-x-2 py-2">
                                                <Mail className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                                <span className="text-gray-900 dark:text-white">{formData.email}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Phone */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone</label>
                                        {isEditing ? (
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            />
                                        ) : (
                                            <div className="flex items-center space-x-2 py-2">
                                                <Phone className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                                <span className="text-gray-900 dark:text-white">{formData.phone || 'Not provided'}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Date of Birth */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date of Birth</label>
                                        {isEditing ? (
                                            <input
                                                type="date"
                                                name="dateOfBirth"
                                                value={formData.dateOfBirth}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            />
                                        ) : (
                                            <div className="flex items-center space-x-2 py-2">
                                                <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                                <span className="text-gray-900 dark:text-white">
                                                    {formData.dateOfBirth ? new Date(formData.dateOfBirth).toLocaleDateString() : 'Not provided'}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Roll Number */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Roll Number</label>
                                        <div className="flex items-center space-x-2 py-2">
                                            <BookOpen className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                            <span className="text-gray-900 dark:text-white">{formData.rollNumber}</span>
                                        </div>
                                    </div>

                                    {/* Branch */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Branch</label>
                                        {isEditing ? (
                                            <select
                                                name="branch"
                                                value={formData.branch}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            >
                                                <option value="">Select Branch</option>
                                                <option value="Computer Science">Computer Science</option>
                                                <option value="Electrical Engineering">Electrical Engineering</option>
                                                <option value="Mechanical Engineering">Mechanical Engineering</option>
                                                <option value="Civil Engineering">Civil Engineering</option>
                                            </select>
                                        ) : (
                                            <div className="py-2">
                                                <span className="text-gray-900 dark:text-white">{formData.branch || 'Not provided'}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Address */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Address</label>
                                        {isEditing ? (
                                            <textarea
                                                name="address"
                                                value={formData.address}
                                                onChange={handleInputChange}
                                                rows={3}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            />
                                        ) : (
                                            <div className="flex items-start space-x-2 py-2">
                                                <MapPin className="h-4 w-4 text-gray-400 dark:text-gray-500 mt-1" />
                                                <span className="text-gray-900 dark:text-white">{formData.address || 'Not provided'}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Password Change Section (only when editing) */}
                                    {isEditing && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password</label>
                                                <div className="relative">
                                                    <input
                                                        type={showPassword ? 'text' : 'password'}
                                                        name="password"
                                                        value={formData.password}
                                                        onChange={handleInputChange}
                                                        placeholder="Leave empty to keep current password"
                                                        className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-3 top-2.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
                                                    >
                                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </button>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm New Password</label>
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    name="confirmPassword"
                                                    value={formData.confirmPassword}
                                                    onChange={handleInputChange}
                                                    placeholder="Confirm new password"
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;