import { Outlet } from "react-router-dom";
import NewFeed from "./NewFeed";
import RightSidebar from "./RightSidebar";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setPosts, setPage, setHasMore } from "@/redux/postSlice";
import { getPostsForNewsFeed } from "@/api/post";
import { getSuggestFollowUser } from "@/api/user";
import { setSuggestedFollowUsers } from "@/redux/authSlice";
import Story from "./Story";

const Home = () => {
  const dispatch = useDispatch();

  const fetchPosts = async () => {
    dispatch(setPage(1));
    dispatch(setHasMore(true));
    const posts = await getPostsForNewsFeed(1, 3);
    dispatch(setPosts(posts.data));
  };

  const fetchSuggestedFollowUsers = async () => {
    const users = await getSuggestFollowUser();
    dispatch(setSuggestedFollowUsers(users.data.suggestedFollowUsers));
  };

  useEffect(() => {
    fetchPosts();
    fetchSuggestedFollowUsers();
    
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  
  useEffect(() => {
    const handleBeforeUnload = () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return (
    <div className="flex justify-center w-full">
      <div className="w-full max-w-[1200px] flex gap-10 p-4">
        <div className="w-full md:w-[65%]">
          <Story />
          <NewFeed fetchPosts={fetchPosts} />
        </div>
        <div className="hidden md:block md:w-[35%]">
          <RightSidebar />
        </div>
      </div>
      <Outlet />
    </div>
  );
};

export default Home;
