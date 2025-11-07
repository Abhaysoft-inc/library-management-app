import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BookMarked,
    Search,
    User,
    Calendar,
    AlertCircle,
    CheckCircle,
    X
} from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const IssueBook = () => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [students, setStudents] = useState([]);
    const [books, setBooks] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [selectedBook, setSelectedBook] = useState(null);
    const [studentSearch, setStudentSearch] = useState('');
    const [bookSearch, setBookSearch] = useState('');
    const [dueDate, setDueDate] = useState('');

    useEffect(() => {
        // Set default due date (14 days from now)
        const defaultDueDate = new Date();
        defaultDueDate.setDate(defaultDueDate.getDate() + 14);
        setDueDate(defaultDueDate.toISOString().split('T')[0]);
    }, []);

    const searchStudents = async (query) => {
        if (!query || query.length < 2) {
            setStudents([]);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/students`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { search: query, limit: 10 }
            });

            if (response.data.success) {
                setStudents(response.data.data.students.filter(s => s.isApproved) || []);
            }
        } catch (error) {
            console.error('Error searching students:', error);
        }
    };

    const searchBooks = async (query) => {
        if (!query || query.length < 2) {
            setBooks([]);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/books`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { search: query, limit: 10 }
            });

            if (response.data.success) {
                setBooks(response.data.data.books.filter(b => b.availableCopies > 0) || []);
            }
        } catch (error) {
            console.error('Error searching books:', error);
        }
    };

    useEffect(() => {
        const debounce = setTimeout(() => {
            searchStudents(studentSearch);
        }, 300);
        return () => clearTimeout(debounce);
    }, [studentSearch]);

    useEffect(() => {
        const debounce = setTimeout(() => {
            searchBooks(bookSearch);
        }, 300);
        return () => clearTimeout(debounce);
    }, [bookSearch]);

    const handleIssueBook = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!selectedStudent || !selectedBook) {
            setError('Please select both student and book');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${API_BASE_URL}/transactions/issue`,
                {
                    studentId: selectedStudent._id,
                    bookId: selectedBook._id,
                    dueDate: dueDate
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                setSuccess('Book issued successfully!');
                setTimeout(() => {
                    navigate('/admin/transactions/history');
                }, 1500);
            }
        } catch (error) {
            console.error('Error issuing book:', error);
            setError(error.response?.data?.message || 'Failed to issue book');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-slate-50">
            <AdminSidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

            <div className="flex-1 flex flex-col overflow-hidden">
                <AdminHeader isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

                <main className="flex-1 overflow-y-auto">
                    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
                        <div className="mb-8 flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 mb-2">Issue Book</h1>
                                <p className="text-slate-600">Issue a book to a student</p>
                            </div>
                            <button
                                onClick={() => navigate('/admin/transactions/history')}
                                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors"
                            >
                                <X className="w-5 h-5" />
                                Cancel
                            </button>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <p className="text-red-800 text-sm">{error}</p>
                            </div>
                        )}

                        {success && (
                            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                <p className="text-emerald-800 text-sm">{success}</p>
                            </div>
                        )}

                        <form onSubmit={handleIssueBook} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                            {/* Select Student */}
                            <div className="mb-8">
                                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <User className="w-5 h-5 text-blue-600" />
                                    Select Student
                                </h3>

                                {selectedStudent ? (
                                    <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                                                {selectedStudent.name[0]}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-slate-900">{selectedStudent.name}</h4>
                                                <p className="text-sm text-slate-600">{selectedStudent.studentId} • {selectedStudent.email}</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedStudent(null)}
                                            className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                                        >
                                            <X className="w-5 h-5 text-slate-600" />
                                        </button>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="relative mb-2">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <input
                                                type="text"
                                                placeholder="Search student by name or roll number..."
                                                value={studentSearch}
                                                onChange={(e) => setStudentSearch(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>

                                        {students.length > 0 && (
                                            <div className="mt-2 max-h-64 overflow-y-auto border border-slate-200 rounded-xl">
                                                {students.map((student) => (
                                                    <button
                                                        key={student._id}
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedStudent(student);
                                                            setStudentSearch('');
                                                            setStudents([]);
                                                        }}
                                                        className="w-full p-4 hover:bg-slate-50 transition-colors text-left border-b border-slate-100 last:border-0"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                                                                {student.name[0]}
                                                            </div>
                                                            <div>
                                                                <h4 className="font-semibold text-slate-900">{student.name}</h4>
                                                                <p className="text-sm text-slate-600">{student.studentId} • {student.email}</p>
                                                            </div>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Select Book */}
                            <div className="mb-8">
                                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <BookMarked className="w-5 h-5 text-blue-600" />
                                    Select Book
                                </h3>

                                {selectedBook ? (
                                    <div className="p-4 bg-emerald-50 border-2 border-emerald-200 rounded-xl flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center text-white shadow-md">
                                                <BookMarked className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-slate-900">{selectedBook.title}</h4>
                                                <p className="text-sm text-slate-600">{selectedBook.author?.join(', ')}</p>
                                                <span className="text-xs text-emerald-600 font-medium">
                                                    {selectedBook.availableCopies} available
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedBook(null)}
                                            className="p-2 hover:bg-emerald-100 rounded-lg transition-colors"
                                        >
                                            <X className="w-5 h-5 text-slate-600" />
                                        </button>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="relative mb-2">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <input
                                                type="text"
                                                placeholder="Search book by title or ISBN..."
                                                value={bookSearch}
                                                onChange={(e) => setBookSearch(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>

                                        {books.length > 0 && (
                                            <div className="mt-2 max-h-64 overflow-y-auto border border-slate-200 rounded-xl">
                                                {books.map((book) => (
                                                    <button
                                                        key={book._id}
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedBook(book);
                                                            setBookSearch('');
                                                            setBooks([]);
                                                        }}
                                                        className="w-full p-4 hover:bg-slate-50 transition-colors text-left border-b border-slate-100 last:border-0"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md">
                                                                <BookMarked className="w-5 h-5" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <h4 className="font-semibold text-slate-900">{book.title}</h4>
                                                                <p className="text-sm text-slate-600">{book.author?.join(', ')}</p>
                                                                <span className="text-xs text-emerald-600 font-medium">
                                                                    {book.availableCopies} copies available
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Due Date */}
                            <div className="mb-8">
                                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-blue-600" />
                                    Due Date
                                </h3>
                                <input
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    required
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-200">
                                <button
                                    type="button"
                                    onClick={() => navigate('/admin/transactions/history')}
                                    className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || !selectedStudent || !selectedBook}
                                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Issuing...
                                        </>
                                    ) : (
                                        <>
                                            <BookMarked className="w-5 h-5" />
                                            Issue Book
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default IssueBook;
