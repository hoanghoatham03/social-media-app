import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Link } from "react-router-dom";
import { useState } from "react";
import { followUser } from "@/api/user";
import { toast } from "sonner";

const SuggestedUser = ({ user }) => {
    
    const [isFollowing, setIsFollowing] = useState(false);
    const followHandler = async (userId) => {
        try {
            const res = await followUser(userId);
            if (res.success) {
                setIsFollowing(!isFollowing);
                toast.success(res.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message);
        }
    }
    return (
        <div className='flex items-center justify-between my-5'>
            <div className='flex items-center gap-2'>
                <Link to={`/profile/${user?._id}`}>
                    <Avatar>
                        <AvatarImage src={user?.profilePicture} alt="post_image" />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                </Link>
                <div>
                    <h1 className='font-semibold text-sm'><Link to={`/profile/${user?._id}`}>{user?.username}</Link></h1>
                    <span className='text-gray-600 text-sm'>{user?.bio || 'Bio here...'}</span>
                </div>
            </div>
            <span className='text-[#3BADF8] text-xs font-bold cursor-pointer hover:text-[#3495d6]' onClick={() => followHandler(user?._id)}>
                {isFollowing ? "Following" : "Follow"}
            </span>
        </div>
    )
}

export default SuggestedUser;