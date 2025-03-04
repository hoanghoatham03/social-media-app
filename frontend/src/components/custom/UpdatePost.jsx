import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader } from "../ui/commentDialog";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { readFileAsDataURL } from "@/utils/fileReader";
import { Loader2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { setPosts } from "@/redux/postSlice";
import { updatePost } from "@/api/post";

const UpdatePost = ({ open, setOpen, post }) => {
  const imageRef = useRef();
  const [file, setFile] = useState(post?.image?.url);
  const [desc, setDesc] = useState(post?.desc);
  const [imagePreview, setImagePreview] = useState(post?.image?.url);
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((store) => store.auth);
  const { posts } = useSelector((store) => store.post);
  const dispatch = useDispatch();


  const fileChangeHandler = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      const dataUrl = await readFileAsDataURL(file);
      setImagePreview(dataUrl);
    }
  };

  const updatePostHandler = async () => {
    const formData = new FormData();
    formData.append("desc", desc);
    if (file && file instanceof File) {
      formData.append("image", file);
    }

    try {
      setLoading(true);
      const res = await updatePost(post._id, formData);

      if (res.success) {
       
        const updatedPosts = posts.map((p) => {
          if (p._id === post._id) {
            return {
              ...p, 
              desc: desc, 
              image: {
                
                url:
                  typeof file === "string"
                    ? file
                    : res.data.image?.url || p.image?.url,
                public_id: res.data.image?.public_id || p.image?.public_id,
              },
            };
          }
          return p;
        });

        
        dispatch(setPosts(updatedPosts));

        toast.success("Post updated successfully");
        setOpen(false);

        
        window.location.reload();
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error?.response?.data?.message || "Failed to update post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent onInteractOutside={() => setOpen(false)}>
        <Button
          variant="ghost"
          className="absolute top-2 right-2 out"
          onClick={() => setOpen(false)}
          size="icon"
        >
          <X />
        </Button>

        <DialogHeader className="text-center font-semibold">
          Update Post
        </DialogHeader>

        <div className="flex gap-3 items-center">
          <Avatar>
            <AvatarImage src={user?.profilePicture?.url} alt="img" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-semibold text-xs">{user?.username}</h1>
            <span className="text-gray-600 text-xs">Bio here...</span>
          </div>
        </div>
        <Textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          className="focus-visible:ring-transparent border-none"
          placeholder="Write a caption..."
        />
        {imagePreview && (
          <div className="w-full h-64 flex items-center justify-center">
            <img
              src={imagePreview}
              alt="preview_img"
              className="object-cover h-full w-full rounded-md"
            />
          </div>
        )}
        <input
          ref={imageRef}
          type="file"
          className="hidden"
          onChange={fileChangeHandler}
        />
        <Button
          onClick={() => imageRef.current.click()}
          className="w-fit mx-auto hover:bg-gray-800 "
        >
          Select from computer
        </Button>
        {imagePreview &&
          (loading ? (
            <Button>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Please wait
            </Button>
          ) : (
            <Button
              onClick={updatePostHandler}
              type="submit"
              className="w-full hover:bg-gray-800"
            >
              Update
            </Button>
          ))}
      </DialogContent>
    </Dialog>
  );
};

export default UpdatePost;
