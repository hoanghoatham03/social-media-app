import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";

import {
  getStoriesForFeed,
  viewStory,
  createStory,
  deleteStoryItem,
} from "@/api/story";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Loader2,
  ImagePlus,
  Trash,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { readFileAsDataURL } from "@/utils/fileReader";
import { Link } from "react-router-dom";
const Story = () => {
  const { user } = useSelector((state) => state.auth);
  const [stories, setStories] = useState([]);
  const [activeStoryIndex, setActiveStoryIndex] = useState(null);
  const [openStoryView, setOpenStoryView] = useState(false);
  const [currentStoryItemIndex, setCurrentStoryItemIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [openAddStory, setOpenAddStory] = useState(false);
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [addingStory, setAddingStory] = useState(false);
  const fileInputRef = useRef();

  const fetchStories = async () => {
    try {
      setLoading(true);
      const response = await getStoriesForFeed();

      console.log("Stories API response:", response);

      if (response && response.success) {
        if (Array.isArray(response.stories)) {
          setStories(response.stories);
        } else {
          console.error("Stories data is not an array:", response.stories);
          setStories([]);
        }
      } else {
        console.error("Failed to fetch stories:", response);
        setStories([]);
      }
    } catch (error) {
      console.error("Error fetching stories:", error);
      setStories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  const fileChangeHandler = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      const dataUrl = await readFileAsDataURL(file);
      setImagePreview(dataUrl);
    }
  };

  const handleOpenStory = async (index) => {
    if (!stories || !stories[index]) {
      console.error("Cannot open story at index", index);
      return;
    }

    setActiveStoryIndex(index);
    setCurrentStoryItemIndex(0);
    setOpenStoryView(true);

    // Mark story as viewed when opened
    try {
      const storyId = stories[index]._id;
      if (!storyId) {
        console.error("Story ID is missing");
        return;
      }

      await viewStory(storyId);

      // Update local state to mark story as viewed
      setStories((prevStories) => {
        if (!prevStories || !Array.isArray(prevStories)) return [];

        const updatedStories = [...prevStories];
        if (updatedStories[index]) {
          updatedStories[index] = {
            ...updatedStories[index],
            viewed: true,
          };
        }
        return updatedStories;
      });
    } catch (error) {
      console.error("Error marking story as viewed:", error);
    }
  };

  const handleCloseStory = () => {
    setOpenStoryView(false);
    setActiveStoryIndex(null);
  };

  const handleNextStory = () => {
    if (!stories || !stories.length) return;

    if (activeStoryIndex < stories.length - 1) {
      setActiveStoryIndex(activeStoryIndex + 1);
      setCurrentStoryItemIndex(0);
    } else {
      handleCloseStory();
    }
  };

  const handlePrevStory = () => {
    if (!stories || !stories.length) return;

    if (activeStoryIndex > 0) {
      setActiveStoryIndex(activeStoryIndex - 1);
      setCurrentStoryItemIndex(0);
    }
  };

  const handleNextItem = () => {
    if (!stories || !stories.length || activeStoryIndex === null) return;

    const activeStory = stories[activeStoryIndex];
    if (!activeStory || !activeStory.items || !activeStory.items.length) return;

    if (currentStoryItemIndex < activeStory.items.length - 1) {
      setCurrentStoryItemIndex(currentStoryItemIndex + 1);
    } else {
      handleNextStory();
    }
  };

  const handlePrevItem = () => {
    if (!stories || !stories.length || activeStoryIndex === null) return;

    if (currentStoryItemIndex > 0) {
      setCurrentStoryItemIndex(currentStoryItemIndex - 1);
    } else {
      handlePrevStory();
    }
  };

  const handleOpenAddStory = () => {
    setOpenAddStory(true);
  };

  const handleCloseAddStory = () => {
    setOpenAddStory(false);
  };

  const handleDeleteStory = async () => {
    if (!stories || !stories.length) return;

    const storyId = stories[activeStoryIndex]._id;
    if (!storyId) {
      console.error("Story ID is missing");
      return;
    }

    const itemId = stories[activeStoryIndex].items[currentStoryItemIndex]._id;
    if (!itemId) {
      console.error("Item ID is missing");
      return;
    }

    try {
      await deleteStoryItem(storyId, itemId);
      toast.success("Story item deleted successfully");
    } catch (error) {
      console.error("Error deleting story item:", error);
      toast.error(
        error?.response?.data?.message || "Failed to delete story item"
      );
    } finally {
      setOpenStoryView(false);
      fetchStories();
    }
  };

  const createStoryHandler = async () => {
    if (!file) {
      toast.error("Please select an image for your story");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      setAddingStory(true);
      const res = await createStory(formData);
      if (res.success) {
        toast.success("Story created successfully");

        // Refresh stories after adding a new one
        const response = await getStoriesForFeed();
        if (response.success) {
          setStories(response.stories);
        }

        // Reset form state
        setFile(null);
        setImagePreview(null);
        setOpenAddStory(false);
      }
    } catch (error) {
      console.error("Error creating story:", error);
      toast.error(error?.response?.data?.message || "Failed to create story");
    } finally {
      setAddingStory(false);
    }
  };

  const renderProgressBars = (storyItems) => {
    if (!storyItems || !Array.isArray(storyItems) || storyItems.length === 0) {
      return null;
    }

    return (
      <div className="flex w-full gap-1">
        {storyItems.map((_, index) => (
          <div
            key={index}
            className={`h-[3px] rounded flex-grow ${
              index <= currentStoryItemIndex ? "bg-white/30" : "bg-primary"
            }`}
          />
        ))}
      </div>
    );
  };

  console.log("stories", stories);

  return (
    <>
      <div className="flex gap-2 p-2 overflow-x-auto scrollbar-none rounded shadow border-none">
        {loading ? (
          <div className="flex justify-center w-full p-2">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <>
            <div
              className="flex flex-col items-center cursor-pointer"
              onClick={handleOpenAddStory}
            >
              <Avatar className="w-[60px] h-[60px] border-2 border-dashed border-primary p-[2px]">
                <AvatarImage src={user?.profilePic || ""} />
                <AvatarFallback>
                  <Plus className="w-5 h-5" />
                </AvatarFallback>
              </Avatar>
              <span className="mt-1 text-[0.7rem] text-center">Add Story</span>
            </div>

            {stories &&
              stories.length > 0 &&
              stories.map((story, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center cursor-pointer "
                  onClick={() => handleOpenStory(index)}
                >
                  {/* border color is rainbow*/}
                  <Avatar className="w-[60px] h-[60px] border-2 border-solid border-primary ">
                    <AvatarImage
                      src={story?.userId?.profilePicture?.url}
                      className="object-cover .rainbow-border"
                    />
                    <AvatarFallback>
                      {story?.userId?.username?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="mt-1 text-[0.7rem] text-center">
                    {story?.userId?.username || "User"}
                  </span>
                </div>
              ))}
          </>
        )}
      </div>

      {activeStoryIndex !== null && stories && stories.length > 0 && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 ${
            openStoryView ? "block" : "hidden"
          }`}
          onClick={handleCloseStory}
        >
          <div
            className="relative w-full sm:w-4/5 md:w-3/5 h-full sm:h-[80vh] max-h-[90vh] flex flex-col bg-black overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 right-0 p-2 z-10 flex items-center">
              {stories[activeStoryIndex]?.items &&
                renderProgressBars(stories[activeStoryIndex].items)}

              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarImage
                    src={stories[activeStoryIndex]?.userId?.profilePicture?.url}
                  />
                  <AvatarFallback>
                    {stories[activeStoryIndex]?.userId?.username?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-white">
                  {stories[activeStoryIndex]?.userId?.username || "User"}
                </span>
              </div>

              <div className="ml-auto">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white"
                    onClick={handleDeleteStory}
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="w-full h-full flex justify-center items-center relative">
              {stories[activeStoryIndex]?.items &&
                stories[activeStoryIndex].items[currentStoryItemIndex] && (
                  <img
                    src={
                      stories[activeStoryIndex].items[currentStoryItemIndex].url
                    }
                    alt="Story"
                    className="w-full h-full object-contain"
                  />
                )}

              {/* Navigation */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevItem}
                className="absolute left-2 bg-black/30 hover:bg-black/50 text-white"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleNextItem}
                className="absolute right-2 bg-black/30 hover:bg-black/50 text-white"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            {/* list of viewers */}

            <div className="absolute bottom-0 left-0 right-0 p-2 z-10 flex items-center">
              
              {stories[activeStoryIndex]?.viewers &&
                stories[activeStoryIndex].viewers.slice(0, 5).map((viewer, index) => (
                  <div key={index} className="flex items-center">
                    <Avatar>
                      <AvatarImage
                        src={
                          viewer.userId?.profilePicture?.url ||
                          viewer.userId?.profilePicture
                        }
                      />
                      <AvatarFallback>
                        {viewer.userId?.username?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    
          
                  </div>
                ))}

              {stories[activeStoryIndex]?.viewers &&
                stories[activeStoryIndex].viewers.length > 0 && (
                  <span className="text-white ml-2">
                    {stories[activeStoryIndex].viewers.length} views
                  </span>
                )}
            </div>
          </div>
        </div>
      )}

      <Dialog open={openAddStory} onOpenChange={setOpenAddStory}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add a new story</DialogTitle>
            <DialogDescription>
              Share a moment with your followers
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2 py-2">
            {imagePreview && (
              <div className="w-full h-80 flex items-center justify-center">
                <img
                  src={imagePreview}
                  alt="preview_img"
                  className="object-cover h-full w-full rounded-md"
                />
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={fileChangeHandler}
            />

            <div
              onClick={() => fileInputRef.current.click()}
              className="w-full flex justify-center items-center gap-2 cursor-pointer hover:bg-gray-200 rounded-md p-10"
            >
              <ImagePlus className="w-4 h-4 mr-2" />
              Select from computer
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCloseAddStory}>
              Cancel
            </Button>
            <Button
              onClick={createStoryHandler}
              disabled={!file || addingStory}
            >
              {addingStory ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Story"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Story;
