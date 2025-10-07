import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { BookOpen, Users, Clock, Star, ArrowRight, CheckCircle } from 'lucide-react';

const HomePage = () => {
    const { isAuthenticated, user } = useSelector((state) => state.auth);

    const features = [
        {
            icon: BookOpen,
            title: 'Vast Collection',
            description: 'Access thousands of electrical engineering books, journals, and research papers.',
        },
        {
            icon: Users,
            title: 'Student Focused',
            description: 'Designed specifically for EE department students and faculty members.',
        },
        {
            icon: Clock,
            title: 'Extended Hours',
            description: 'Digital access available 24/7 for registered students.',
        },
        {
            icon: Star,
            title: 'Premium Resources',
            description: 'Latest editions and cutting-edge research materials.',
        },
    ];

    const stats = [
        { label: 'Books Available', value: '5,000+' },
        { label: 'Active Students', value: '500+' },
        { label: 'Research Papers', value: '1,200+' },
        { label: 'Digital Resources', value: '800+' },
    ];

    return (
        <div className="bg-white dark:bg-gray-900 transition-colors duration-300">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-700 dark:to-blue-900 overflow-hidden">
                <div className="absolute inset-0 bg-black opacity-20 dark:opacity-40"></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                            EE Department
                            <span className="block text-blue-200 dark:text-blue-300">Library Management</span>
                        </h1>
                        <p className="text-xl text-blue-100 dark:text-blue-200 mb-8 max-w-3xl mx-auto">
                            Welcome to the Electrical Engineering Department Library. Access our comprehensive
                            collection of books, research papers, and digital resources designed to support
                            your academic journey.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            {!isAuthenticated ? (
                                <>
                                    <Link
                                        to="/register"
                                        className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors inline-flex items-center justify-center"
                                    >
                                        Get Started
                                        <ArrowRight className="ml-2" size={20} />
                                    </Link>
                                    <Link
                                        to="/login"
                                        className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
                                    >
                                        Sign In
                                    </Link>
                                </>
                            ) : (
                                <Link
                                    to="/dashboard"
                                    className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors inline-flex items-center justify-center"
                                >
                                    Go to Dashboard
                                    <ArrowRight className="ml-2" size={20} />
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="bg-gray-50 dark:bg-gray-800 py-16 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">{stat.value}</div>
                                <div className="text-gray-600 dark:text-gray-300">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="py-16 dark:bg-gray-900 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                            Why Choose Our Library?
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                            Our library is designed to meet the specific needs of electrical engineering students
                            and faculty members.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <div key={index} className="text-center">
                                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-300">
                                    <feature.icon className="w-8 h-8 text-blue-600 dark:text-blue-300" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Services Section */}
            <div className="bg-gray-50 dark:bg-gray-800 py-16 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Our Services</h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300">Comprehensive library services for all your academic needs</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md transition-colors duration-300">
                            <CheckCircle className="w-8 h-8 text-green-500 dark:text-green-400 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Book Issuing</h3>
                            <p className="text-gray-600 dark:text-gray-300">Easy book checkout system with automated tracking and reminders.</p>
                        </div>

                        <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md transition-colors duration-300">
                            <CheckCircle className="w-8 h-8 text-green-500 dark:text-green-400 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Digital Resources</h3>
                            <p className="text-gray-600 dark:text-gray-300">Access to online journals, e-books, and research databases.</p>
                        </div>

                        <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md transition-colors duration-300">
                            <CheckCircle className="w-8 h-8 text-green-500 dark:text-green-400 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Research Support</h3>
                            <p className="text-gray-600 dark:text-gray-300">Assistance with research materials and academic resources.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            {!isAuthenticated && (
                <div className="bg-blue-600 dark:bg-blue-700 py-16 transition-colors duration-300">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl font-bold text-white mb-4">
                            Ready to Get Started?
                        </h2>
                        <p className="text-xl text-blue-100 dark:text-blue-200 mb-8">
                            Join thousands of EE students who trust our library for their academic success.
                        </p>
                        <Link
                            to="/register"
                            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors inline-flex items-center"
                        >
                            Create Account Now
                            <ArrowRight className="ml-2" size={20} />
                        </Link>
                    </div>
                </div>
            )}

            {/* Welcome Back Section for Authenticated Users */}
            {isAuthenticated && (
                <div className="bg-blue-600 dark:bg-blue-700 py-16 transition-colors duration-300">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl font-bold text-white mb-4">
                            Welcome Back, {user?.name}!
                        </h2>
                        <p className="text-xl text-blue-100 dark:text-blue-200 mb-8">
                            Ready to explore new resources and manage your library account?
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                to="/books"
                                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                            >
                                Browse Books
                            </Link>
                            <Link
                                to="/dashboard"
                                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
                            >
                                My Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomePage;