import React from "react";

export default function PendingApprovals({ pendingStudents }) {
    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Pending Student Approvals</h3>
            <ul className="divide-y divide-gray-200">
                {(pendingStudents || []).length === 0 ? (
                    <li className="py-2 text-gray-500">No pending approvals.</li>
                ) : (
                    pendingStudents.slice(0, 5).map((student) => (
                        <li key={student._id} className="py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <span className="font-medium text-gray-900">{student.name}</span>
                                <span className="ml-2 text-sm text-gray-600">{student.email}</span>
                            </div>
                            <div className="text-sm text-gray-500">ID: {student.studentId}</div>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
}
