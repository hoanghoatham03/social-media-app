import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { getPostsForExplore } from "@/api/post";
import { setPosts, setPage, setHasMore } from "@/redux/exploreSlice";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { Heart, MessageCircle } from "lucide-react";
import { getPostById } from "@/api/post";
import { setSelectedPost } from "@/redux/postSlice";
import CommentDialog from "./CommentDialog";
import { followUser, getUserProfile } from "@/api/user";

const POSTS_PER_PAGE = 15;

const ExplorePage = () => {
  const dispatch = useDispatch();
  const { posts, page, hasMore } = useSelector((store) => store.explore);
  const [initialLoading, setInitialLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const { user } = useSelector((store) => store.auth);

  const fetchExplorePosts = async () => {
    setInitialLoading(true);
    dispatch(setPage(1));
    dispatch(setPosts([]));
    dispatch(setHasMore(true));
    try {
      const response = await getPostsForExplore(1, POSTS_PER_PAGE);
      if (response.success) {
        dispatch(setPosts(response.data));
        if (response.data.length < POSTS_PER_PAGE) {
          dispatch(setHasMore(false));
        }
      } else {
        toast.error("Failed to fetch explore posts");
      }
    } catch (error) {
      console.error("Error fetching explore posts:", error);
      toast.error("Something went wrong fetching posts");
    } finally {
      setInitialLoading(false);
    }
  };

  const checkFollow = async (userId) => {
    try {
      const res = await getUserProfile(userId);
      if (res.success) {
        const isFollowing = res.data.user.followers.includes(user?._id);
        if (isFollowing) {
          setIsFollowing(true);
        } else {
          setIsFollowing(false);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const followHandler = async (userId) => {
    try {
      const res = await followUser(userId);
      if (res.success) {
        setIsFollowing(!isFollowing);
      }
      toast.success(res.message);
    } catch (error) {
      console.log(error);
      toast.error("Failed to follow");
    }
  };

  const loadMorePosts = useCallback(async () => {
    if (!hasMore || initialLoading) return;

    try {
      // Use the current page from the store
      const nextPage = page + 1;
      const response = await getPostsForExplore(nextPage, POSTS_PER_PAGE);

      if (response.success) {
        if (response.data.length === 0) {
          dispatch(setHasMore(false));
          if (page > 1) {
            toast.info("No more posts to explore");
          }
          return;
        }

        // Append new posts to existing ones
        dispatch(setPosts([...posts, ...response.data]));
        dispatch(setPage(nextPage));

        // Check if we've reached the end
        if (response.data.length < POSTS_PER_PAGE) {
          dispatch(setHasMore(false));
        }
      }
    } catch (error) {
      console.error("Error loading more explore posts:", error);
      toast.error("Failed to load more posts");
    }
  }, [page, hasMore, dispatch, posts, initialLoading]);

  useEffect(() => {
    fetchExplorePosts();

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    return () => {
      // Reset posts when component unmounts
      dispatch(setPosts([]));
      dispatch(setPage(1));
      dispatch(setHasMore(true));
    };
  }, [dispatch]);

  const { targetRef, isLoading } = useInfiniteScroll(loadMorePosts);

  if (initialLoading) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2">Loading posts...</span>
      </div>
    );
  }

  const handleFindPost = async (postId) => {
    try {
      const res = await getPostById(postId);

      if (res.success) {
        checkFollow(res.data.author._id);
        dispatch(setSelectedPost(res.data));
        setOpen(true);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to find post");
    }
  };
  return (
    <div className="container mx-auto py-8 px-2">
      {posts.length === 0 && !initialLoading ? (
        <div className="text-center py-10">
          <p className="text-gray-500">No posts available to explore.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {posts.map((post) => (
            <div
              key={post?._id}
              className="relative group cursor-pointer"
              onClick={() => handleFindPost(post?._id)}
            >
              <img
                src={post?.image?.url}
                alt="postimage"
                className="rounded-sm w-full aspect-square object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex items-center text-white space-x-4">
                  <button className="flex items-center gap-2 hover:text-gray-300">
                    <Heart />
                    <span>{post?.totalLikes}</span>
                  </button>
                  <button className="flex items-center gap-2 hover:text-gray-300">
                    <MessageCircle />
                    <span>{post?.totalComments}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Loading indicator and trigger for infinite scroll */}
      {hasMore && (
        <div ref={targetRef} className="w-full flex justify-center py-6 mt-4">
          {isLoading && (
            <div className="flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
              <span className="ml-2">Loading more posts...</span>
            </div>
          )}
        </div>
      )}

      {!hasMore && posts.length > 0 && (
        <div className="text-center py-4 text-gray-500">
          No more posts to explore
        </div>
      )}

      <CommentDialog
        open={open}
        setOpen={setOpen}
        isFollowing={isFollowing}
        followHandler={followHandler}
      />
    </div>
  );
};

export default ExplorePage;
