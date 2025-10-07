const mongoose = require('mongoose');

async function createSampleBooks() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/library-management');
        console.log('Connected to MongoDB');

        const sampleBooks = [
            {
                isbn: '9780321856715',
                title: 'The Great Gatsby',
                author: ['F. Scott Fitzgerald'],
                category: 'General Engineering',
                subject: 'Literature',
                description: 'A classic American novel set in the Jazz Age.',
                publisher: 'Scribner',
                publicationYear: 1925,
                edition: '1st',
                pages: 180,
                language: 'English',
                totalCopies: 5,
                availableCopies: 3,
                isActive: true,
                location: 'Section A, Shelf 3',
                tags: ['classic', 'american literature', 'fiction']
            },
            {
                isbn: '9780062315007',
                title: 'To Kill a Mockingbird',
                author: ['Harper Lee'],
                category: 'General Engineering',
                subject: 'Literature',
                description: 'A gripping tale of racial injustice and loss of innocence.',
                publisher: 'Harper Perennial',
                publicationYear: 1960,
                edition: '50th Anniversary',
                pages: 376,
                language: 'English',
                totalCopies: 4,
                availableCopies: 2,
                isActive: true,
                location: 'Section A, Shelf 3',
                tags: ['classic', 'social justice', 'fiction']
            },
            {
                isbn: '9780452284234',
                title: '1984',
                author: ['George Orwell'],
                category: 'General Engineering',
                subject: 'Literature',
                description: 'A dystopian social science fiction novel.',
                publisher: 'Plume',
                publicationYear: 1949,
                edition: 'Reprint',
                pages: 328,
                language: 'English',
                totalCopies: 6,
                availableCopies: 4,
                isActive: true,
                location: 'Section A, Shelf 4',
                tags: ['dystopian', 'science fiction', 'political']
            },
            {
                isbn: '9780262033848',
                title: 'Introduction to Algorithms',
                author: ['Thomas H. Cormen', 'Charles E. Leiserson', 'Ronald L. Rivest', 'Clifford Stein'],
                category: 'Electronics',
                subject: 'Computer Science',
                description: 'Comprehensive textbook on computer algorithms.',
                publisher: 'MIT Press',
                publicationYear: 2009,
                edition: '3rd',
                pages: 1312,
                language: 'English',
                totalCopies: 8,
                availableCopies: 5,
                isActive: true,
                location: 'Section C, Shelf 1',
                tags: ['algorithms', 'computer science', 'textbook']
            },
            {
                isbn: '9780132350884',
                title: 'Clean Code',
                author: ['Robert C. Martin'],
                category: 'Electronics',
                subject: 'Software Engineering',
                description: 'A handbook of agile software craftsmanship.',
                publisher: 'Prentice Hall',
                publicationYear: 2008,
                edition: '1st',
                pages: 464,
                language: 'English',
                totalCopies: 6,
                availableCopies: 3,
                isActive: true,
                location: 'Section C, Shelf 2',
                tags: ['programming', 'software engineering', 'best practices']
            },
            {
                isbn: '9783161484100',
                title: 'Digital Signal Processing',
                author: ['Alan V. Oppenheim', 'Ronald W. Schafer'],
                category: 'Signal Processing',
                subject: 'Digital Signal Processing',
                description: 'Comprehensive introduction to digital signal processing.',
                publisher: 'Pearson',
                publicationYear: 2010,
                edition: '3rd',
                pages: 1120,
                language: 'English',
                totalCopies: 4,
                availableCopies: 2,
                isActive: true,
                location: 'Section B, Shelf 5',
                tags: ['dsp', 'signal processing', 'engineering']
            }
        ];

        // Insert books directly
        await mongoose.connection.collection('books').insertMany(sampleBooks);
        console.log('Sample books created successfully');

        process.exit(0);
    } catch (error) {
        console.error('Error creating sample books:', error);
        process.exit(1);
    }
}

createSampleBooks();