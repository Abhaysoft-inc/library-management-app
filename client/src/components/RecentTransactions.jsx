import React from "react";

export default function RecentTransactions({ transactions }) {
    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
            <ul className="divide-y divide-gray-200">
                {(transactions || []).slice(0, 5).map((t) => (
                    <li key={t._id} className="py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <span className="font-medium text-gray-900">{t.bookId?.title}</span>
                            <span className="ml-2 text-sm text-gray-600">{t.studentId?.name}</span>
                        </div>
                        <div className="text-sm text-gray-500">
                            Status: {t.status}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
