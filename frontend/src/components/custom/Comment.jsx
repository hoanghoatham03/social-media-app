import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { formatDate } from "@/utils/formatDate";
import {
  Heart,
  MessageCircle,
  CornerDownLeft,
  Trash,
  MoreHorizontal,
} from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { likeComment } from "@/api/comment";
import { useDispatch } from "react-redux";
import { setPosts } from "@/redux/postSlice";
import { useEffect } from "react";
import { getReplies } from "@/api/comment";
import { createReplyComment } from "@/api/comment";
import ReplyComment from "./ReplyComment";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogTrigger } from "../ui/commentDialog";

const Comment = ({ comment, onDelete }) => {
  const { user } = useSelector((store) => store.auth);
  const { posts } = useSelector((store) => store.post);
  const dispatch = useDispatch();
  const [commentLike, setCommentLike] = useState(comment?.totalLikes);
  const [totalReplies, setTotalReplies] = useState(comment?.totalReplies);
  const [isLiked, setIsLiked] = useState(
    comment?.likes.includes(user?._id) || false
  );
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replies, setReplies] = useState([]);
  const [isShowReplies, setIsShowReplies] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const isCurrentUserComment = user?._id === comment?.userId?._id;

  useEffect(() => {
    setCommentLike(comment?.totalLikes);
    setTotalReplies(comment?.totalReplies);
    setIsLiked(comment?.likes.includes(user?._id) || false);
  }, [comment]);

  const handleLike = async () => {
    try {
      const res = await likeComment(comment?._id);

      console.log("handleLike", res);
      if (res.success) {
        setIsLiked(!isLiked);
        setCommentLike(isLiked ? commentLike - 1 : commentLike + 1);

        const updatedPostData = posts.map((p) => {
          if (p._id === comment?.postId) {
            return {
              ...p,
              comments: p.comments.map((c) => {
                if (c._id === comment?._id) {
                  return {
                    ...c,
                    likes: isLiked
                      ? c.likes.filter((id) => id !== user?._id)
                      : [...c.likes, user?._id],
                    totalLikes: isLiked ? c.totalLikes - 1 : c.totalLikes + 1,
                  };
                }
                return c;
              }),
            };
          }
          return p;
        });

        dispatch(setPosts(updatedPostData));
      }
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

  const handleShowReplyInput = async () => {
    console.log("show reply");
    if (!isShowReplies) {
      await handleShowReplies(true);
      setIsReplying(true);
    } else if (isReplying && isShowReplies) {
      setIsReplying(false);
    } else if (!isReplying && isShowReplies) {
      setIsReplying(!isReplying);
    }
  };

  const fetchReplies = async () => {
    try {
      const res = await getReplies(comment?._id);
      if (res.success) {
        setReplies(res?.data?.replies);
      }
    } catch (error) {
      console.error("Error fetching replies:", error);
      // Handle the case where the comment might have been deleted
      if (error.message && error.message.includes("Comment not found")) {
        setReplies([]);
        setTotalReplies(0);
      }
    }
  };

  const handleShowReplies = async (isShow) => {
    console.log("show replies");
    console.log("isShow", isShow);
    try {
      await fetchReplies();
      if (isShow) {
        setIsShowReplies(true);
      }
      setIsShowReplies(!isShowReplies);
    } catch (error) {
      console.error("Error showing replies:", error);
      // If we can't fetch replies, just hide the replies section
      setIsShowReplies(false);
    }
  };

  const handleReply = async () => {
    try {
      const res = await createReplyComment(comment?._id, replyText);
      console.log("reply", res);
      if (res.success) {
        await fetchReplies();
        setTotalReplies(totalReplies + 1);
        setReplyText("");
      }
    } catch (error) {
      console.error("Error replying to comment:", error);
    }
  };

  // Use the onDelete prop
  const handleDelete = () => {
    setIsDeleting(true);
    try {
      if (onDelete) {
        onDelete(comment._id);
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="mb-5 w-full">
      <div className="flex gap-3 w-full">
        <Link>
          <Avatar>
            <AvatarImage src={comment?.userId?.profilePicture?.url} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </Link>
        <div className="w-full" style={{ overflowX: "hidden" }}>
          <p className="break-words">
            <span className="font-semibold text-sm mr-2">
              {comment?.userId?.username}
            </span>
            <span className="text-gray-600 text-xs">{comment?.desc}</span>
          </p>

          <div className="flex gap-4 mt-1">
            <span className="text-gray-600 text-xs">
              {formatDate(comment?.createdAt)}
            </span>
            <button className="flex items-center text-xs text-gray-600  hover:text-red-500">
              {isLiked ? (
                <Heart
                  className="mr-1"
                  size={14}
                  fill="red"
                  onClick={handleLike}
                />
              ) : (
                <Heart className="mr-1" size={14} onClick={handleLike} />
              )}
              {commentLike !== 0 ? (
                <span className="text-gray-600 text-xs">
                  {commentLike} likes
                </span>
              ) : (
                <span className="text-gray-600 text-xs">Like</span>
              )}
            </button>
            <button
              className="flex items-center text-xs text-gray-600  hover:text-blue-500"
              onClick={handleShowReplyInput}
            >
              <MessageCircle className="mr-1" size={14} /> Reply
            </button>
            {isCurrentUserComment && (
              <Dialog>
                <DialogTrigger asChild>
                  <MoreHorizontal className="cursor-pointer h-4 w-4" />
                </DialogTrigger>
                <DialogContent className="flex flex-col items-center text-sm text-center w-[30%]">
                  <div
                    className="cursor-pointer  text-[#ED4956] font-bold flex items-center justify-center gap-2"
                    onClick={handleDelete}
                  >
                    {isDeleting ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <>
                        <Trash size={16} />
                        <span>Delete Comment</span>
                      </>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {totalReplies !== 0 && !isShowReplies && (
            <span
              className="text-gray-600 text-xs cursor-pointer"
              onClick={() => handleShowReplies()}
            >
              {totalReplies} replies
            </span>
          )}

          {isShowReplies && (
            <>
              <span
                className="text-gray-600 text-xs cursor-pointer"
                onClick={() => handleShowReplies()}
              >
                Hide replies
              </span>
              {isReplying && (
                <div className="mt-1 w-[80%]">
                  <div className="flex items-center justify-between ">
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="outline-none text-sm w-full"
                    />
                    {replyText && (
                      <>
                        <CornerDownLeft
                          size={18}
                          onClick={handleReply}
                          className=" cursor-pointer text-gray-600"
                        />
                      </>
                    )}
                  </div>
                  <hr className="my-2" />
                </div>
              )}
              <div className="mt-1 w-[80%]">
                {replies.map((reply) => (
                  <ReplyComment key={reply._id} comment={reply} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Comment;
