import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useData } from '../hooks/useData';
import ArticleRow from '../components/ArticleRow';

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

const AuthorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { authors, publishedPosts } = useData();

  const author = authors.find(a => a.id === id);
  const authorPosts = publishedPosts.filter(p => p.author.id === id);

  if (!author) {
    return (
      <div className="text-center py-20">
        <h1 className="text-4xl font-bold font-serif text-slate-900 dark:text-white">Author Not Found</h1>
        <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">The author you're looking for doesn't exist.</p>
        <Link to="/" className="mt-6 inline-block text-primary-600 dark:text-primary-400 hover:underline font-semibold">
          Go back home
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="in"
      exit="out"
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="max-w-4xl mx-auto"
    >
      {/* Author Header */}
      <header className="flex flex-col sm:flex-row items-center gap-8 text-center sm:text-left border-b border-slate-200 dark:border-slate-700 pb-12 mb-12">
        <img src={author.avatarUrl} alt={author.name} className="w-32 h-32 rounded-full shadow-lg flex-shrink-0" />
        <div className="flex-1">
          <h1 className="text-4xl md:text-5xl font-bold font-serif text-slate-900 dark:text-white">{author.name}</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300 max-w-xl mx-auto sm:mx-0">{author.bio}</p>
        </div>
      </header>

      {/* Author Posts */}
      <h2 className="text-3xl font-bold font-serif text-slate-900 dark:text-white mb-8">Stories by {author.name}</h2>
      
      {authorPosts.length > 0 ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-12 divide-y divide-slate-200 dark:divide-slate-700"
        >
          {authorPosts.map((post, index) => (
            <div key={post.id} className={index > 0 ? 'pt-12' : ''}>
              <ArticleRow post={post} />
            </div>
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-16">
          <p className="text-slate-500 dark:text-slate-400 text-lg">{author.name} hasn't published any stories yet.</p>
        </div>
      )}
    </motion.div>
  );
};

export default AuthorPage;