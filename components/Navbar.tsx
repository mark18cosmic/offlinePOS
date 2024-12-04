import { Home, Box, Clipboard, BarChart, Settings, User, LogIn, UserPlus, ChevronRight } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar"; // Assuming you have a SidebarTrigger component
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const Navbar = ({ isLoggedIn, username } : any) => {
  return (
    <nav className="bg-gray-800 text-white p-4 shadow-md">
      <div className="flex items-center justify-between">
        {/* Sidebar Trigger Button */}
        <SidebarTrigger className="text-white md:hidden" />

        {/* Logo or Brand Name */}
    
        {/* Profile or Login/Signup */}
        <div className="flex items-center space-x-4">
          {isLoggedIn ? (
            <div className="flex items-center space-x-2">
              <Avatar>
                <AvatarImage src="https://via.placeholder.com/40" alt="Profile" />
                <AvatarFallback>{username.charAt(0)}</AvatarFallback>
              </Avatar>
              <span>{username}</span>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <a href="/login" className="flex items-center space-x-1 hover:text-gray-400">
                <LogIn size={20} />
                <span>Login</span>
              </a>
              <a href="/signup" className="flex items-center space-x-1 hover:text-gray-400">
                <UserPlus size={20} />
                <span>Sign Up</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
