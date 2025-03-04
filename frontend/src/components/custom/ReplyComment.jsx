import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { formatDate } from "@/utils/formatDate";
import {
  Heart,
  CornerDownLeft,
  MoreHorizontal,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { setPosts } from "@/redux/postSlice";
import { useEffect } from "react";

import { createReplyComment, likeReplyComment } from "@/api/comment";
import { Dialog, DialogTrigger, DialogContent } from "../ui/dialog";
import { Trash } from "lucide-react";
import { Link } from "react-router-dom";

const ReplyComment = ({ comment, onDelete    }) => {
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
  const isCurrentUserReply = user?._id === comment?.userId?._id;
  const [isDeletingReply, setIsDeletingReply] = useState(false);

  useEffect(() => {
    setCommentLike(comment?.totalLikes);
    setTotalReplies(comment?.totalReplies);
    setIsLiked(comment?.likes.includes(user?._id) || false);
  }, [comment]);



  const handleLike = async () => {
    try {
      const res = await likeReplyComment(comment?._id);

      console.log("handleLikeReply", res);
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
      console.error("Error liking reply comment:", error);
    }
  };


  const handleReply = async () => {
    try {
      const res = await createReplyComment(comment?._id, replyText);
      console.log("reply", res);
      if (res.success) {
        setReplies([...replies, res.reply]);
        setTotalReplies(totalReplies + 1);
        setReplyText("");
      }
    } catch (error) {
      console.error("Error replying to comment:", error);
    }
  };

  const handleDeleteReply = async () => {
    setIsDeletingReply(true);
    try {
      await onDelete(comment?._id);
    } catch (error) {
      console.error("Error deleting reply:", error);
    } finally {
      setIsDeletingReply(false);
    }
  };

  return (
    <div className="mt-3 w-full">
      <div className="flex gap-3 w-full">
        <Link to={`/profile/${comment?.userId?._id}`}>
        <Avatar>
          <AvatarImage src={comment?.userId?.profilePicture?.url} />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        </Link>
        <div className="w-full" style={{ overflowX: "hidden" }}>
          <p className="break-words">
            <span className="font-semibold text-sm mr-2">
              <Link to={`/profile/${comment?.userId?._id}`}>
                {comment?.userId?.username}
              </Link>
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
            {isCurrentUserReply && (
              <Dialog>
                <DialogTrigger asChild>
                  <MoreHorizontal className="cursor-pointer h-4 w-4" />
                </DialogTrigger>
                <DialogContent className="flex flex-col items-center text-sm text-center">
                  <div className="cursor-pointer w-full text-[#ED4956] font-bold flex items-center justify-center gap-2" onClick={handleDeleteReply}>
                    {isDeletingReply ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <>
                        <Trash size={16} />
                        <span>Delete Reply</span>
                      </>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>


        

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
        </div>
      </div>
    </div>
  );
};

export default ReplyComment;
