import {
  Heart,
  Home,
  Instagram,
  LogOut,
  MessageCircle,
  PlusSquare,
  Search,
  TrendingUp,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { toast } from "sonner";
import { useNavigate, useLocation } from "react-router-dom";
import { logout } from "../../api/auth";
import { useDispatch, useSelector } from "react-redux";
import { setAuthUser } from "../../redux/authSlice";
import CreatePost from "./CreatePost";
import { setPosts, setSelectedPost } from "@/redux/postSlice";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { persistor } from "@/redux/store";
import { setHasUnreadMessage, setIsStartChat } from "@/redux/conversationSlice";
import Cookies from "js-cookie";
const LeftSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isOnChatPage = location.pathname === "/chat";
  const { user } = useSelector((store) => store.auth);
  const { likeNotification } = useSelector((store) => store.notification);
  const { hasUnreadMessage } = useSelector((store) => store.conversation);
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);

  // Clear unread message notification when on chat page
  useEffect(() => {
    if (isOnChatPage && hasUnreadMessage) {
      // Reset the unread message notification when we're on the chat page
      dispatch(setHasUnreadMessage(false));
    }
  }, [isOnChatPage, hasUnreadMessage, dispatch]);

  const logoutHandler = async () => {
    try {
      const res = await logout();
      console.log("logout", res);
      if (res.success) {
        dispatch(setAuthUser(null));
        dispatch(setPosts([]));
        dispatch(setSelectedPost(null));
        //clear local storage
        localStorage.removeItem("accessToken");
        localStorage.removeItem("persist:root");
        //clear redux persist
        persistor.purge();
        dispatch(setIsStartChat(false));
        //clear cookies
        Cookies.remove("refreshToken");
        navigate("/login");
        toast.success(res.message);
      }
    } catch (error) {
      toast.error(error.response.message);
    }
  };

  const sidebarHandler = (textType) => {
    if (textType === "Logout") {
      logoutHandler();
    } else if (textType === "Create") {
      setOpen(true);
    } else if (textType === "Profile") {
      navigate(`/profile/${user?._id}`);
    } else if (textType === "Home") {
      navigate("/");
    } else if (textType === "Messages") {
      // Clear unread message notification when navigating to chat
      if (hasUnreadMessage) {
        dispatch(setHasUnreadMessage(false));
      }
      navigate("/chat");
    }
  };

  const sidebarItems = [
    { icon: <Home />, text: "Home" },
    { icon: <Search />, text: "Search" },
    { icon: <TrendingUp />, text: "Explore" },
    { icon: <MessageCircle />, text: "Messages" },
    { icon: <Heart />, text: "Notifications" },
    { icon: <PlusSquare />, text: "Create" },
    {
      icon: (
        <Avatar className="w-6 h-6">
          <AvatarImage src={user?.profilePicture?.url} alt="profile_picture" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      ),
      text: "Profile",
    },
    { icon: <LogOut />, text: "Logout" },
  ];
  return (
    <div className="fixed top-0 z-10 left-0 px-4 border-r border-gray-300 w-[16%] h-screen">
      <div className="flex flex-col">
        <h1 className="my-8 pl-3 font-bold text-xl flex items-center gap-2">
          <Instagram /> Instagram
        </h1>
        <div>
          {sidebarItems.map((item, index) => {
            return (
              <div
                onClick={() => sidebarHandler(item.text)}
                key={index}
                className="flex items-center gap-3 relative hover:bg-gray-100 cursor-pointer rounded-lg p-3 my-3"
              >
                {item.icon}
                <span>{item.text}</span>
                {item.text === "Notifications" &&
                  likeNotification.length > 0 && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          size="icon"
                          className="rounded-full h-5 w-5 bg-red-600 hover:bg-red-600 absolute bottom-6 left-6"
                        >
                          {likeNotification.length}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent>
                        <div>
                          {likeNotification.length === 0 ? (
                            <p>No new notification</p>
                          ) : (
                            likeNotification.map((notification) => {
                              return (
                                <div
                                  key={notification.userId}
                                  className="flex items-center gap-2 my-2"
                                >
                                  <Avatar>
                                    <AvatarImage
                                      src={
                                        notification.userDetails?.profilePicture
                                      }
                                    />
                                    <AvatarFallback>CN</AvatarFallback>
                                  </Avatar>
                                  <p className="text-sm">
                                    <span className="font-bold">
                                      {notification.userDetails?.username}
                                    </span>{" "}
                                    liked your post
                                  </p>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                {item.text === "Messages" &&
                  hasUnreadMessage &&
                  !isOnChatPage && (
                    <div className="absolute w-3 h-3 bg-red-600 rounded-full bottom-6 left-6"></div>
                  )}
              </div>
            );
          })}
        </div>
      </div>

      <CreatePost open={open} setOpen={setOpen} />
    </div>
  );
};

export default LeftSidebar;
