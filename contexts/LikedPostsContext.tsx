import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';

interface LikedPostsContextType {
  likedPostIds: string[];
  toggleLiked: (postId: string) => void;
  isLiked: (postId: string) => boolean;
}

export const LikedPostsContext = createContext<LikedPostsContextType | undefined>(undefined);

interface LikedPostsProviderProps {
  children: ReactNode;
}

export const LikedPostsProvider: React.FC<LikedPostsProviderProps> = ({ children }) => {
  const [likedPostIds, setLikedPostIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem('likedPosts');
      if (item) {
        setLikedPostIds(JSON.parse(item));
      }
    } catch (error) {
      console.error("Could not load liked posts from localStorage", error);
    }
  }, []);

  const updateLocalStorage = (ids: string[]) => {
     try {
      window.localStorage.setItem('likedPosts', JSON.stringify(ids));
    } catch (error) {
      console.error("Could not save liked posts to localStorage", error);
    }
  }

  const toggleLiked = useCallback((postId: string) => {
    setLikedPostIds(prevIds => {
      const isCurrentlyLiked = prevIds.includes(postId);
      const newIds = isCurrentlyLiked
        ? prevIds.filter(id => id !== postId)
        : [...prevIds, postId];
      updateLocalStorage(newIds);
      return newIds;
    });
  }, []);

  const isLiked = useCallback((postId: string) => {
    return likedPostIds.includes(postId);
  }, [likedPostIds]);

  return (
    <LikedPostsContext.Provider value={{ likedPostIds, toggleLiked, isLiked }}>
      {children}
    </LikedPostsContext.Provider>
  );
};
