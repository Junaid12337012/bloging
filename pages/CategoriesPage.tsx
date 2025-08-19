
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useData } from '../hooks/useData';
import { Post } from '../types';
import { ArrowRightIcon } from '../components/icons';

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
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

const StaffPickCard: React.FC<{ post: Post }> = ({ post }) => (
    <div className="group">
        <div className="flex items-center space-x-2 mb-2">
            <img src={post.author.avatarUrl} alt={post.author.name} className="w-6 h-6 rounded-full"/>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{post.author.name}</p>
        </div>
        <Link to={`/post/${post.id}`}>
            <h3 className="font-semibold font-serif text-base leading-tight group-hover:underline">{post.title}</h3>
        </Link>
    </div>
)

const CategoriesPage: React.FC = () => {
  const { publishedPosts: posts, categories } = useData();
  
  const getPostCountForCategory = (categoryId: string) => {
    return posts.filter(post => post.category.id === categoryId).length;
  };

  const staffPicks = posts.filter(p => p.featured).slice(0, 4);

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="in"
      exit="out"
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    >
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold font-serif text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
          Explore Topics
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-500 dark:text-slate-400">
          A world of ideas, curated for you. Find articles on topics that fascinate you the most.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main categories list */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-2 space-y-4"
        >
          {categories.map(category => {
            const postCount = getPostCountForCategory(category.id);
            return (
              <motion.div key={category.id} variants={itemVariants}>
                <Link
                  to={`/category/${category.id}`}
                  className="group flex items-center p-4 rounded-xl bg-white dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm hover:shadow-md transition-all duration-300"
                >
                    <div className="flex-shrink-0 h-20 w-20 rounded-lg mr-6 overflow-hidden">
                        <img 
                            src={category.imageUrl} 
                            alt={category.name} 
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                            {category.name}
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                            {category.description}
                        </p>
                    </div>
                    <div className="text-right ml-4 flex-shrink-0">
                         <p className="text-lg font-bold text-slate-800 dark:text-slate-200">{postCount}</p>
                         <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">{postCount === 1 ? 'Article' : 'Articles'}</p>
                    </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Sidebar */}
        <aside className="lg:col-span-1">
            <div className="sticky top-24 p-6 rounded-2xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/50">
                <h2 className="text-lg font-bold font-serif text-slate-900 dark:text-white mb-6">Staff Picks</h2>
                <div className="space-y-6">
                    {staffPicks.map(post => (
                       <StaffPickCard key={post.id} post={post} />
                    ))}
                </div>
                 <Link to="/" className="group flex items-center justify-center mt-8 text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline">
                    Explore all articles
                    <ArrowRightIcon className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                </Link>
            </div>
        </aside>
      </div>
    </motion.div>
  );
};

export default CategoriesPage;
