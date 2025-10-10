import React from "react";

export default function Sidebar({ user, activeTab, setActiveTab }) {
    return (
        <aside className="w-64 min-h-screen bg-white border-r flex flex-col">
            <div className="p-6 border-b flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {user?.name?.[0] || 'L'}
                </div>
                <div>
                    <div className="font-semibold text-gray-900">{user?.name || 'Librarian'}</div>
                    <div className="text-xs text-gray-500">Librarian</div>
                </div>
            </div>
            <nav className="flex-1 p-4 space-y-2">
                <button
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'overview' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                    onClick={() => setActiveTab('overview')}
                >
                    Overview
                </button>
                <button
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'books' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                    onClick={() => setActiveTab('books')}
                >
                    Books
                </button>
                <button
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'students' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                    onClick={() => setActiveTab('students')}
                >
                    Students
                </button>
                <button
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'transactions' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                    onClick={() => setActiveTab('transactions')}
                >
                    Transactions
                </button>
                <button
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'pending' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                    onClick={() => setActiveTab('pending')}
                >
                    Pending Approvals
                </button>
            </nav>
        </aside>
    );
}
