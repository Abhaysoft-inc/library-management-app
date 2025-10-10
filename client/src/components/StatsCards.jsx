import React from "react";
import { BookOpen, CheckCircle, Users, Clock, AlertCircle } from "lucide-react";

const cardData = [
    { label: "Total Books", icon: BookOpen, borderColor: "border-blue-500", iconColor: "text-blue-500", key: "totalBooks" },
    { label: "Issued Books", icon: CheckCircle, borderColor: "border-green-500", iconColor: "text-green-500", key: "issuedBooks" },
    { label: "Total Students", icon: Users, borderColor: "border-purple-500", iconColor: "text-purple-500", key: "totalStudents" },
    { label: "Pending Students", icon: Clock, borderColor: "border-orange-500", iconColor: "text-orange-500", key: "pendingStudents" },
    { label: "Overdue Books", icon: AlertCircle, borderColor: "border-red-500", iconColor: "text-red-500", key: "overdueBooks" },
];

export default function StatsCards({ stats, pendingCount }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            {cardData.map(({ label, icon: Icon, borderColor, iconColor, key }) => (
                <div
                    key={key}
                    className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${borderColor}`}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">{label}</p>
                            <p className="text-3xl font-bold text-gray-900">
                                {key === "pendingStudents"
                                    ? pendingCount || 0
                                    : stats?.[key] ?? 0}
                            </p>
                        </div>
                        <Icon className={`h-12 w-12 ${iconColor}`} />
                    </div>
                </div>
            ))}
        </div>
    );
}
