import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { formatDate } from "@/utils/formatDate";
import {
  Heart,
  MessageCircle,
  CornerDownLeft,
  Trash,
} from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { likeComment, deleteComment } from "@/api/comment";
import { useDispatch } from "react-redux";
import { setPosts } from "@/redux/postSlice";
import { useEffect } from "react";
import { getReplies } from "@/api/comment";
import { createReplyComment } from "@/api/comment";
import ReplyComment from "./ReplyComment";
import { Loader2 } from "lucide-react";

const Comment = ({ comment }) => {
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

  useEffect(() => {
    setCommentLike(comment?.totalLikes);
    setTotalReplies(comment?.totalReplies);
    setIsLiked(comment?.likes.includes(user?._id) || false);
  }, [comment]);

  // useEffect(() => {
  //   const fetchReplies = async () => {
  //     const res = await getReplies(comment?._id);
  //     console.log("replies", res);
  //     setReplies(res.replies);
  //   };
  //   fetchReplies();
  // }, [comment?._id]);

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
    const res = await getReplies(comment?._id);
    if (res.success) {
      setReplies(res?.data?.replies);
    }
  };

  const handleShowReplies = async (isShow) => {
    console.log("show replies");
    console.log("isShow", isShow);
    await fetchReplies();
    if (isShow) {
      setIsShowReplies(true);
    }
    setIsShowReplies(!isShowReplies);
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

  const handleDeleteComment = async () => {
    setIsDeleting(true);
    try {
      const res = await deleteComment(comment?._id);
      console.log("delete comment", res);
    if (res.success) {
      setIsDeleting(false);
    } 
  } catch (error) {
    console.error("Error deleting comment:", error);
    setIsDeleting(false);
  } finally {
    setIsDeleting(false);
  }
  };

  return (
    <div className="mb-5 w-full">
      <div className="flex gap-3 w-full">
        <Avatar>
          <AvatarImage src={comment?.userId?.profilePicture?.url} />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
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

            <button className="flex items-center text-xs text-gray-600  hover:text-red-500" onClick={handleDeleteComment}>
              {isDeleting ? <Loader2 className="mr-1" size={14} /> : <Trash className="mr-1" size={14} />}
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
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
