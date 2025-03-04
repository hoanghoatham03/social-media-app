import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "../ui/commentDialog";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Link } from "react-router-dom";
import { MoreHorizontal } from "lucide-react";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import Comment from "./Comment";
import { createComment, deleteComment } from "@/api/comment";
import { toast } from "sonner";
import { setPosts } from "@/redux/postSlice";

const CommentDialog = ({ open, setOpen, isFollowing, followHandler }) => {
  const [text, setText] = useState("");
  const { selectedPost, posts } = useSelector((store) => store.post);
  const [comment, setComment] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    if (selectedPost) {
      const sortedComments = selectedPost.comments
        .slice()
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setComment(sortedComments);
    }
  }, [selectedPost]);

  const changeEventHandler = (e) => {
    const inputText = e.target.value;
    if (inputText.trim()) {
      setText(inputText);
    } else {
      setText("");
    }
  };

  const commentDeleteHandler = async (commentId) => {
    try {
      const res = await deleteComment(commentId);

      if (res.success) {
        const updatedComments = comment.filter((c) => c._id !== commentId);
        setComment(updatedComments);

        const updatedPostData = posts.map((p) =>
          p._id === selectedPost._id ? { ...p, comments: updatedComments } : p
        );
        dispatch(setPosts(updatedPostData));

        toast.success("Comment deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Failed to delete comment");
    }
  };

  const sendMessageHandler = async () => {
    try {
      const res = await createComment(selectedPost?._id, text);

      if (res.success) {
        const updatedCommentData = [res.data, ...comment];
        setComment(updatedCommentData);

        const updatedPostData = posts.map((p) =>
          p._id === selectedPost._id
            ? { ...p, comments: updatedCommentData }
            : p
        );
        dispatch(setPosts(updatedPostData));
        toast.success("Comment added successfully");
        setText("");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent
        onInteractOutside={() => setOpen(false)}
        className="max-w-5xl p-0 flex flex-col"
      >
        <div className="flex flex-1">
          <div className="w-1/2">
            <img
              src={selectedPost?.image?.url}
              alt="post_img"
              className="w-full h-full object-cover rounded-l-lg"
            />
          </div>
          <div className="w-1/2 flex flex-col justify-between">
            <div className="flex items-center justify-between p-4">
              <div className="flex gap-3 items-center">
                <Link>
                  <Avatar>
                    <AvatarImage
                      src={selectedPost?.author?.profilePicture?.url}
                    />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                </Link>
                <div>
                  <Link className="font-semibold text-sm">
                    {selectedPost?.author?.username}
                  </Link>
                </div>
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <MoreHorizontal className="cursor-pointer" />
                </DialogTrigger>
                <DialogContent className="flex flex-col items-center text-sm text-center">
                  {isFollowing ? (
                    <div
                      className="cursor-pointer w-full text-[#ED4956] font-bold"
                      onClick={() => {
                        followHandler(selectedPost?.author?._id);
                        setOpen(false);
                      }}
                    >
                      Unfollow
                    </div>
                  ) : (
                    <div
                      className="cursor-pointer w-full"
                      onClick={() => {
                        followHandler(selectedPost?.author?._id);
                        setOpen(false);
                      }}
                    >
                      Follow
                    </div>
                  )}
                  <div className="cursor-pointer w-full">Add to favorites</div>
                </DialogContent>
              </Dialog>
            </div>
            <hr />
            <div className="p-4 flex flex-col gap-2">
              <div className="flex gap-3 items-center">
                <Link>
                  <Avatar>
                    <AvatarImage
                      src={selectedPost?.author?.profilePicture?.url}
                    />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                </Link>
                <div>
                  <Link className="font-semibold text-sm">
                    {selectedPost?.author?.username}
                  </Link>
                </div>
              </div>
              <div>
                <span className="text-gray-600 text-sm">
                  {selectedPost?.desc}
                </span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto max-h-52 p-4 scrollbar-hide">
              {comment.map((comment) => (
                <Comment
                  key={comment._id}
                  comment={comment}
                  onDelete={commentDeleteHandler}
                />
              ))}
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={text}
                  onChange={changeEventHandler}
                  placeholder="Add a comment..."
                  className="w-full outline-none border text-sm border-gray-300 p-2 rounded"
                />
                <Button
                  disabled={!text.trim()}
                  onClick={sendMessageHandler}
                  variant="outline"
                >
                  Send
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommentDialog;
