import React, { useState, useEffect } from 'react';
import { Search, Filter, BookOpen, Star, Calendar, Loader } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const BooksPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchBooks = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();

            if (searchTerm) params.append('search', searchTerm);
            if (selectedCategory !== 'all') params.append('category', selectedCategory);
            if (selectedFilter !== 'all') {
                if (selectedFilter === 'available') {
                    params.append('availableOnly', 'true');
                }
            }

            const response = await axios.get(`${API_BASE_URL}/books?${params.toString()}`);

            if (response.data.success) {
                setBooks(response.data.data.books);
                setError(null);
            } else {
                setError('Failed to fetch books');
            }
        } catch (error) {
            console.error('Error fetching books:', error);
            setError('Failed to fetch books. Please try again.');
            // Fallback to empty array for now
            setBooks([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch books from API
    useEffect(() => {
        fetchBooks();
    }, [searchTerm, selectedCategory, selectedFilter]); // eslint-disable-line react-hooks/exhaustive-deps

    const categories = [
        'all', 'Electronics', 'Power Systems', 'Control Systems', 'Electrical Machines',
        'Power Electronics', 'Renewable Energy', 'Circuit Analysis', 'Digital Electronics',
        'Analog Electronics', 'Microprocessors', 'Signal Processing', 'Communication Systems',
        'Electromagnetic Theory', 'General Engineering', 'Mathematics', 'Physics',
        'Research Papers', 'Journals'
    ];

    const filters = ['all', 'available', 'issued'];

    const getAvailabilityColor = (availableCopies, totalCopies) => {
        if (availableCopies === 0) {
            return 'bg-red-100 text-red-800';
        } else if (availableCopies < totalCopies / 2) {
            return 'bg-orange-100 text-orange-800';
        } else {
            return 'bg-green-100 text-green-800';
        }
    };

    const getAvailabilityText = (availableCopies, totalCopies) => {
        if (availableCopies === 0) {
            return 'Not Available';
        } else {
            return `${availableCopies} of ${totalCopies} available`;
        }
    };

    const renderStars = (rating = 4.0) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < fullStars; i++) {
            stars.push(
                <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
            );
        }

        if (hasHalfStar) {
            stars.push(
                <Star key="half" className="h-4 w-4 text-yellow-400 fill-current opacity-50" />
            );
        }

        const remainingStars = 5 - Math.ceil(rating);
        for (let i = 0; i < remainingStars; i++) {
            stars.push(
                <Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />
            );
        }

        return stars;
    };

    const handleIssueBook = async (bookId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Please login to issue books');
                return;
            }

            const response = await axios.post(
                `${API_BASE_URL}/transactions/issue`,
                { bookId },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                alert('Book issued successfully!');
                fetchBooks(); // Refresh the books list
            } else {
                alert(response.data.message || 'Failed to issue book');
            }
        } catch (error) {
            console.error('Error issuing book:', error);
            alert('Failed to issue book. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Library Books</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">Discover and explore our collection</p>
                </div>

                {/* Search and Filters */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8 transition-colors duration-300">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
                        {/* Search */}
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="h-5 w-5 absolute left-3 top-3 text-gray-400 dark:text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Search books, authors, or categories..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                />
                            </div>
                        </div>

                        {/* Category Filter */}
                        <div className="flex items-center space-x-4">
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                {categories.map(category => (
                                    <option key={category} value={category}>
                                        {category === 'all' ? 'All Categories' : category}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={selectedFilter}
                                onChange={(e) => setSelectedFilter(e.target.value)}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                {filters.map(filter => (
                                    <option key={filter} value={filter}>
                                        {filter === 'all' ? 'All Books' : filter === 'available' ? 'Available' : 'Issued'}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Results count */}
                    <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                        {loading ? 'Loading...' : `Showing ${books.length} books`}
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div className="flex justify-center items-center py-12">
                        <Loader className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
                        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading books...</span>
                    </div>
                )}

                {/* Books Grid */}
                {!loading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {books.map((book) => (
                            <div key={book._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
                                <div className="p-6">
                                    {/* Book Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{book.title}</h3>
                                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">by {book.author.join(', ')}</p>
                                            <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                                                {book.category}
                                            </span>
                                        </div>
                                        <BookOpen className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                                    </div>

                                    {/* Rating */}
                                    <div className="flex items-center space-x-2 mb-3">
                                        <div className="flex space-x-1">
                                            {renderStars(4.0)}
                                        </div>
                                        <span className="text-sm text-gray-600 dark:text-gray-400">(4.0)</span>
                                    </div>

                                    {/* Description */}
                                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">{book.description}</p>

                                    {/* Book Details */}
                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                            <Calendar className="h-4 w-4 mr-2" />
                                            <span>Published: {book.publicationYear}</span>
                                        </div>
                                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                            <span className="font-medium mr-2">ISBN:</span>
                                            <span>{book.isbn}</span>
                                        </div>
                                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                            <span className="font-medium mr-2">Location:</span>
                                            <span>{book.location}</span>
                                        </div>
                                    </div>

                                    {/* Availability and Action */}
                                    <div className="flex items-center justify-between">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getAvailabilityColor(book.availableCopies, book.totalCopies)}`}>
                                            {getAvailabilityText(book.availableCopies, book.totalCopies)}
                                        </span>
                                        <button
                                            disabled={book.availableCopies === 0}
                                            onClick={() => handleIssueBook(book._id)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${book.availableCopies > 0
                                                    ? 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600'
                                                    : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                                }`}
                                        >
                                            {book.availableCopies > 0 ? 'Issue Book' : 'Not Available'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* No results */}
                {!loading && books.length === 0 && !error && (
                    <div className="text-center py-12">
                        <BookOpen className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No books found</h3>
                        <p className="text-gray-600 dark:text-gray-400">Try adjusting your search terms or filters</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BooksPage;