import { MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { useSelector } from "react-redux";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { MessageCircle, Send, Bookmark } from "lucide-react";
import { Badge } from "../ui/badge";
import CommentDialog from "./CommentDialog";
import { likePost, unlikePost } from "@/api/post";
import { followUser, getUserProfile } from "@/api/user";
import { createComment } from "@/api/comment";
import { setPosts, setSelectedPost } from "@/redux/postSlice";
import { toast } from "sonner";

const Post = ({ post }) => {
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const { user } = useSelector((store) => store.auth);
  const { posts } = useSelector((store) => store.post);
  const [liked, setLiked] = useState(post.likes.includes(user?._id) || false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [postLike, setPostLike] = useState(post.totalLikes);
  const [comment, setComment] = useState(post.totalComments);
  const dispatch = useDispatch();

  const changeEventHandler = (e) => {
    const inputText = e.target.value;
    if (inputText.trim()) {
      setText(inputText);
    } else {
      setText("");
    }
  };

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
        const updatedCommentData = [...comment, res.data];
        console.log("updatedCommentData", updatedCommentData);
        setComment(updatedCommentData);

        const updatedPostData = posts.map((p) =>
          p._id === post._id ? { ...p, comments: updatedCommentData } : p
        );

        dispatch(setPosts(updatedPostData));
        toast.success("Comment added successfully");
        setText("");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const deletePostHandler = () => {
    console.log("deletePostHandler");
  };

  const bookmarkHandler = () => {
    console.log("bookmarkHandler");
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

  return (
    <div className="my-8 w-full max-w-sm mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage
              src={post.author?.profilePicture?.url}
              alt="post_image"
            />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-3 font-medium">
            <h1>{post.author?.username}</h1>
            {user?._id === post.author._id && (
              <Badge variant="secondary">Author</Badge>
            )}
          </div>
        </div>
        <Dialog>
          <DialogTrigger asChild onClick={() => checkFollow(post?.author?._id)}>
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

            <Button variant="ghost" className="cursor-pointer w-fit">
              Add to favorites
            </Button>
            {user && user?._id === post?.author._id && (
              <Button
                onClick={deletePostHandler}
                variant="ghost"
                className="cursor-pointer w-fit"
              >
                Delete
              </Button>
            )}
          </DialogContent>
        </Dialog>
      </div>
      <img
        className="rounded-sm my-2 w-full aspect-square object-cover"
        src={post.image?.url}
        alt="post_img"
      />

      <div className="flex items-center justify-between my-2">
        <div className="flex items-center gap-3">
          {liked ? (
            <FaHeart
              onClick={() => likeHandler(post._id)}
              size={"22px"}
              className="cursor-pointer text-red-600"
            />
          ) : (
            <FaRegHeart onClick={() => likeHandler(post._id)} size={"22px"} />
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
        <Bookmark
          onClick={bookmarkHandler}
          className="cursor-pointer hover:text-gray-600"
        />
      </div>
      <span className="font-medium block mb-2">{postLike} likes</span>
      <p>
        <span className="font-medium mr-2">{post.author?.username}</span>
        {post.desc}
      </p>
      {post.totalComments > 0 && (
        <span
          onClick={() => {
            dispatch(setSelectedPost(post));
            setOpen(true);
          }}
          className="cursor-pointer text-sm text-gray-400"
        >
          View all {post.totalComments} comments
        </span>
      )}
      <CommentDialog open={open} setOpen={setOpen} isFollowing={isFollowing} followHandler={followHandler} />
      <div className="flex items-center justify-between">
        <input
          type="text"
          placeholder="Add a comment..."
          value={text}
          onChange={changeEventHandler}
          className="outline-none text-sm w-full"
        />
        {text && (
          <span
            onClick={commentHandler}
            className="text-[#3BADF8] cursor-pointer"
          >
            Post
          </span>
        )}
      </div>
    </div>
  );
};

export default Post;
