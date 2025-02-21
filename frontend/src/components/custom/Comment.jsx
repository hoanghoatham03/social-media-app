import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'

const Comment = ({ comment }) => {
    console.log("comment", comment);
    return (
        <div className='my-2'>
            <div className='flex gap-3 items-center'>
                <Avatar>
                    <AvatarImage src={comment?.userId?.profilePicture?.url} />
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <h1 className='font-bold text-sm'>{comment?.userId?.username} <span className='font-normal pl-1'>{comment?.desc}</span></h1>
            </div>
        </div>
    )
}

export default Comment