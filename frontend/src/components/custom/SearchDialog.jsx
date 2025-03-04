import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { searchUser } from "@/api/user";
import { Search, UserIcon } from "lucide-react";
import { VscLoading } from "react-icons/vsc";

const SearchDialog = ({ open, setOpen }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  //search user when enter in search input
  useEffect(() => {
    if (searchTerm.trim()) {
      handleSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    try {
      setIsSearching(true);
      
      //delay 1 second before search
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const result = await searchUser(searchTerm);
      console.log("result", result);
      if (result && result.data.users) {
        setSearchResults(result.data.users);
      }
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleUserClick = (userId) => {
    navigate(`/profile/${userId}`);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Search Users</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Input
              placeholder="Search for users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          </div>

          {isSearching && (
            <div className="flex justify-center items-center mt-4">
              <VscLoading className="animate-spin text-gray-500 h-4 w-4" />
            </div>
          )}

          <div className="max-h-60 overflow-y-auto">
            {searchResults.length === 0 && searchTerm && !isSearching ? (
              <p className="text-center text-sm text-gray-500">
                No users found
              </p>
            ) : (
              searchResults.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-md cursor-pointer"
                  onClick={() => handleUserClick(user._id)}
                >
                  <Avatar>
                    <AvatarImage src={user.profilePicture?.url} />
                    <AvatarFallback>
                      <UserIcon className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.username}</p>
                    <p className="text-sm text-gray-500">{user.fullName}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchDialog;
