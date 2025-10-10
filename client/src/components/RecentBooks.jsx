import React from "react";

export default function RecentBooks({ books }) {
    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Recent Books</h3>
            <ul className="divide-y divide-gray-200">
                {(books || []).slice(0, 5).map((book) => (
                    <li key={book._id} className="py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <span className="font-medium text-gray-900">{book.title}</span>
                            <span className="ml-2 text-sm text-gray-600">{book.author?.join(", ")}</span>
                        </div>
                        <div className="text-sm text-gray-500">
                            Available: {book.availableCopies}/{book.totalCopies}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
