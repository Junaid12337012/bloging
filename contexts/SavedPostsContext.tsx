import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';

interface SavedPostsContextType {
  savedPostIds: string[];
  toggleSaved: (postId: string) => void;
  isSaved: (postId: string) => boolean;
}

export const SavedPostsContext = createContext<SavedPostsContextType | undefined>(undefined);

interface SavedPostsProviderProps {
  children: ReactNode;
}

export const SavedPostsProvider: React.FC<SavedPostsProviderProps> = ({ children }) => {
  const [savedPostIds, setSavedPostIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem('savedPosts');
      if (item) {
        setSavedPostIds(JSON.parse(item));
      }
    } catch (error) {
      console.error("Could not load saved posts from localStorage", error);
    }
  }, []);

  const updateLocalStorage = (ids: string[]) => {
     try {
      window.localStorage.setItem('savedPosts', JSON.stringify(ids));
    } catch (error) {
      console.error("Could not save posts to localStorage", error);
    }
  }

  const toggleSaved = useCallback((postId: string) => {
    setSavedPostIds(prevIds => {
      const newIds = prevIds.includes(postId)
        ? prevIds.filter(id => id !== postId)
        : [...prevIds, postId];
      updateLocalStorage(newIds);
      return newIds;
    });
  }, []);

  const isSaved = useCallback((postId: string) => {
    return savedPostIds.includes(postId);
  }, [savedPostIds]);


  return (
    <SavedPostsContext.Provider value={{ savedPostIds, toggleSaved, isSaved }}>
      {children}
    </SavedPostsContext.Provider>
  );
};