import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import StatsCards from '../components/StatsCards';
import RecentBooks from '../components/RecentBooks';
import RecentTransactions from '../components/RecentTransactions';
import PendingApprovals from '../components/PendingApprovals';
import Sidebar from '../components/Sidebar';
import Modal from '../components/Modal';

const API_BASE_URL = 'http://localhost:5000/api';

export default function LibrarianDashboard() {
    const { user } = useSelector((state) => state.auth);
    const [dashboardData, setDashboardData] = useState({
        stats: {
            totalBooks: 0,
            issuedBooks: 0,
            totalStudents: 0,
            overdueBooks: 0,
        },
        books: [],
        students: [],
        transactions: [],
        pendingStudents: [],
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('overview');

    // Search states
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [yearFilter, setYearFilter] = useState('');

    // Modal states
    const [showAddBookModal, setShowAddBookModal] = useState(false);
    const [showAddStudentModal, setShowAddStudentModal] = useState(false);
    const [showIssueBookModal, setShowIssueBookModal] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('');
    const [editingItem, setEditingItem] = useState(null);

    // Add Book Form State
    const [bookForm, setBookForm] = useState({
        isbn: '',
        title: '',
        author: [''],
        category: '',
        subject: '',
        publisher: '',
        publishedYear: new Date().getFullYear(),
        edition: '',
        pages: '',
        language: 'English',
        totalCopies: 1,
        availableCopies: 1,
        description: '',
        price: '',
        condition: 'Good',
        tags: []
    });

    // Issue Book Form State
    const [issueBookForm, setIssueBookForm] = useState({
        bookId: '',
        studentId: '',
        dueDate: '',
        notes: ''
    });

    // Student Form State
    const [studentForm, setStudentForm] = useState({
        name: '',
        email: '',
        studentId: '',
        year: '',
        course: '',
        phone: '',
        address: ''
    });

    useEffect(() => {
        async function fetchDashboardData() {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };
                const [booksRes, studentsRes, transactionsRes, pendingStudentsRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/books?limit=100`, { headers }),
                    axios.get(`${API_BASE_URL}/students?limit=100`, { headers }),
                    axios.get(`${API_BASE_URL}/transactions?limit=50`, { headers }),
                    axios.get(`${API_BASE_URL}/students/pending/list`, { headers }),
                ]);
                const books = booksRes.data.data?.books || [];
                const students = studentsRes.data.data?.students || [];
                const transactions = transactionsRes.data.data?.transactions || [];
                const pendingStudents = pendingStudentsRes.data.data?.students || [];
                const issuedBooks = transactions.filter(t => t.status === 'issued').length;
                const overdueBooks = transactions.filter(t => t.status === 'issued' && t.dueDate && new Date(t.dueDate) < new Date()).length;
                setDashboardData({
                    stats: {
                        totalBooks: books.length,
                        issuedBooks,
                        totalStudents: students.length,
                        overdueBooks,
                    },
                    books,
                    students,
                    transactions,
                    pendingStudents,
                });
                setError('');
            } catch (err) {
                setError('Failed to load dashboard data.');
            } finally {
                setLoading(false);
            }
        }
        fetchDashboardData();
    }, []);

    // Handler functions
    const handleApproveStudent = async (studentId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE_URL}/students/${studentId}/approve`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Refresh data after approval
            fetchDashboardData();
            alert('Student approved successfully!');
        } catch (err) {
            setError('Failed to approve student.');
            alert('Failed to approve student.');
        }
    };

    const handleRejectStudent = async (studentId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_BASE_URL}/students/${studentId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchDashboardData();
            alert('Student rejected successfully!');
        } catch (err) {
            setError('Failed to reject student.');
            alert('Failed to reject student.');
        }
    };

    const handleDeleteBook = async (bookId) => {
        if (window.confirm('Are you sure you want to delete this book?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${API_BASE_URL}/books/${bookId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                fetchDashboardData();
                alert('Book deleted successfully!');
            } catch (err) {
                setError('Failed to delete book.');
                alert('Failed to delete book.');
            }
        }
    };

    const handleCollectBook = async (transactionId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_BASE_URL}/transactions/collect/${transactionId}`, {
                notes: 'Book collected by librarian',
                bookCondition: 'good'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchDashboardData();
            alert('Book collected successfully!');
        } catch (err) {
            setError('Failed to collect book.');
            alert('Failed to collect book.');
        }
    };

    const handleDeleteStudent = async (studentId) => {
        if (window.confirm('Are you sure you want to delete this student?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${API_BASE_URL}/students/${studentId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                fetchDashboardData();
                alert('Student deleted successfully!');
            } catch (err) {
                setError('Failed to delete student.');
                alert('Failed to delete student.');
            }
        }
    };

    // Modal and form handlers
    const handleAddBook = () => {
        setModalType('addBook');
        setShowModal(true);
    };

    const handleAddStudent = () => {
        setModalType('addStudent');
        setShowModal(true);
    };

    // Edit Book handlers
    const handleEditBook = async (bookId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/books/${bookId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const book = response.data;
            setBookForm({
                isbn: book.isbn || '',
                title: book.title || '',
                author: book.author || [''],
                category: book.category || '',
                subject: book.subject || '',
                publisher: book.publisher || '',
                publishedYear: book.publishedYear || new Date().getFullYear(),
                edition: book.edition || '',
                pages: book.pages || '',
                language: book.language || 'English',
                totalCopies: book.totalCopies || 1,
                availableCopies: book.availableCopies || 1,
                description: book.description || '',
                price: book.price || '',
                condition: book.condition || 'Good',
                tags: book.tags || []
            });
            setEditingItem({ type: 'book', id: bookId });
            setModalType('editBook');
            setShowModal(true);
        } catch (err) {
            console.error('Error fetching book details:', err);
            alert('Failed to load book details.');
        }
    };

    // Student handlers  
    const handleEditStudent = async (studentId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/students/${studentId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const student = response.data;
            setStudentForm({
                name: student.name || '',
                email: student.email || '',
                studentId: student.studentId || '',
                year: student.year || '',
                course: student.course || '',
                phone: student.phone || '',
                address: student.address || ''
            });
            setEditingItem({ type: 'student', id: studentId });
            setModalType('editStudent');
            setShowModal(true);
        } catch (err) {
            console.error('Error fetching student details:', err);
            alert('Failed to load student details.');
        }
    };

    // Form handlers
    const handleBookFormChange = (field, value) => {
        setBookForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleAuthorChange = (index, value) => {
        const newAuthors = [...bookForm.author];
        newAuthors[index] = value;
        setBookForm(prev => ({
            ...prev,
            author: newAuthors
        }));
    };

    const addAuthor = () => {
        setBookForm(prev => ({
            ...prev,
            author: [...prev.author, '']
        }));
    };

    const removeAuthor = (index) => {
        if (bookForm.author.length > 1) {
            const newAuthors = bookForm.author.filter((_, i) => i !== index);
            setBookForm(prev => ({
                ...prev,
                author: newAuthors
            }));
        }
    };

    const resetBookForm = () => {
        setBookForm({
            isbn: '',
            title: '',
            author: [''],
            category: '',
            subject: '',
            publisher: '',
            publishedYear: new Date().getFullYear(),
            edition: '',
            pages: '',
            language: 'English',
            totalCopies: 1,
            availableCopies: 1,
            description: '',
            price: '',
            condition: 'Good',
            tags: []
        });
    };

    const handleSubmitBook = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');

            // Filter out empty authors
            const filteredAuthors = bookForm.author.filter(author => author.trim() !== '');

            const bookData = {
                ...bookForm,
                author: filteredAuthors,
                pages: bookForm.pages ? parseInt(bookForm.pages) : undefined,
                price: bookForm.price ? parseFloat(bookForm.price) : undefined,
                totalCopies: parseInt(bookForm.totalCopies),
                availableCopies: parseInt(bookForm.availableCopies),
                publishedYear: parseInt(bookForm.publishedYear)
            };

            await axios.post(`${API_BASE_URL}/books`, bookData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert('Book added successfully!');
            setShowModal(false);
            resetBookForm();
            fetchDashboardData();
        } catch (err) {
            console.error('Error adding book:', err);
            alert('Failed to add book. Please check all required fields.');
        }
    };

    // Issue Book handlers
    const handleIssueBook = (bookId) => {
        setIssueBookForm(prev => ({
            ...prev,
            bookId: bookId,
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 14 days from now
        }));
        setModalType('issueBook');
        setShowModal(true);
    };

    const handleIssueBookFormChange = (field, value) => {
        setIssueBookForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const resetIssueBookForm = () => {
        setIssueBookForm({
            bookId: '',
            studentId: '',
            dueDate: '',
            notes: ''
        });
    };

    const handleSubmitIssueBook = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE_URL}/transactions/issue`, issueBookForm, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert('Book issued successfully!');
            setShowModal(false);
            resetIssueBookForm();
            fetchDashboardData();
        } catch (err) {
            console.error('Error issuing book:', err);
            alert('Failed to issue book. Please try again.');
        }
    };



    const handleSubmitEditBook = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');

            const filteredAuthors = bookForm.author.filter(author => author.trim() !== '');

            const bookData = {
                ...bookForm,
                author: filteredAuthors,
                pages: bookForm.pages ? parseInt(bookForm.pages) : undefined,
                price: bookForm.price ? parseFloat(bookForm.price) : undefined,
                totalCopies: parseInt(bookForm.totalCopies),
                availableCopies: parseInt(bookForm.availableCopies),
                publishedYear: parseInt(bookForm.publishedYear)
            };

            await axios.put(`${API_BASE_URL}/books/${editingItem.id}`, bookData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert('Book updated successfully!');
            setShowModal(false);
            setEditingItem(null);
            resetBookForm();
            fetchDashboardData();
        } catch (err) {
            console.error('Error updating book:', err);
            alert('Failed to update book. Please check all required fields.');
        }
    };

    // Student handlers
    const handleStudentFormChange = (field, value) => {
        setStudentForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const resetStudentForm = () => {
        setStudentForm({
            name: '',
            email: '',
            studentId: '',
            year: '',
            course: '',
            phone: '',
            address: ''
        });
    };

    const handleViewStudent = async (studentId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/students/${studentId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const student = response.data;
            setStudentForm({
                name: student.name || '',
                email: student.email || '',
                studentId: student.studentId || '',
                year: student.year || '',
                course: student.course || '',
                phone: student.phone || '',
                address: student.address || ''
            });
            setEditingItem({ type: 'student', id: studentId });
            setModalType('viewStudent');
            setShowModal(true);
        } catch (err) {
            console.error('Error fetching student details:', err);
            alert('Failed to load student details.');
        }
    };



    const handleSubmitEditStudent = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_BASE_URL}/students/${editingItem.id}`, studentForm, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert('Student updated successfully!');
            setShowModal(false);
            setEditingItem(null);
            resetStudentForm();
            fetchDashboardData();
        } catch (err) {
            console.error('Error updating student:', err);
            alert('Failed to update student. Please check all required fields.');
        }
    };

    const handleSubmitAddStudent = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE_URL}/students`, studentForm, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert('Student added successfully!');
            setShowModal(false);
            resetStudentForm();
            fetchDashboardData();
        } catch (err) {
            console.error('Error adding student:', err);
            alert('Failed to add student. Please check all required fields.');
        }
    };

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            const [booksRes, studentsRes, transactionsRes, pendingStudentsRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/books?limit=100`, { headers }),
                axios.get(`${API_BASE_URL}/students?limit=100`, { headers }),
                axios.get(`${API_BASE_URL}/transactions?limit=50`, { headers }),
                axios.get(`${API_BASE_URL}/students/pending/list`, { headers }),
            ]);
            const books = booksRes.data.data?.books || [];
            const students = studentsRes.data.data?.students || [];
            const transactions = transactionsRes.data.data?.transactions || [];
            const pendingStudents = pendingStudentsRes.data.data?.students || [];
            const issuedBooks = transactions.filter(t => t.status === 'issued').length;
            const overdueBooks = transactions.filter(t => t.status === 'issued' && t.dueDate && new Date(t.dueDate) < new Date()).length;
            setDashboardData({
                stats: {
                    totalBooks: books.length,
                    issuedBooks,
                    totalStudents: students.length,
                    overdueBooks,
                },
                books,
                students,
                transactions,
                pendingStudents,
            });
            setError('');
        } catch (err) {
            setError('Failed to load dashboard data.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center text-red-600">{error}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <Sidebar user={user} activeTab={activeTab} setActiveTab={setActiveTab} />
            <main className="flex-1 p-4 sm:p-8">
                {activeTab === 'overview' && (
                    <>
                        <StatsCards stats={dashboardData.stats} pendingCount={dashboardData.pendingStudents.length} />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                            <RecentBooks books={dashboardData.books} />
                            <RecentTransactions transactions={dashboardData.transactions} />
                            <PendingApprovals pendingStudents={dashboardData.pendingStudents} />
                        </div>
                    </>
                )}
                {activeTab === 'books' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold">All Books ({dashboardData.books.length})</h2>
                                <div className="flex gap-2">
                                    <button
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                                        onClick={handleAddBook}
                                    >
                                        <span>+</span> Add Book
                                    </button>
                                    <button
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                        onClick={() => {
                                            setModalType('issueBook');
                                            setShowModal(true);
                                        }}
                                    >
                                        Issue Book
                                    </button>
                                </div>
                            </div>
                            <div className="mb-4">
                                <input
                                    type="text"
                                    placeholder="Search books by title, author, or ISBN..."
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full table-auto">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left">Title</th>
                                            <th className="px-4 py-2 text-left">Author</th>
                                            <th className="px-4 py-2 text-left">Available/Total</th>
                                            <th className="px-4 py-2 text-left">Category</th>
                                            <th className="px-4 py-2 text-left">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(dashboardData.books || [])
                                            .filter(book =>
                                                book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                book.author?.join(' ').toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                book.isbn?.toLowerCase().includes(searchTerm.toLowerCase())
                                            )
                                            .map(book => (
                                                <tr key={book._id} className="border-b hover:bg-gray-50">
                                                    <td className="px-4 py-2 font-medium">{book.title}</td>
                                                    <td className="px-4 py-2">{book.author?.join(', ')}</td>
                                                    <td className="px-4 py-2">
                                                        <span className={`font-semibold ${book.availableCopies > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                            {book.availableCopies}/{book.totalCopies}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-2">{book.category}</td>
                                                    <td className="px-4 py-2">
                                                        <div className="flex gap-1">
                                                            {book.availableCopies > 0 && (
                                                                <button
                                                                    className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                                                                    onClick={() => handleIssueBook(book._id)}
                                                                >
                                                                    Issue
                                                                </button>
                                                            )}
                                                            <button
                                                                className="px-2 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600"
                                                                onClick={() => handleEditBook(book._id)}
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                                                                onClick={() => handleDeleteBook(book._id)}
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'students' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold">All Students ({dashboardData.students.length})</h2>
                                <div className="flex gap-2">
                                    <button
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                                        onClick={handleAddStudent}
                                    >
                                        <span>+</span> Add Student
                                    </button>
                                    <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                                        Export List
                                    </button>
                                </div>
                            </div>
                            <div className="mb-4 flex gap-4">
                                <input
                                    type="text"
                                    placeholder="Search students by name, email, or ID..."
                                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <select className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="">All Years</option>
                                    <option value="1">Year 1</option>
                                    <option value="2">Year 2</option>
                                    <option value="3">Year 3</option>
                                    <option value="4">Year 4</option>
                                </select>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full table-auto">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left">Name</th>
                                            <th className="px-4 py-2 text-left">Student ID</th>
                                            <th className="px-4 py-2 text-left">Email</th>
                                            <th className="px-4 py-2 text-left">Year</th>
                                            <th className="px-4 py-2 text-left">Status</th>
                                            <th className="px-4 py-2 text-left">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(dashboardData.students || []).map(student => (
                                            <tr key={student._id} className="border-b hover:bg-gray-50">
                                                <td className="px-4 py-2 font-medium">{student.name}</td>
                                                <td className="px-4 py-2">{student.studentId}</td>
                                                <td className="px-4 py-2">{student.email}</td>
                                                <td className="px-4 py-2">{student.year || 'N/A'}</td>
                                                <td className="px-4 py-2">
                                                    <span className={`px-2 py-1 text-xs rounded-full ${student.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                        {student.isApproved ? 'Approved' : 'Pending'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2">
                                                    <div className="flex gap-1">
                                                        <button
                                                            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                                                            onClick={() => handleViewStudent(student._id)}
                                                        >
                                                            View
                                                        </button>
                                                        <button
                                                            className="px-2 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600"
                                                            onClick={() => handleEditStudent(student._id)}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                                                            onClick={() => handleDeleteStudent(student._id)}
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'transactions' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold">All Transactions ({dashboardData.transactions.length})</h2>
                                <div className="flex gap-2">
                                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                                        Issue Book
                                    </button>
                                    <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                                        Return Book
                                    </button>
                                </div>
                            </div>
                            <div className="mb-4 flex gap-4">
                                <input
                                    type="text"
                                    placeholder="Search by book title or student name..."
                                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <select className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="">All Status</option>
                                    <option value="issued">Issued</option>
                                    <option value="returned">Returned</option>
                                    <option value="overdue">Overdue</option>
                                </select>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full table-auto">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left">Book</th>
                                            <th className="px-4 py-2 text-left">Student</th>
                                            <th className="px-4 py-2 text-left">Issue Date</th>
                                            <th className="px-4 py-2 text-left">Due Date</th>
                                            <th className="px-4 py-2 text-left">Status</th>
                                            <th className="px-4 py-2 text-left">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(dashboardData.transactions || []).map(transaction => (
                                            <tr key={transaction._id} className="border-b hover:bg-gray-50">
                                                <td className="px-4 py-2 font-medium">{transaction.bookId?.title}</td>
                                                <td className="px-4 py-2">{transaction.studentId?.name}</td>
                                                <td className="px-4 py-2">{new Date(transaction.issueDate).toLocaleDateString()}</td>
                                                <td className="px-4 py-2">{new Date(transaction.dueDate).toLocaleDateString()}</td>
                                                <td className="px-4 py-2">
                                                    <span className={`px-2 py-1 text-xs rounded-full ${transaction.status === 'issued' ? 'bg-yellow-100 text-yellow-800' :
                                                        transaction.status === 'returned' ? 'bg-green-100 text-green-800' :
                                                            'bg-red-100 text-red-800'
                                                        }`}>
                                                        {transaction.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2">
                                                    <div className="flex gap-1">
                                                        {transaction.status === 'issued' && (
                                                            <button
                                                                className="px-2 py-1 text-xs bg-orange-500 text-white rounded hover:bg-orange-600"
                                                                onClick={() => handleCollectBook(transaction._id)}
                                                            >
                                                                Collect
                                                            </button>
                                                        )}
                                                        <button className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600">View</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'pending' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold">Pending Student Approvals ({dashboardData.pendingStudents.length})</h2>
                                <div className="flex gap-2">
                                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                                        Approve All
                                    </button>
                                    <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                                        Reject All
                                    </button>
                                </div>
                            </div>
                            <div className="mb-4">
                                <input
                                    type="text"
                                    placeholder="Search pending students..."
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {dashboardData.pendingStudents.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <p>No pending approvals</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full table-auto">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-2 text-left">Name</th>
                                                <th className="px-4 py-2 text-left">Student ID</th>
                                                <th className="px-4 py-2 text-left">Email</th>
                                                <th className="px-4 py-2 text-left">Registration Date</th>
                                                <th className="px-4 py-2 text-left">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {dashboardData.pendingStudents.map(student => (
                                                <tr key={student._id} className="border-b hover:bg-gray-50">
                                                    <td className="px-4 py-2 font-medium">{student.name}</td>
                                                    <td className="px-4 py-2">{student.studentId}</td>
                                                    <td className="px-4 py-2">{student.email}</td>
                                                    <td className="px-4 py-2">{new Date(student.createdAt).toLocaleDateString()}</td>
                                                    <td className="px-4 py-2">
                                                        <div className="flex gap-2">
                                                            <button
                                                                className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                                                                onClick={() => handleApproveStudent(student._id)}
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                                                                onClick={() => handleRejectStudent(student._id)}
                                                            >
                                                                Reject
                                                            </button>
                                                            <button className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
                                                                View Details
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>

            {/* Add Book Modal */}
            <Modal
                isOpen={showModal && modalType === 'addBook'}
                onClose={() => {
                    setShowModal(false);
                    resetBookForm();
                }}
                title="Add New Book"
            >
                <form onSubmit={handleSubmitBook} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* ISBN */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                ISBN (Optional)
                            </label>
                            <input
                                type="text"
                                value={bookForm.isbn}
                                onChange={(e) => handleBookFormChange('isbn', e.target.value)}
                                placeholder="e.g., 9781234567890"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={bookForm.title}
                                onChange={(e) => handleBookFormChange('title', e.target.value)}
                                placeholder="Enter book title"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Authors */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Authors <span className="text-red-500">*</span>
                        </label>
                        {bookForm.author.map((author, index) => (
                            <div key={index} className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={author}
                                    onChange={(e) => handleAuthorChange(index, e.target.value)}
                                    placeholder={`Author ${index + 1}`}
                                    required={index === 0}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {bookForm.author.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeAuthor(index)}
                                        className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addAuthor}
                            className="mt-2 px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
                        >
                            + Add Author
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Category <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={bookForm.category}
                                onChange={(e) => handleBookFormChange('category', e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select Category</option>
                                <option value="Electronics">Electronics</option>
                                <option value="Power Systems">Power Systems</option>
                                <option value="Control Systems">Control Systems</option>
                                <option value="Electrical Machines">Electrical Machines</option>
                                <option value="Power Electronics">Power Electronics</option>
                                <option value="Renewable Energy">Renewable Energy</option>
                                <option value="Circuit Analysis">Circuit Analysis</option>
                                <option value="Digital Electronics">Digital Electronics</option>
                                <option value="Analog Electronics">Analog Electronics</option>
                                <option value="Microprocessors">Microprocessors</option>
                                <option value="Signal Processing">Signal Processing</option>
                                <option value="Communication Systems">Communication Systems</option>
                                <option value="Electromagnetic Theory">Electromagnetic Theory</option>
                                <option value="General Engineering">General Engineering</option>
                                <option value="Mathematics">Mathematics</option>
                                <option value="Physics">Physics</option>
                                <option value="Research Papers">Research Papers</option>
                                <option value="Journals">Journals</option>
                            </select>
                        </div>

                        {/* Subject */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Subject <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={bookForm.subject}
                                onChange={(e) => handleBookFormChange('subject', e.target.value)}
                                placeholder="Enter subject"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Publisher */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Publisher <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={bookForm.publisher}
                                onChange={(e) => handleBookFormChange('publisher', e.target.value)}
                                placeholder="Enter publisher"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Published Year */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Published Year <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                value={bookForm.publishedYear}
                                onChange={(e) => handleBookFormChange('publishedYear', e.target.value)}
                                min="1900"
                                max={new Date().getFullYear()}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Edition */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Edition
                            </label>
                            <input
                                type="text"
                                value={bookForm.edition}
                                onChange={(e) => handleBookFormChange('edition', e.target.value)}
                                placeholder="e.g., 2nd Edition"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Pages */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Pages
                            </label>
                            <input
                                type="number"
                                value={bookForm.pages}
                                onChange={(e) => handleBookFormChange('pages', e.target.value)}
                                min="1"
                                placeholder="Number of pages"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Language */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Language
                            </label>
                            <input
                                type="text"
                                value={bookForm.language}
                                onChange={(e) => handleBookFormChange('language', e.target.value)}
                                placeholder="e.g., English"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Total Copies */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Total Copies <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                value={bookForm.totalCopies}
                                onChange={(e) => {
                                    const value = parseInt(e.target.value) || 1;
                                    handleBookFormChange('totalCopies', value);
                                    // Update available copies if it exceeds total
                                    if (bookForm.availableCopies > value) {
                                        handleBookFormChange('availableCopies', value);
                                    }
                                }}
                                min="1"
                                max="100"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Available Copies */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Available Copies <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                value={bookForm.availableCopies}
                                onChange={(e) => handleBookFormChange('availableCopies', parseInt(e.target.value) || 0)}
                                min="0"
                                max={bookForm.totalCopies}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Price */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Price ($)
                            </label>
                            <input
                                type="number"
                                value={bookForm.price}
                                onChange={(e) => handleBookFormChange('price', e.target.value)}
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Condition */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Condition
                            </label>
                            <select
                                value={bookForm.condition}
                                onChange={(e) => handleBookFormChange('condition', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="New">New</option>
                                <option value="Good">Good</option>
                                <option value="Fair">Fair</option>
                                <option value="Poor">Poor</option>
                            </select>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            value={bookForm.description}
                            onChange={(e) => handleBookFormChange('description', e.target.value)}
                            placeholder="Brief description of the book..."
                            rows="3"
                            maxLength="1000"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        ></textarea>
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <button
                            type="button"
                            onClick={() => {
                                setShowModal(false);
                                resetBookForm();
                            }}
                            className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Add Book
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Edit Book Modal */}
            <Modal
                isOpen={showModal && modalType === 'editBook'}
                onClose={() => {
                    setShowModal(false);
                    setEditingItem(null);
                    resetBookForm();
                }}
                title="Edit Book"
            >
                <form onSubmit={handleSubmitEditBook} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* ISBN */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                ISBN (Optional)
                            </label>
                            <input
                                type="text"
                                value={bookForm.isbn}
                                onChange={(e) => handleBookFormChange('isbn', e.target.value)}
                                placeholder="e.g., 9781234567890"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={bookForm.title}
                                onChange={(e) => handleBookFormChange('title', e.target.value)}
                                placeholder="Enter book title"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Authors */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Authors <span className="text-red-500">*</span>
                        </label>
                        {bookForm.author.map((author, index) => (
                            <div key={index} className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={author}
                                    onChange={(e) => handleAuthorChange(index, e.target.value)}
                                    placeholder={`Author ${index + 1}`}
                                    required={index === 0}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {bookForm.author.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeAuthor(index)}
                                        className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addAuthor}
                            className="mt-2 px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
                        >
                            + Add Author
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Category <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={bookForm.category}
                                onChange={(e) => handleBookFormChange('category', e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select Category</option>
                                <option value="Electronics">Electronics</option>
                                <option value="Power Systems">Power Systems</option>
                                <option value="Control Systems">Control Systems</option>
                                <option value="Electrical Machines">Electrical Machines</option>
                                <option value="Power Electronics">Power Electronics</option>
                                <option value="Renewable Energy">Renewable Energy</option>
                                <option value="Circuit Analysis">Circuit Analysis</option>
                                <option value="Digital Electronics">Digital Electronics</option>
                                <option value="Analog Electronics">Analog Electronics</option>
                                <option value="Microprocessors">Microprocessors</option>
                                <option value="Signal Processing">Signal Processing</option>
                                <option value="Communication Systems">Communication Systems</option>
                                <option value="Electromagnetic Theory">Electromagnetic Theory</option>
                                <option value="General Engineering">General Engineering</option>
                                <option value="Mathematics">Mathematics</option>
                                <option value="Physics">Physics</option>
                                <option value="Research Papers">Research Papers</option>
                                <option value="Journals">Journals</option>
                            </select>
                        </div>

                        {/* Subject */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Subject <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={bookForm.subject}
                                onChange={(e) => handleBookFormChange('subject', e.target.value)}
                                placeholder="Enter subject"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Publisher */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Publisher <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={bookForm.publisher}
                                onChange={(e) => handleBookFormChange('publisher', e.target.value)}
                                placeholder="Enter publisher"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Published Year */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Published Year <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                value={bookForm.publishedYear}
                                onChange={(e) => handleBookFormChange('publishedYear', e.target.value)}
                                min="1900"
                                max={new Date().getFullYear()}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Total Copies */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Total Copies <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                value={bookForm.totalCopies}
                                onChange={(e) => {
                                    const value = parseInt(e.target.value) || 1;
                                    handleBookFormChange('totalCopies', value);
                                    if (bookForm.availableCopies > value) {
                                        handleBookFormChange('availableCopies', value);
                                    }
                                }}
                                min="1"
                                max="100"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Available Copies */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Available Copies <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                value={bookForm.availableCopies}
                                onChange={(e) => handleBookFormChange('availableCopies', parseInt(e.target.value) || 0)}
                                min="0"
                                max={bookForm.totalCopies}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <button
                            type="button"
                            onClick={() => {
                                setShowModal(false);
                                setEditingItem(null);
                                resetBookForm();
                            }}
                            className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Update Book
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Issue Book Modal */}
            <Modal
                isOpen={showModal && modalType === 'issueBook'}
                onClose={() => {
                    setShowModal(false);
                    resetIssueBookForm();
                }}
                title="Issue Book"
            >
                <form onSubmit={handleSubmitIssueBook} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                        {/* Book Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Book <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={issueBookForm.bookId}
                                onChange={(e) => handleIssueBookFormChange('bookId', e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select a book</option>
                                {dashboardData.books.filter(book => book.availableCopies > 0).map((book) => (
                                    <option key={book._id} value={book._id}>
                                        {book.title} by {book.author?.join(', ')} (Available: {book.availableCopies})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Student Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Student <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={issueBookForm.studentId}
                                onChange={(e) => handleIssueBookFormChange('studentId', e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select a student</option>
                                {dashboardData.students.filter(student => student.isApproved).map((student) => (
                                    <option key={student._id} value={student._id}>
                                        {student.name} - {student.studentId} ({student.email})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Due Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Due Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={issueBookForm.dueDate}
                                onChange={(e) => handleIssueBookFormChange('dueDate', e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Notes
                            </label>
                            <textarea
                                value={issueBookForm.notes}
                                onChange={(e) => handleIssueBookFormChange('notes', e.target.value)}
                                placeholder="Optional notes..."
                                rows="3"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            ></textarea>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <button
                            type="button"
                            onClick={() => {
                                setShowModal(false);
                                resetIssueBookForm();
                            }}
                            className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                            Issue Book
                        </button>
                    </div>
                </form>
            </Modal>

            {/* View Student Modal */}
            <Modal
                isOpen={showModal && modalType === 'viewStudent'}
                onClose={() => {
                    setShowModal(false);
                    setEditingItem(null);
                    resetStudentForm();
                }}
                title="Student Details"
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <p className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">{studentForm.name}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
                            <p className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">{studentForm.studentId}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <p className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">{studentForm.email}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                            <p className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">{studentForm.year || 'N/A'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                            <p className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">{studentForm.course || 'N/A'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                            <p className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">{studentForm.phone || 'N/A'}</p>
                        </div>
                    </div>

                    {studentForm.address && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                            <p className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">{studentForm.address}</p>
                        </div>
                    )}

                    <div className="flex justify-end pt-4 border-t">
                        <button
                            onClick={() => {
                                setShowModal(false);
                                setEditingItem(null);
                                resetStudentForm();
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Edit Student Modal */}
            <Modal
                isOpen={showModal && modalType === 'editStudent'}
                onClose={() => {
                    setShowModal(false);
                    setEditingItem(null);
                    resetStudentForm();
                }}
                title="Edit Student"
            >
                <form onSubmit={handleSubmitEditStudent} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={studentForm.name}
                                onChange={(e) => handleStudentFormChange('name', e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Student ID <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={studentForm.studentId}
                                onChange={(e) => handleStudentFormChange('studentId', e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                value={studentForm.email}
                                onChange={(e) => handleStudentFormChange('email', e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                            <select
                                value={studentForm.year}
                                onChange={(e) => handleStudentFormChange('year', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select Year</option>
                                <option value="1">1st Year</option>
                                <option value="2">2nd Year</option>
                                <option value="3">3rd Year</option>
                                <option value="4">4th Year</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                            <input
                                type="text"
                                value={studentForm.course}
                                onChange={(e) => handleStudentFormChange('course', e.target.value)}
                                placeholder="e.g., Electrical Engineering"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                            <input
                                type="tel"
                                value={studentForm.phone}
                                onChange={(e) => handleStudentFormChange('phone', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                        <textarea
                            value={studentForm.address}
                            onChange={(e) => handleStudentFormChange('address', e.target.value)}
                            rows="3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        ></textarea>
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <button
                            type="button"
                            onClick={() => {
                                setShowModal(false);
                                setEditingItem(null);
                                resetStudentForm();
                            }}
                            className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Update Student
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Add Student Modal */}
            <Modal
                isOpen={showModal && modalType === 'addStudent'}
                onClose={() => {
                    setShowModal(false);
                    resetStudentForm();
                }}
                title="Add New Student"
            >
                <form onSubmit={handleSubmitAddStudent} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={studentForm.name}
                                onChange={(e) => handleStudentFormChange('name', e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Student ID <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={studentForm.studentId}
                                onChange={(e) => handleStudentFormChange('studentId', e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                value={studentForm.email}
                                onChange={(e) => handleStudentFormChange('email', e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                            <select
                                value={studentForm.year}
                                onChange={(e) => handleStudentFormChange('year', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select Year</option>
                                <option value="1">1st Year</option>
                                <option value="2">2nd Year</option>
                                <option value="3">3rd Year</option>
                                <option value="4">4th Year</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                            <input
                                type="text"
                                value={studentForm.course}
                                onChange={(e) => handleStudentFormChange('course', e.target.value)}
                                placeholder="e.g., Electrical Engineering"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                            <input
                                type="tel"
                                value={studentForm.phone}
                                onChange={(e) => handleStudentFormChange('phone', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                        <textarea
                            value={studentForm.address}
                            onChange={(e) => handleStudentFormChange('address', e.target.value)}
                            rows="3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        ></textarea>
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <button
                            type="button"
                            onClick={() => {
                                setShowModal(false);
                                resetStudentForm();
                            }}
                            className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Add Student
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
