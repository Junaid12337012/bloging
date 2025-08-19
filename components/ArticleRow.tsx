import React from 'react';
import { Link } from 'react-router-dom';
import { Post } from '../types';
import { motion } from 'framer-motion';
import { useSavedPosts } from '../hooks/useSavedPosts';
import { BookmarkIcon } from './icons';

interface ArticleRowProps {
  post: Post;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const ArticleRow: React.FC<ArticleRowProps> = ({ post }) => {
  const { isSaved, toggleSaved } = useSavedPosts();
  
  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSaved(post.id);
  };

  return (
    <motion.div variants={itemVariants} className="w-full">
      <Link to={`/author/${post.author.id}`} className="group inline-flex items-center mb-4">
        <img className="h-6 w-6 rounded-full mr-2" src={post.author.avatarUrl} alt={post.author.name} />
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 group-hover:underline transition-colors">{post.author.name}</p>
      </Link>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-8">
            <Link to={`/post/${post.id}`} className="block group">
                <h2 className="text-2xl font-bold font-serif text-slate-900 dark:text-white group-hover:underline">
                    {post.title}
                </h2>
                <p className="mt-2 text-base text-slate-500 dark:text-slate-400 line-clamp-3">
                    {post.excerpt}
                </p>
            </Link>
             <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
                    <span>{new Date(post.publishedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    <span aria-hidden="true">&middot;</span>
                    <span>{post.readingTime} min read</span>
                    <Link to={`/category/${post.category.id}`} className="hidden sm:inline-block ml-2 px-2 py-0.5 text-xs font-semibold bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 rounded-full hover:bg-primary-200 dark:hover:bg-primary-800/50 transition-colors">
                        {post.category.name}
                    </Link>
                </div>
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleBookmarkClick}
                    className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
                    aria-label={isSaved(post.id) ? 'Unsave this post' : 'Save this post'}
                >
                    <BookmarkIcon className="w-5 h-5" filled={isSaved(post.id)} />
                </motion.button>
            </div>
        </div>
        <div className="col-span-12 md:col-span-4">
            <Link to={`/post/${post.id}`} className="block aspect-[4/3] w-full overflow-hidden rounded-lg bg-slate-200 dark:bg-slate-700">
                <img className="h-full w-full object-cover transition-transform duration-300 hover:scale-105" src={post.imageUrl} alt={post.title} />
            </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default ArticleRow;