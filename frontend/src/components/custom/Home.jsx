import { Outlet } from "react-router-dom"
import NewFeed from "./NewFeed"
import RightSidebar from "./RightSidebar"
import { useEffect } from "react"
import { useDispatch } from "react-redux"
import { setPosts } from "@/redux/postSlice"
import { getPostsForNewsFeed } from "@/api/post"
import { getSuggestUser } from "@/api/user"
import { setSuggestedUsers } from "@/redux/authSlice"


const Home = () => {
  const dispatch = useDispatch();

  const fetchPosts = async () => {
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
  }, []);
  return (
    <div className='flex'>
        <div className='flex-grow'>
            <NewFeed />
            <Outlet />
        </div>
        <RightSidebar />
    </div>
)
}

export default Home