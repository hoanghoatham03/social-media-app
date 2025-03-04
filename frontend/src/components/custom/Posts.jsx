import Post from "./Post";
import { useSelector } from "react-redux";
import { useMemo } from "react";

const Posts = () => {
  const { posts } = useSelector((store) => store.post);

  const uniquePosts = useMemo(() => {
    const postMap = new Map();

    posts?.forEach((post) => {
      if (post && post._id) {
        postMap.set(post._id, post);
      }
    });

    return Array.from(postMap.values());
  }, [posts]);

  return (
    <div>
      {uniquePosts?.map((post, index) => (
        <Post key={`${post._id}-${index}`} post={post} />
      ))}
    </div>
  );
};

export default Posts;
