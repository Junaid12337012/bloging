import React, { createContext, useState, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { Post, Category, Author, User, Tag, Page, Snippet, Comment, ContactMessage, Subscriber } from '../types';
import { posts as initialPosts, categories as initialCategories, authors as initialAuthors, tags as initialTags, pages as initialPages, snippets as initialSnippets, comments as initialComments } from '../data';

interface SiteSettings {
    title: string;
    description: string;
    twitterUrl: string;
    githubUrl: string;
    logoLightUrl?: string;
    logoDarkUrl?: string;
}

interface DataContextType {
  posts: Post[];
  publishedPosts: Post[];
  categories: Category[];
  authors: Author[];
  users: User[];
  tags: Tag[];
  pages: Page[];
  snippets: Snippet[];
  comments: Comment[];
  contactMessages: ContactMessage[];
  siteSettings: SiteSettings;
  subscribers: Subscriber[];
  findOrCreateUser: (email: string) => User;
  addPost: (post: Omit<Post, 'id' | 'slug' | 'publishedDate' | 'likes'>) => void;
  updatePost: (updatedPost: Post) => void;
  deletePost: (postId: string) => void;
  addCategory: (categoryData: Omit<Category, 'id'>) => void;
  deleteCategory: (categoryId: string) => boolean;
  addAuthor: (authorData: Omit<Author, 'id'>) => void;
  updateAuthor: (updatedAuthor: Author) => void;
  deleteAuthor: (authorId: string) => boolean;
  updateUser: (updatedUser: User) => void;
  deleteUser: (userId: string) => void;
  updatePage: (updatedPage: Page) => void;
  addComment: (commentData: Omit<Comment, 'id' | 'timestamp'>) => void;
  updateCommentStatus: (commentId: string, status: Comment['status']) => void;
  deleteComment: (commentId: string) => void;
  addContactMessage: (messageData: Omit<ContactMessage, 'id' | 'timestamp'>) => void;
  deleteContactMessage: (messageId: string) => void;
  updateSiteSettings: (settings: SiteSettings) => void;
  updateLikes: (postId: string, increment: boolean) => void;
  addSubscriber: (email: string) => boolean;
  deleteSubscriber: (subscriberId: string) => void;
}

export const DataContext = createContext<DataContextType | undefined>(undefined);

interface DataProviderProps {
  children: ReactNode;
}

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '');

const usePersistentState = <T,>(key: string, initialValue: T) => {
    const [state, setState] = useState<T>(() => {
        try {
            const storedValue = window.localStorage.getItem(key);
            return storedValue ? JSON.parse(storedValue) : initialValue;
        } catch (error) {
            console.error(`Error reading localStorage key “${key}”:`, error);
            return initialValue;
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(state));
        } catch (error) {
            console.error(`Error setting localStorage key “${key}”:`, error);
        }
    }, [key, state]);

    return [state, setState] as const;
};


export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [posts, setPosts] = usePersistentState<Post[]>('inkwellPosts', initialPosts.map(p => ({...p, history: []})));
  const [categories, setCategories] = usePersistentState<Category[]>('inkwellCategories', initialCategories);
  const [authors, setAuthors] = usePersistentState<Author[]>('inkwellAuthors', initialAuthors);
  const [users, setUsers] = usePersistentState<User[]>('inkwellUsers', []);
  const [tags, setTags] = usePersistentState<Tag[]>('inkwellTags', initialTags);
  const [pages, setPages] = usePersistentState<Page[]>('inkwellPages', initialPages);
  const [snippets, setSnippets] = useState<Snippet[]>(initialSnippets);
  const [comments, setComments] = usePersistentState<Comment[]>('inkwellComments', initialComments);
  const [contactMessages, setContactMessages] = usePersistentState<ContactMessage[]>('inkwellContactMessages', []);
  const [subscribers, setSubscribers] = usePersistentState<Subscriber[]>('inkwellSubscribers', []);
  const [siteSettings, setSiteSettings] = usePersistentState<SiteSettings>('inkwellSiteSettings', {
    title: "Inkwell",
    description: "A modern, responsive, and feature-rich blogging platform for readers and writers.",
    twitterUrl: "#",
    githubUrl: "#",
    logoLightUrl: "",
    logoDarkUrl: "",
  });
  
  const publishedPosts = useMemo(() => posts.filter(post => post.status === 'published'), [posts]);

  const findOrCreateUser = useCallback((email: string): User => {
    let userToReturn: User | null = null;
    
    setUsers(prevUsers => {
        const existingUser = prevUsers.find(u => u.email === email);
        if (existingUser) {
            userToReturn = existingUser;
            return prevUsers;
        }
        
        const isFirstUser = prevUsers.length === 0;
        const newUser: User = {
            id: Date.now().toString(),
            name: email.split('@')[0].replace(/[\._]/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()) || 'New User',
            email,
            isAdmin: isFirstUser,
        };
        
        userToReturn = newUser;
        return [...prevUsers, newUser];
    });

    // The state update is queued, but we can return the user object immediately.
    // In a quick sequence of calls, this might be problematic, but for a user login flow it's safe.
    if(userToReturn) {
        return userToReturn;
    }
    
    // Fallback logic in case of async weirdness (should not happen in this app's flow)
    const finalUsers = JSON.parse(window.localStorage.getItem('inkwellUsers') || '[]');
    return finalUsers.find((u: User) => u.email === email)!;

  }, []); // No dependency array needed as setUsers from useState is stable and we use functional updates.


  // Post Management
  const addPost = useCallback((postData: Omit<Post, 'id' | 'slug' | 'publishedDate' | 'likes'>) => {
    const newPost: Post = {
      ...postData,
      id: Date.now().toString(),
      slug: slugify(postData.title),
      publishedDate: new Date().toISOString().split('T')[0],
      likes: 0,
      history: [],
    };
    setPosts(prevPosts => [newPost, ...prevPosts]);
  }, [setPosts]);

  const updatePost = useCallback((updatedPost: Post) => {
    setPosts(prevPosts =>
      prevPosts.map(post => {
          if (post.id === updatedPost.id) {
            // Add previous content to history if it has changed
            if (post.content !== updatedPost.content) {
                const newHistoryEntry = { content: post.content, timestamp: new Date().toISOString() };
                const newHistory = [newHistoryEntry, ...(post.history || [])].slice(0, 5); // Keep last 5
                return { ...updatedPost, slug: slugify(updatedPost.title), history: newHistory };
            }
            return { ...updatedPost, slug: slugify(updatedPost.title) };
          }
          return post;
      })
    );
  }, [setPosts]);

  const deletePost = useCallback((postId: string) => {
    setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
  }, [setPosts]);

  const updateLikes = useCallback((postId: string, increment: boolean) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? { ...post, likes: Math.max(0, post.likes + (increment ? 1 : -1)) }
          : post
      )
    );
  }, [setPosts]);
  
  // Category Management
  const addCategory = useCallback((categoryData: Omit<Category, 'id'>) => {
    const newCategory: Category = {
        id: Date.now().toString(),
        name: categoryData.name,
        description: categoryData.description,
        imageUrl: categoryData.imageUrl || `https://picsum.photos/seed/${slugify(categoryData.name)}/1200/400`,
    };
    setCategories(prev => [newCategory, ...prev]);
  }, [setCategories]);

  const deleteCategory = useCallback((categoryId: string): boolean => {
    const isCategoryInUse = posts.some(post => post.category.id === categoryId);
    if (isCategoryInUse) {
        return false;
    }
    setCategories(prev => prev.filter(cat => cat.id !== categoryId));
    return true;
  }, [posts, setCategories]);

  // Author Management
  const addAuthor = useCallback((authorData: Omit<Author, 'id'>) => {
      const newAuthor: Author = {
          ...authorData,
          id: Date.now().toString(),
      };
      setAuthors(prev => [newAuthor, ...prev]);
  }, [setAuthors]);

  const updateAuthor = useCallback((updatedAuthor: Author) => {
      setAuthors(prev => prev.map(author => (author.id === updatedAuthor.id ? updatedAuthor : author)));
  }, [setAuthors]);

  const deleteAuthor = useCallback((authorId: string): boolean => {
      const isAuthorInUse = posts.some(post => post.author.id === authorId);
      if (isAuthorInUse) {
          return false;
      }
      setAuthors(prev => prev.filter(author => author.id !== authorId));
      return true;
  }, [posts, setAuthors]);

  // User Management
  const updateUser = useCallback((updatedUser: User) => {
      setUsers(prev => prev.map(user => (user.id === updatedUser.id ? updatedUser : user)));
  }, [setUsers]);

  const deleteUser = useCallback((userId: string) => {
      setUsers(prev => prev.filter(user => user.id !== userId));
  }, [setUsers]);

  // Page Management
  const updatePage = useCallback((updatedPage: Page) => {
    setPages(prevPages =>
        prevPages.map(page => (page.id === updatedPage.id ? updatedPage : page))
    );
  }, [setPages]);

  // Comment Management
  const addComment = useCallback((commentData: Omit<Comment, 'id' | 'timestamp'>) => {
    const newComment: Comment = {
      ...commentData,
      id: Date.now().toString(),
      timestamp: 'Just now',
    };
    setComments(prev => [newComment, ...prev]);
  }, [setComments]);

  const updateCommentStatus = useCallback((commentId: string, status: Comment['status']) => {
    setComments(prev => 
      prev.map(comment => 
        comment.id === commentId ? { ...comment, status } : comment
      )
    );
  }, [setComments]);

  const deleteComment = useCallback((commentId: string) => {
    setComments(prev => prev.filter(comment => comment.id !== commentId));
  }, [setComments]);

  // Contact Message Management
  const addContactMessage = useCallback((messageData: Omit<ContactMessage, 'id' | 'timestamp'>) => {
    const newMessage: ContactMessage = {
      ...messageData,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };
    setContactMessages(prev => [newMessage, ...prev]);
  }, [setContactMessages]);

  const deleteContactMessage = useCallback((messageId: string) => {
    setContactMessages(prev => prev.filter(msg => msg.id !== messageId));
  }, [setContactMessages]);
  
  // Subscriber Management
  const addSubscriber = useCallback((email: string): boolean => {
    let isNew = false;
    setSubscribers(prev => {
        if (prev.some(s => s.email.toLowerCase() === email.toLowerCase())) {
            isNew = false;
            return prev;
        }
        const newSubscriber: Subscriber = {
            id: Date.now().toString(),
            email,
            subscribedAt: new Date().toISOString(),
        };
        isNew = true;
        return [newSubscriber, ...prev];
    });
    return isNew;
  }, [setSubscribers]);

  const deleteSubscriber = useCallback((subscriberId: string) => {
    setSubscribers(prev => prev.filter(s => s.id !== subscriberId));
  }, [setSubscribers]);


  // Site Settings
  const updateSiteSettings = useCallback((settings: SiteSettings) => {
    setSiteSettings(settings);
  }, [setSiteSettings]);


  return (
    <DataContext.Provider value={{ 
        posts, publishedPosts, categories, authors, users, tags, pages, snippets, comments, contactMessages, siteSettings, subscribers,
        findOrCreateUser,
        addPost, updatePost, deletePost, 
        addCategory, deleteCategory,
        addAuthor, updateAuthor, deleteAuthor,
        updateUser, deleteUser,
        updatePage,
        addComment, updateCommentStatus, deleteComment,
        addContactMessage, deleteContactMessage,
        updateSiteSettings,
        updateLikes,
        addSubscriber, deleteSubscriber
    }}>
      {children}
    </DataContext.Provider>
  );
};