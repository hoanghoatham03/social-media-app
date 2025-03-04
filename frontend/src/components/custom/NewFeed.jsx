import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import Posts from "./Posts";
import { getPostsForNewsFeed } from "@/api/post";
import { setPosts, setPage, setHasMore } from "@/redux/postSlice";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { Loader2 } from "lucide-react";

const POSTS_PER_PAGE = 3;

const NewFeed = () => {
  const dispatch = useDispatch();
  const { page, hasMore } = useSelector((store) => store.post);

  const loadMorePosts = useCallback(async () => {
    if (!hasMore) return;

    try {
      const response = await getPostsForNewsFeed(page, POSTS_PER_PAGE);
      if (response.success) {
        if (response.data.length < POSTS_PER_PAGE) {
          dispatch(setHasMore(false));
          toast.info("No more posts to load");
        }
        dispatch(setPosts(response.data));
        dispatch(setPage(page + 1));
      }
    } catch (error) {
      console.error("Error loading posts:", error);
      toast.error("Failed to load more posts");
    }
  }, [page, hasMore, dispatch]);

  const { targetRef, isLoading } = useInfiniteScroll(loadMorePosts);

  return (
    <div className="flex-1 my-8 flex flex-col items-center">
      <Posts />
      {hasMore && (
        <div ref={targetRef} className="w-full flex justify-center p-4">
          {isLoading && (
            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
          )}
        </div>
      )}
      {!hasMore && (
        <div className="text-gray-500 text-sm py-4">No more posts to load</div>
      )}
    </div>
  );
};

export default NewFeed;
