import React from 'react';
import { motion } from 'framer-motion';
import { GalleryHorizontalEndIcon } from '../components/icons';
import VisionWeaver from '../components/VisionWeaver';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 },
};

const VisionWeaverPage: React.FC = () => {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="in"
      exit="out"
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    >
      <div className="text-center mb-12">
         <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 dark:bg-primary-900/50 mb-4">
            <GalleryHorizontalEndIcon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
        </div>
        <h1 className="text-4xl font-bold font-serif text-slate-900 dark:text-white sm:text-5xl">
          Vision Weaver
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-500 dark:text-slate-400">
          Transform your stories into a visual masterpiece. Describe a scene or a story, and let AI create a stunning four-panel storyboard.
        </p>
      </div>

      <VisionWeaver />
      
    </motion.div>
  );
};

export default VisionWeaverPage;
