import { Outlet } from "react-router-dom";
import NewFeed from "./NewFeed";
import RightSidebar from "./RightSidebar";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setPosts, setPage, setHasMore } from "@/redux/postSlice";
import { getPostsForNewsFeed } from "@/api/post";
import { getSuggestUser } from "@/api/user";
import { setSuggestedUsers } from "@/redux/authSlice";

const Home = () => {
  const dispatch = useDispatch();

  const fetchPosts = async () => {
    dispatch(setPage(1));
    dispatch(setHasMore(true));
    const posts = await getPostsForNewsFeed(1, 3);
    dispatch(setPosts(posts.data));
  };

  const fetchSuggestUser = async () => {
    const users = await getSuggestUser();
    dispatch(setSuggestedUsers(users));
  };

  useEffect(() => {
    fetchPosts();
    fetchSuggestUser();
    
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
    <div className="flex">
      <div className="flex-grow">
        <NewFeed />
        <Outlet />
      </div>
      <RightSidebar />
    </div>
  );
};

export default Home;
