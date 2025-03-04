import { MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { useSelector } from "react-redux";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { MessageCircle, Send, Bookmark, CornerDownLeft } from "lucide-react";
import { Badge } from "../ui/badge";
import CommentDialog from "./CommentDialog";
import { likePost, unlikePost, bookmarkPost, deletePost } from "@/api/post";
import { followUser, getUserProfile } from "@/api/user";
import { createComment } from "@/api/comment";
import { setPosts, setSelectedPost } from "@/redux/postSlice";
import { setBookmarkedPosts } from "@/redux/authSlice";
import { toast } from "sonner";
import { formatDate } from "@/utils/formatDate";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import UpdatePost from "./UpdatePost";
import { useEffect } from "react";

const Post = ({ post }) => {
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const { user, bookmarkedPosts = [] } = useSelector((store) => store.auth);
  const { posts } = useSelector((store) => store.post);
  const [liked, setLiked] = useState(post?.likes?.includes(user?._id) || false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [postLike, setPostLike] = useState(post?.totalLikes);
  const [comment, setComment] = useState(post?.comments);
  const [isMore, setIsMore] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(
    bookmarkedPosts.some((bookmark) => bookmark._id === post._id)
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [mainDialogOpen, setMainDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [totalComments, setTotalComments] = useState(post?.totalComments);

  const changeEventHandler = (e) => {
    const inputText = e.target.value;
    if (inputText.trim()) {
      setText(inputText);
    } else {
      setText("");
    }
  };

  useEffect(() => {
    setComment(post?.comments);
    setPostLike(post?.totalLikes);
    setTotalComments(post?.totalComments);
  }, [post]);

  const likeHandler = async (postId) => {
    try {
      const res = liked ? await unlikePost(postId) : await likePost(postId);

      console.log(liked ? "unlikeHandler" : "likeHandler", res);

      if (res.success) {
        const updatedLikes = liked ? postLike - 1 : postLike + 1;
        setPostLike(updatedLikes);
        setLiked(!liked);

        const updatedPostData = posts.map((p) => {
          if (p._id === post._id) {
            return {
              ...p,
              likes: liked
                ? p.likes.filter((id) => id !== user._id)
                : [...p.likes, user._id],
              totalLikes: updatedLikes,
            };
          }
          return p;
        });
        dispatch(setPosts(updatedPostData));
      }
    } catch (error) {
      console.log(error);
      toast.error(`Failed to ${liked ? "unlike" : "like"} post`);
    }
  };

  const commentHandler = async () => {
    try {
      const res = await createComment(post._id, text);
      console.log("commentHandler", res);
      if (res.success) {
        const updatedCommentData = [...post.comments, res.data];
        console.log("updatedCommentData", updatedCommentData);
        setComment(updatedCommentData);

        const updatedPostData = posts.map((p) =>
          p._id === post._id
            ? {
                ...p,
                comments: updatedCommentData,
                totalComments: updatedCommentData.length,
              }
            : p
        );

        dispatch(setPosts(updatedPostData));
        console.log("updatedPostData", updatedPostData);

        toast.success("Comment added successfully");
        setText("");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const deletePostHandler = async () => {
    try {
      setIsDeleting(true);
      const res = await deletePost(post._id);
      if (res.success) {
        toast.success("Post deleted successfully");
        dispatch(setPosts(posts.filter((p) => p._id !== post._id)));
        navigate("/");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete post");
    } finally {
      setIsDeleting(false);
    }
  };

  const bookmarkHandler = async () => {
    try {
      const res = await bookmarkPost(post._id);
      if (res.success) {
        setIsBookmarked(!isBookmarked);

        // If we're bookmarking, add the post ID to bookmarks
        if (!isBookmarked) {
          dispatch(setBookmarkedPosts([...bookmarkedPosts, post]));
          console.log("bookmarkedPosts", bookmarkedPosts);
          toast.success("Post bookmarked successfully");
        } else {
          // If we're unbookmarking, remove the post ID from bookmarks
          dispatch(
            setBookmarkedPosts(
              bookmarkedPosts.filter((bookmark) => bookmark._id !== post._id)
            )
          );
          toast.success("Post unbookmarked successfully");
        }
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to bookmark post");
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

  const editPostHandler = () => {
    setMainDialogOpen(false);
    setEditDialogOpen(true);
  };

  return (
    <div className="my-8 w-full max-w-sm mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to={`/profile/${post.author?._id}`}>
            <Avatar>
              <AvatarImage
                src={post.author?.profilePicture?.url}
                alt="post_image"
              />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex items-center gap-3 font-medium">
            <Link to={`/profile/${post.author?._id}`}>
              <h1>
                {post?.author?.username}{" "}
                <span className="text-gray-400 text-sm">•</span>{" "}
                <span className="text-gray-400 text-sm">
                  {formatDate(post?.createdAt)}
                </span>
              </h1>
            </Link>
            {user?._id === post?.author?._id && (
              <Badge variant="secondary">Author</Badge>
            )}
          </div>
        </div>
        <Dialog open={mainDialogOpen} onOpenChange={setMainDialogOpen}>
          <DialogTrigger
            asChild
            onClick={() => {
              checkFollow(post?.author?._id);
              setMainDialogOpen(true);
            }}
          >
            <MoreHorizontal className="cursor-pointer" />
          </DialogTrigger>
          <DialogContent className="flex flex-col items-center text-sm text-center">
            {post?.author?._id !== user?._id &&
              (isFollowing ? (
                <Button
                  onClick={() => followHandler(post?.author?._id)}
                  variant="ghost"
                  className="cursor-pointer w-fit text-[#ED4956] font-bold"
                >
                  Unfollow
                </Button>
              ) : (
                <Button
                  onClick={() => followHandler(post?.author?._id)}
                  variant="ghost"
                  className="cursor-pointer w-fit text-[#ED4956] font-bold"
                >
                  Follow
                </Button>
              ))}

            <Button
              variant="ghost"
              className="cursor-pointer w-fit text-gray-500 font-semibold"
            >
              Add to favorites
            </Button>
            {user && user?._id === post?.author?._id && (
              <div className="">
                <Button
                  onClick={deletePostHandler}
                  variant="ghost"
                  className="cursor-pointer w-fit"
                >
                  {isDeleting ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <span className="text-red-600">Delete</span>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  className="cursor-pointer w-fit"
                  onClick={editPostHandler}
                >
                  Edit
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
      <img
        className="rounded-sm my-2 w-full aspect-square object-cover"
        src={post?.image?.url}
        alt="post_img"
      />

      <div className="flex items-center justify-between my-2">
        <div className="flex items-center gap-3">
          {liked ? (
            <FaHeart
              onClick={() => likeHandler(post?._id)}
              size={"22px"}
              className="cursor-pointer text-red-600"
            />
          ) : (
            <FaRegHeart onClick={() => likeHandler(post?._id)} size={"22px"} />
          )}

          <MessageCircle
            onClick={() => {
              dispatch(setSelectedPost(post));
              setOpen(true);
            }}
            className="cursor-pointer hover:text-gray-600"
          />
          <Send className="cursor-pointer hover:text-gray-600" />
        </div>
        {isBookmarked ? (
          <Bookmark
            onClick={bookmarkHandler}
            className="cursor-pointer text-black"
            fill="black"
          />
        ) : (
          <Bookmark
            onClick={bookmarkHandler}
            className="cursor-pointer  hover:text-gray-600"
          />
        )}
      </div>
      <span className="font-medium block mb-2">{postLike} likes</span>
      <p>
        <span className="font-medium mr-2">{post.author?.username}</span>
        {post.desc.length > 100 ? (
          <span>
            {isMore ? post.desc : post.desc.slice(0, 100) + "..."}{" "}
            <span
              className="cursor-pointer text-sm text-gray-400"
              onClick={() => setIsMore(!isMore)}
            >
              {isMore ? "Read less" : "Read more"}
            </span>
          </span>
        ) : (
          <span>{post.desc}</span>
        )}
      </p>
      {post.totalComments > 0 && (
        <span
          onClick={() => {
            dispatch(setSelectedPost(post));
            setOpen(true);
          }}
          className="cursor-pointer text-sm text-gray-400"
        >
            View all {totalComments} comments
          </span>
      )}
      <CommentDialog
        open={open}
        setOpen={setOpen}
        isFollowing={isFollowing}
        followHandler={followHandler}
      />
      <div className="flex items-center justify-between">
        <input
          type="text"
          placeholder="Add a comment..."
          value={text}
          onChange={changeEventHandler}
          className="outline-none text-sm w-full"
        />
        {text && (
          <>
            <CornerDownLeft
              size={18}
              onClick={commentHandler}
              className=" cursor-pointer"
            />
          </>
        )}
      </div>
      <div className="h-[1px] bg-gray-200 my-2"></div>
      <UpdatePost
        open={editDialogOpen}
        setOpen={setEditDialogOpen}
        post={post}
      />
    </div>
  );
};

export default Post;
