
import React from 'react';
import { Link } from 'react-router-dom';
import { Post } from '../types';
import { motion } from 'framer-motion';
import { useSavedPosts } from '../hooks/useSavedPosts';
import { BookmarkIcon } from './icons';

interface BlogPostCardProps {
  post: Post;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const BlogPostCard: React.FC<BlogPostCardProps> = ({ post }) => {
  const { isSaved, toggleSaved } = useSavedPosts();
  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSaved(post.id);
  };

  return (
    <motion.div 
      variants={cardVariants} 
      className="relative flex flex-col rounded-lg shadow-lg overflow-hidden h-full bg-white dark:bg-slate-800 group transition-shadow duration-300 hover:shadow-xl hover:shadow-primary-500/10 dark:hover:shadow-primary-400/10"
    >
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleBookmarkClick}
        className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm text-slate-700 dark:text-slate-200 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
        aria-label={isSaved(post.id) ? 'Unsave this post' : 'Save this post'}
      >
        <BookmarkIcon className="w-5 h-5" filled={isSaved(post.id)} />
      </motion.button>
      
      <Link to={`/post/${post.id}`} className="block">
        <div className="flex-shrink-0 overflow-hidden">
          <img className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105" src={post.imageUrl} alt={post.title} />
        </div>
        <div className="flex-1 p-6 flex flex-col justify-between">
          <div className="flex-1">
            <Link 
              to={`/category/${post.category.id}`} 
              className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline z-10 relative"
              onClick={(e) => e.stopPropagation()}
            >
              {post.category.name}
            </Link>
            <h3 className="mt-2 text-xl font-semibold font-serif text-slate-900 dark:text-white">
              {post.title}
            </h3>
            <p className="mt-3 text-base text-slate-500 dark:text-slate-400">
              {post.excerpt}
            </p>
          </div>
          <Link to={`/author/${post.author.id}`} onClick={(e) => e.stopPropagation()} className="mt-6 flex items-center group/author z-10 relative">
            <div className="flex-shrink-0">
              <img className="h-10 w-10 rounded-full" src={post.author.avatarUrl} alt={post.author.name} />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-slate-900 dark:text-white group-hover/author:underline">{post.author.name}</p>
              <div className="flex space-x-1 text-sm text-slate-500 dark:text-slate-400">
                <time dateTime={post.publishedDate}>{new Date(post.publishedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
                <span aria-hidden="true">&middot;</span>
                <span>{post.readingTime} min read</span>
              </div>
            </div>
          </Link>
        </div>
      </Link>
    </motion.div>
  );
};

export default BlogPostCard;
