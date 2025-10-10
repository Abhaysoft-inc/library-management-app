import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Star, Calendar, User, Award, Clock, MapPin } from 'lucide-react';

const BookDetailsPage = () => {
    const { id: _bookId } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('details');

    // Mock book data - in real app, this would be fetched based on ID
    const book = {
        id: 1,
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        category: 'Fiction',
        isbn: '978-0-7432-7356-5',
        publishedYear: 1925,
        publisher: 'Scribner',
        pages: 180,
        language: 'English',
        rating: 4.2,
        availability: 'available',
        copies: 3,
        totalCopies: 5,
        description: 'The Great Gatsby is a 1925 novel by American writer F. Scott Fitzgerald. Set in the Jazz Age on prosperous Long Island and in New York City, the novel primarily concerns the young and mysterious millionaire Jay Gatsby and his quixotic passion and obsession to reunite with his ex-lover, the beautiful former debutante Daisy Buchanan.',
        genre: ['Fiction', 'Classic Literature', 'American Literature'],
        location: 'Section A, Shelf 3',
        reviews: [
            {
                id: 1,
                user: 'John Doe',
                rating: 5,
                comment: 'A masterpiece of American literature. Fitzgerald\'s prose is beautiful and the story is timeless.',
                date: '2024-09-15'
            },
            {
                id: 2,
                user: 'Jane Smith',
                rating: 4,
                comment: 'Great character development and atmospheric writing. Really captures the essence of the Jazz Age.',
                date: '2024-09-10'
            }
        ]
    };

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < fullStars; i++) {
            stars.push(
                <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
            );
        }

        if (hasHalfStar) {
            stars.push(
                <Star key="half" className="h-5 w-5 text-yellow-400 fill-current opacity-50" />
            );
        }

        const remainingStars = 5 - Math.ceil(rating);
        for (let i = 0; i < remainingStars; i++) {
            stars.push(
                <Star key={`empty-${i}`} className="h-5 w-5 text-gray-300" />
            );
        }

        return stars;
    };

    const getAvailabilityColor = (availability) => {
        switch (availability) {
            case 'available':
                return 'bg-green-100 text-green-800';
            case 'issued':
                return 'bg-orange-100 text-orange-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 mb-6 transition-colors"
                >
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Back to Books
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Book Cover and Basic Info */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-6 transition-colors duration-300">
                            {/* Book Cover Placeholder */}
                            <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg aspect-[3/4] flex items-center justify-center mb-6">
                                <BookOpen className="h-16 w-16 text-blue-600" />
                            </div>

                            {/* Availability Status */}
                            <div className="mb-6">
                                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getAvailabilityColor(book.availability)}`}>
                                    {book.availability === 'available' ? 'Available' : 'Currently Issued'}
                                </span>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                    {book.copies} of {book.totalCopies} copies available
                                </p>
                            </div>

                            {/* Action Button */}
                            <button
                                disabled={book.availability !== 'available'}
                                className={`w-full py-3 rounded-lg font-medium transition-colors ${book.availability === 'available'
                                        ? 'bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-600'
                                        : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                {book.availability === 'available' ? 'Issue Book' : 'Not Available'}
                            </button>

                            {/* Quick Info */}
                            <div className="mt-6 space-y-3">
                                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                    <MapPin className="h-4 w-4 mr-2" />
                                    <span>{book.location}</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                    <Clock className="h-4 w-4 mr-2" />
                                    <span>14-day loan period</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md transition-colors duration-300">
                            {/* Book Header */}
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{book.title}</h1>
                                <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">by {book.author}</p>

                                {/* Rating */}
                                <div className="flex items-center space-x-2 mb-4">
                                    <div className="flex space-x-1">
                                        {renderStars(book.rating)}
                                    </div>
                                    <span className="text-gray-600 dark:text-gray-400">({book.rating})</span>
                                    <span className="text-gray-400 dark:text-gray-500">•</span>
                                    <span className="text-gray-600 dark:text-gray-400">{book.reviews.length} reviews</span>
                                </div>

                                {/* Genres */}
                                <div className="flex flex-wrap gap-2">
                                    {book.genre.map((g, index) => (
                                        <span key={index} className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                                            {g}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="border-b border-gray-200 dark:border-gray-700">
                                <nav className="flex space-x-8 px-6">
                                    <button
                                        onClick={() => setActiveTab('details')}
                                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'details'
                                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                            }`}
                                    >
                                        Details
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('reviews')}
                                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'reviews'
                                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                            }`}
                                    >
                                        Reviews ({book.reviews.length})
                                    </button>
                                </nav>
                            </div>

                            {/* Tab Content */}
                            <div className="p-6">
                                {activeTab === 'details' && (
                                    <div>
                                        {/* Description */}
                                        <div className="mb-8">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Description</h3>
                                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{book.description}</p>
                                        </div>

                                        {/* Book Information */}
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Book Information</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-3">
                                                    <div>
                                                        <span className="font-medium text-gray-600 dark:text-gray-400">ISBN:</span>
                                                        <span className="ml-2 text-gray-900 dark:text-white">{book.isbn}</span>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-gray-600 dark:text-gray-400">Publisher:</span>
                                                        <span className="ml-2 text-gray-900 dark:text-white">{book.publisher}</span>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-gray-600 dark:text-gray-400">Published Year:</span>
                                                        <span className="ml-2 text-gray-900 dark:text-white">{book.publishedYear}</span>
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <div>
                                                        <span className="font-medium text-gray-600 dark:text-gray-400">Pages:</span>
                                                        <span className="ml-2 text-gray-900 dark:text-white">{book.pages}</span>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-gray-600 dark:text-gray-400">Language:</span>
                                                        <span className="ml-2 text-gray-900 dark:text-white">{book.language}</span>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-gray-600 dark:text-gray-400">Category:</span>
                                                        <span className="ml-2 text-gray-900 dark:text-white">{book.category}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'reviews' && (
                                    <div>
                                        <div className="space-y-6">
                                            {book.reviews.map((review) => (
                                                <div key={review.id} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0">
                                                    <div className="flex items-start space-x-4">
                                                        <div className="bg-gray-300 dark:bg-gray-600 rounded-full h-10 w-10 flex items-center justify-center">
                                                            <User className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center space-x-2 mb-2">
                                                                <h4 className="font-medium text-gray-900 dark:text-white">{review.user}</h4>
                                                                <div className="flex space-x-1">
                                                                    {renderStars(review.rating)}
                                                                </div>
                                                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                                                    {new Date(review.date).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                            <p className="text-gray-700 dark:text-gray-300">{review.comment}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {book.reviews.length === 0 && (
                                            <div className="text-center py-8">
                                                <Star className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No reviews yet</h3>
                                                <p className="text-gray-600 dark:text-gray-400">Be the first to review this book!</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookDetailsPage;