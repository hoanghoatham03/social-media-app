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
import SearchDialog from "./SearchDialog";
import { setPosts, setSelectedPost } from "@/redux/postSlice";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { persistor } from "@/redux/store";
import { setHasUnreadMessage, setIsStartChat } from "@/redux/conversationSlice";
import {
  clearNotifications,
  clearLikeNotifications,
} from "../../redux/notificationSlide";

import Cookies from "js-cookie";
const LeftSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isOnChatPage = location.pathname === "/chat";
  const { user } = useSelector((store) => store.auth);
  const { likeNotification, hasUnreadNotifications } = useSelector(
    (store) => store.notification
  );
  const { hasUnreadMessage } = useSelector((store) => store.conversation);
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  // Clear unread message notification when on chat page
  useEffect(() => {
    if (isOnChatPage && hasUnreadMessage) {
      // Reset the unread message notification when we're on the chat page
      dispatch(setHasUnreadMessage(false));
    }
  }, [isOnChatPage, hasUnreadMessage, dispatch]);

  // When the notification popover is opened, clear the unread notification state
  useEffect(() => {
    if (notificationOpen && hasUnreadNotifications) {
      dispatch(clearNotifications());
    }
  }, [notificationOpen, hasUnreadNotifications, dispatch]);

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
    } else if (textType === "Search") {
      setSearchOpen(true);
    } else if (textType === "Messages") {
      // Clear unread message notification when navigating to chat
      if (hasUnreadMessage) {
        dispatch(setHasUnreadMessage(false));
      }
      navigate("/chat");
    } else if (textType === "Notifications") {
      // Clear unread notifications when clicking on Notifications
      if (hasUnreadNotifications) {
        dispatch(clearNotifications());
      }
      setNotificationOpen(true);
    }
  };

  const handleClearNotifications = () => {
    dispatch(clearLikeNotifications());
    toast.success("All notifications cleared");
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
                {item.text === "Notifications" && (
                  <>
                    <Popover
                      open={notificationOpen}
                      onOpenChange={setNotificationOpen}
                    >
                      <PopoverTrigger className="absolute inset-0 w-full h-full opacity-0">
                        <span />
                      </PopoverTrigger>
                      <PopoverContent>
                        <div>
                          <div className="flex justify-between items-center mb-3">
                            <h3 className="font-semibold">Notifications</h3>
                            {likeNotification.length > 0 && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs"
                                onClick={handleClearNotifications}
                              >
                                Clear All
                              </Button>
                            )}
                          </div>

                          {likeNotification.length === 0 ? (
                            <p>No new notification</p>
                          ) : (
                            likeNotification.map((notification, idx) => {
                              return (
                                <div
                                  key={`${notification.userId}-${idx}`}
                                  className="flex items-center gap-2 my-2"
                                >
                                  <Avatar>
                                    <AvatarImage
                                      src={
                                        notification.userDetails
                                          ?.profilePicture ||
                                        notification.userInfo?.profilePicture
                                          ?.url
                                      }
                                    />
                                    <AvatarFallback>CN</AvatarFallback>
                                  </Avatar>
                                  <p className="text-sm">
                                    <span className="font-bold">
                                      {notification.userDetails?.username ||
                                        notification.userInfo?.username}
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
                    {hasUnreadNotifications && (
                      <div className="absolute w-2 h-2 bg-red-600 rounded-full bottom-7 left-7"></div>
                    )}
                  </>
                )}
                {item.text === "Messages" &&
                  hasUnreadMessage &&
                  !isOnChatPage && (
                    <div className="absolute w-2 h-2 bg-red-600 rounded-full bottom-7 left-7"></div>
                  )}
              </div>
            );
          })}
        </div>
      </div>

      <CreatePost open={open} setOpen={setOpen} />
      <SearchDialog open={searchOpen} setOpen={setSearchOpen} />
    </div>
  );
};

export default LeftSidebar;
