import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { AtSign, Heart, MessageCircle, Bookmark } from "lucide-react";
import { getUserProfile, followUser } from "@/api/user";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { setUserProfile } from "@/redux/authSlice";

const Profile = () => {
  const params = useParams();
  const userId = params.id;
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const {
    user,
    userProfile,
    bookmarkedPosts = [],
  } = useSelector((store) => store.auth);
  const [displayedPosts, setDisplayedPosts] = useState([]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      try {
        const res = await getUserProfile(userId);
        if (res.success) {
          dispatch(setUserProfile(res.data.user));
        }
      } catch (error) {
        console.log(error);
        toast.error("Failed to load user profile");
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, [userId, dispatch]);

  const [activeTab, setActiveTab] = useState("posts");
  const isLoggedInUserProfile = user?._id === userProfile?._id;
  const isFollowing = userProfile?.followers?.includes(user?._id);

  // Update displayed posts when tab changes
  useEffect(() => {
    if (activeTab === "saved" && isLoggedInUserProfile) {
      // Ensure bookmarkedPosts is an array
      const safeBookmarkedPosts = Array.isArray(bookmarkedPosts)
        ? bookmarkedPosts
        : [];
      setDisplayedPosts(safeBookmarkedPosts);
    } else if (activeTab === "posts") {
      // Ensure posts is an array
      const userPosts = Array.isArray(userProfile?.posts)
        ? userProfile?.posts
        : [];
      setDisplayedPosts(userPosts);
    }
  }, [activeTab, userProfile, bookmarkedPosts, isLoggedInUserProfile]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleFollowUser = async () => {
    try {
      const res = await followUser(userProfile?._id);
      if (res.success) {
        toast.success(res.message);
        // Refresh user profile to update followers count
        const updatedProfile = await getUserProfile(userId);
        if (updatedProfile.success) {
          dispatch(setUserProfile(updatedProfile.data.user));
        }
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to follow user");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="flex max-w-5xl justify-center mx-auto pl-10 mr-4">
      <div className="flex flex-col gap-20 p-8">
        <div className="grid grid-cols-2">
          <section className="flex items-center justify-center">
            <Avatar className="h-32 w-32">
              <AvatarImage
                src={userProfile?.profilePicture?.url}
                alt="profilephoto"
              />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </section>
          <section>
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-2">
                <span>{userProfile?.username}</span>
                {isLoggedInUserProfile ? (
                  <>
                    <Link to="/edit-profile">
                      <Button
                        variant="secondary"
                        className="hover:bg-gray-200 h-8"
                      >
                        Edit profile
                      </Button>
                    </Link>
                    <Button
                      variant="secondary"
                      className="hover:bg-gray-200 h-8"
                    >
                      View archive
                    </Button>
                    <Button
                      variant="secondary"
                      className="hover:bg-gray-200 h-8"
                    >
                      Ad tools
                    </Button>
                  </>
                ) : isFollowing ? (
                  <>
                    <Button variant="secondary" className="h-8">
                      Unfollow
                    </Button>
                    <Button variant="secondary" className="h-8">
                      Message
                    </Button>
                  </>
                ) : (
                  <Button
                    className="bg-[#0095F6] hover:bg-[#3192d2] h-8"
                    onClick={handleFollowUser}
                  >
                    Follow
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-4">
                <p>
                  <span className="font-semibold">
                    {userProfile?.posts?.length || 0}{" "}
                  </span>
                  posts
                </p>
                <p>
                  <span className="font-semibold">
                    {userProfile?.followers?.length || 0}{" "}
                  </span>
                  followers
                </p>
                <p>
                  <span className="font-semibold">
                    {userProfile?.following?.length || 0}{" "}
                  </span>
                  following
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-semibold">
                  {userProfile?.bio || "bio here..."}
                </span>
                <Badge className="w-fit" variant="secondary">
                  <AtSign />{" "}
                  <span className="pl-1">{userProfile?.username}</span>{" "}
                </Badge>
                <span>🤯Learn code with hoang hoa tham</span>
                <span>🤯Turing code into fun</span>
                <span>🤯DM for collaboration</span>
              </div>
            </div>
          </section>
        </div>
        <div className="border-t border-t-gray-200">
          <div className="flex items-center justify-center gap-10 text-sm">
            <span
              className={`py-3 cursor-pointer ${
                activeTab === "posts" ? "font-bold border-t border-black" : ""
              }`}
              onClick={() => handleTabChange("posts")}
            >
              POSTS
            </span>
            <span
              className={`py-3 cursor-pointer ${
                activeTab === "saved" ? "font-bold border-t border-black" : ""
              }`}
              onClick={() => handleTabChange("saved")}
            >
              SAVED
            </span>
            <span className="py-3 cursor-pointer">REELS</span>
            <span className="py-3 cursor-pointer">TAGS</span>
          </div>

          {activeTab === "saved" && !isLoggedInUserProfile ? (
            <div className="py-10 text-center">
              <Bookmark className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                Saved posts are private
              </h2>
              <p className="text-gray-500">
                Only you can see what you&apos;ve saved
              </p>
            </div>
          ) : displayedPosts.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-gray-500">
                {activeTab === "posts" ? "No posts yet" : "No saved posts yet"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1">
              {displayedPosts.map((post) => (
                <div key={post?._id} className="relative group cursor-pointer">
                  <img
                    src={post?.image?.url}
                    alt="postimage"
                    className="rounded-sm w-full aspect-square object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex items-center text-white space-x-4">
                      <button className="flex items-center gap-2 hover:text-gray-300">
                        <Heart />
                        <span>{post?.totalLikes}</span>
                      </button>
                      <button className="flex items-center gap-2 hover:text-gray-300">
                        <MessageCircle />
                        <span>{post?.totalComments}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
