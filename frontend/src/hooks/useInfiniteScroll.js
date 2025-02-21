import { useEffect, useRef, useState } from "react";

export const useInfiniteScroll = (callback) => {
  const [isLoading, setIsLoading] = useState(false);
  const observerRef = useRef(null);
  const targetRef = useRef(null);

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: "20px",
      threshold: 1.0,
    };

    observerRef.current = new IntersectionObserver(async ([entry]) => {
      if (entry.isIntersecting && !isLoading) {
        setIsLoading(true);
        await callback();
        setIsLoading(false);
      }
    }, options);

    if (targetRef.current) {
      observerRef.current.observe(targetRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [callback, isLoading]);

  return { targetRef, isLoading };
};
