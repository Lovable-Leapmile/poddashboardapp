import React, { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { User } from "@/services/dashboardApi";

interface UsersGridProps {
  users: User[];
  loading: boolean;
  searchText: string;
  pageSize: number;
  onUserClick: (userId: number) => void;
}

const UsersGrid: React.FC<UsersGridProps> = ({ users, loading, searchText, pageSize, onUserClick }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof User;
    direction: "asc" | "desc";
  } | null>(null);

  // Filter users based on search text
  const filteredUsers = useMemo(() => {
    if (!searchText) return users;

    return users.filter((user) =>
      Object.values(user).some((value) => value?.toString().toLowerCase().includes(searchText.toLowerCase())),
    );
  }, [users, searchText]);

  // Sort users based on current sort configuration
  const sortedUsers = useMemo(() => {
    if (!sortConfig) return filteredUsers;

    return [...filteredUsers].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [filteredUsers, sortConfig]);

  // Calculate pagination
  const totalPages = Math.ceil(sortedUsers.length / pageSize);
  const startIndex = currentPage * pageSize;
  const endIndex = startIndex + pageSize;
  const currentUsers = sortedUsers.slice(startIndex, endIndex);

  const handleSort = (key: keyof User) => {
    setSortConfig((prevConfig) => {
      if (prevConfig?.key === key) {
        return {
          key,
          direction: prevConfig.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "asc" };
    });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-lg text-gray-500">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-amber-100 hover:bg-gray-50">
              <TableHead
                className="px-4 py-5 text-left text-sm font-semibold text-gray-600 cursor-pointer hover:text-gray-900 transition-colors"
                onClick={() => handleSort("user_name")}
              >
                NAME
                {sortConfig?.key === "user_name" && (
                  <span className="ml-1">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                )}
              </TableHead>
              <TableHead
                className="px-4 py-5 text-left text-sm font-semibold text-gray-600 cursor-pointer hover:text-gray-900 transition-colors"
                onClick={() => handleSort("user_type")}
              >
                TYPE
                {sortConfig?.key === "user_type" && (
                  <span className="ml-1">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                )}
              </TableHead>
              <TableHead
                className="px-4 py-5 text-left text-sm font-semibold text-gray-600 cursor-pointer hover:text-gray-900 transition-colors"
                onClick={() => handleSort("user_phone")}
              >
                PHONE
                {sortConfig?.key === "user_phone" && (
                  <span className="ml-1">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                )}
              </TableHead>
              <TableHead
                className="px-4 py-5 text-left text-sm font-semibold text-gray-600 cursor-pointer hover:text-gray-900 transition-colors"
                onClick={() => handleSort("user_email")}
              >
                EMAIL
                {sortConfig?.key === "user_email" && (
                  <span className="ml-1">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                )}
              </TableHead>
              <TableHead
                className="px-4 py-5 text-left text-sm font-semibold text-gray-600 cursor-pointer hover:text-gray-900 transition-colors"
                onClick={() => handleSort("user_flatno")}
              >
                FLAT NO
                {sortConfig?.key === "user_flatno" && (
                  <span className="ml-1">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                )}
              </TableHead>
              <TableHead
                className="px-4 py-5 text-left text-sm font-semibold text-gray-600 cursor-pointer hover:text-gray-900 transition-colors"
                onClick={() => handleSort("created_at")}
              >
                CREATED DATE
                {sortConfig?.key === "created_at" && (
                  <span className="ml-1">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                )}
              </TableHead>
              <TableHead className="px-4 py-5 text-left text-sm font-semibold text-gray-600">MORE</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentUsers.map((user, index) => (
              <TableRow
                key={user.id}
                className={`
                  ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"} 
                  hover:bg-blue-50/50 transition-colors border-b border-gray-100 last:border-b-0
                `}
              >
                <TableCell className="px-4 py-5 text-sm text-gray-900 font-medium">{user.user_name}</TableCell>
                <TableCell className="px-4 py-5 text-sm text-gray-700">{user.user_type}</TableCell>
                <TableCell className="px-4 py-5 text-sm text-gray-700">{user.user_phone}</TableCell>
                <TableCell className="px-4 py-5 text-sm text-gray-700">{user.user_email}</TableCell>
                <TableCell className="px-4 py-5 text-sm text-gray-700">{user.user_flatno}</TableCell>
                <TableCell className="px-4 py-5 text-sm text-gray-700">{formatDate(user.created_at)}</TableCell>
                <TableCell className="px-4 py-5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onUserClick(user.id)}
                    className="h-7 px-3 text-xs font-medium hover:bg-[#FDDC4E]/20 hover:text-gray-900 transition-colors"
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-200 rounded-b-xl">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">
              Showing {startIndex + 1} to {Math.min(endIndex, sortedUsers.length)} of {sortedUsers.length} results
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className="text-xs"
            >
              Previous
            </Button>
            <span className="text-sm text-gray-700">
              Page {currentPage + 1} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage === totalPages - 1}
              className="text-xs"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersGrid;
