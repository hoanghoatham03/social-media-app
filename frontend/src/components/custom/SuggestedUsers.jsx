import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useState } from "react";
import { followUser } from "@/api/user";
import { toast } from "sonner";
import SuggestedUser from "./SuggestedUser";

const SuggestedUsers = () => {
    const { suggestedUsers } = useSelector(store => store.auth);
    
    return (
        <div className='my-10'>
            <div className='flex items-center justify-between text-sm'>
                <h1 className='font-semibold text-gray-600 pr-4'>Suggested for you</h1>
                <span className='font-medium cursor-pointer'>See All</span>
            </div>
            {
                suggestedUsers?.data?.suggestUser?.map((user) => {
                    return <SuggestedUser key={user._id} user={user} />
                })
            }

        </div>
    )
}

export default SuggestedUsers