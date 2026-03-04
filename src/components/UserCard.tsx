import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, User, Phone, Mail, Building } from "lucide-react";
import { User as UserType } from "@/services/dashboardApi";

interface UserCardProps {
  user: UserType;
  onUserClick: (userId: number) => void;
}

const formatDate = (dateString: string) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString();
};

const UserCard: React.FC<UserCardProps> = ({ user, onUserClick }) => {
  return (
    <Card className="mb-3 bg-white shadow-sm hover:shadow-md transition-shadow rounded-xl">
      <CardContent className="p-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <span className="text-xs text-gray-500 shrink-0">#{user.id}</span>
            <h3 className="font-semibold text-sm text-gray-900 truncate">{user.user_name}</h3>
            <div className="px-2 py-0.5 bg-gray-100 rounded text-xs font-medium text-gray-700 shrink-0">
              {user.user_type}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onUserClick(user.id)}
            className="h-7 px-3 text-xs font-medium hover:bg-[#FDDC4E]/20 hover:text-gray-900 transition-colors shrink-0 ml-2"
          >
            View
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserCard;
