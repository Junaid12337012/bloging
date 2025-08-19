import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import BlogPostCard from '../components/BlogPostCard';
import { useSavedPosts } from '../hooks/useSavedPosts';
import { BookmarkIcon } from '../components/icons';
import { useData } from '../hooks/useData';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const SavedPostsPage: React.FC = () => {
  const { savedPostIds } = useSavedPosts();
  const { publishedPosts: posts } = useData();
  const savedPosts = posts.filter(post => savedPostIds.includes(post.id));

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="in"
      exit="out"
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    >
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold font-serif text-slate-900 dark:text-white sm:text-5xl">
          Saved Articles
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-500 dark:text-slate-400">
          Your personal collection of articles to read later.
        </p>
      </div>

      {savedPosts.length > 0 ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-8 lg:grid-cols-3"
        >
          {savedPosts.map(post => (
            <BlogPostCard key={post.id} post={post} />
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-16 px-6 bg-white dark:bg-slate-800 rounded-lg shadow-md">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900/50">
            <BookmarkIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <h2 className="mt-5 text-2xl font-semibold font-serif text-slate-900 dark:text-white">Nothing saved yet!</h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Click the bookmark icon on any post to save it for later.
          </p>
          <div className="mt-6">
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Start Exploring
            </Link>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default SavedPostsPage;