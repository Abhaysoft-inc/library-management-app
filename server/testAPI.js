const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testAPI() {
    console.log('🧪 Testing Library Management API...\n');

    try {
        // Test 1: Check server status
        console.log('1. Testing server status...');
        const statusResponse = await axios.get('http://localhost:5000/');
        console.log('✅ Server status:', statusResponse.data.message);

        // Test 2: Admin login
        console.log('\n2. Testing admin login...');
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'admin@eelibrary.com',
            password: 'admin123456'
        });
        console.log('✅ Admin login successful');

        const adminToken = loginResponse.data.data.token;
        const headers = { Authorization: `Bearer ${adminToken}` };

        // Test 3: Get books (should be empty initially)
        console.log('\n3. Testing get books...');
        const booksResponse = await axios.get(`${BASE_URL}/books`);
        console.log('✅ Books retrieved:', booksResponse.data.data.books.length, 'books found');

        // Test 4: Add a sample book
        console.log('\n4. Testing add book...');
        const bookData = {
            title: 'Electrical Circuit Analysis',
            author: ['Robert L. Boylestad'],
            category: 'Circuit Analysis',
            subject: 'Basic Electrical Engineering',
            publisher: 'Pearson',
            publishedYear: 2020,
            totalCopies: 5,
            location: {
                shelf: 'A1',
                section: 'Circuit Analysis',
                floor: 1
            },
            description: 'Comprehensive guide to electrical circuit analysis'
        };

        const addBookResponse = await axios.post(`${BASE_URL}/books`, bookData, { headers });
        console.log('✅ Book added successfully:', addBookResponse.data.data.book.title);
        const bookId = addBookResponse.data.data.book._id;

        // Test 5: Get book categories
        console.log('\n5. Testing get categories...');
        const categoriesResponse = await axios.get(`${BASE_URL}/books/categories/list`);
        console.log('✅ Categories retrieved:', categoriesResponse.data.data.categories);

        // Test 6: Student registration
        console.log('\n6. Testing student registration...');
        const studentData = {
            studentId: 'EE2021',
            name: 'John Doe',
            email: 'john.doe@student.edu',
            password: 'password123',
            phone: '9876543210',
            year: 3,
            branch: 'Power Systems'
        };

        const registerResponse = await axios.post(`${BASE_URL}/auth/register`, studentData);
        console.log('✅ Student registered successfully');

        // Test 7: Get pending students
        console.log('\n7. Testing get pending students...');
        const pendingResponse = await axios.get(`${BASE_URL}/students/pending/list`, { headers });
        console.log('✅ Pending students:', pendingResponse.data.data.students.length);

        if (pendingResponse.data.data.students.length > 0) {
            const studentId = pendingResponse.data.data.students[0]._id;

            // Test 8: Approve student
            console.log('\n8. Testing student approval...');
            await axios.post(`${BASE_URL}/students/${studentId}/approve`, {}, { headers });
            console.log('✅ Student approved successfully');

            // Test 9: Student login
            console.log('\n9. Testing student login...');
            const studentLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
                email: 'john.doe@student.edu',
                password: 'password123'
            });
            console.log('✅ Student login successful');

            const studentToken = studentLoginResponse.data.data.token;
            const studentHeaders = { Authorization: `Bearer ${studentToken}` };

            // Test 10: Issue book to student
            console.log('\n10. Testing book issue...');
            const issueResponse = await axios.post(`${BASE_URL}/transactions/issue`, {
                studentId: studentId,
                bookId: bookId,
                notes: 'Test book issue'
            }, { headers });
            console.log('✅ Book issued successfully');
            const transactionId = issueResponse.data.data.transaction._id;

            // Test 11: Get student transactions
            console.log('\n11. Testing get student transactions...');
            const transactionsResponse = await axios.get(`${BASE_URL}/transactions/student/${studentId}`, { headers: studentHeaders });
            console.log('✅ Student transactions retrieved:', transactionsResponse.data.data.transactions.length);

            // Test 12: Get transaction stats
            console.log('\n12. Testing transaction statistics...');
            const statsResponse = await axios.get(`${BASE_URL}/transactions/stats`, { headers });
            console.log('✅ Transaction stats:', {
                issued: statsResponse.data.data.totalIssued,
                returned: statsResponse.data.data.totalReturned,
                overdue: statsResponse.data.data.totalOverdue
            });
        }

        console.log('\n🎉 All API tests completed successfully!');

    } catch (error) {
        console.error('\n❌ API Test failed:', error.response?.data?.message || error.message);
        if (error.response?.data?.errors) {
            console.error('Validation errors:', error.response.data.errors);
        }
    }
}

// Run tests
testAPI();