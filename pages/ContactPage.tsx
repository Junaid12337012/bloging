import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MailIcon, PhoneIcon, MapPinIcon, Loader2Icon } from '../components/icons';
import { useData } from '../hooks/useData';
import { useToast } from '../hooks/useToast';

const pageVariants = {
  initial: { opacity: 0, y: 50 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -50 },
};

const ContactPage: React.FC = () => {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { addContactMessage } = useData();
    const toast = useToast();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        setTimeout(() => {
            addContactMessage({
                name: formData.name,
                email: formData.email,
                message: formData.message,
            });
            setIsSubmitting(false);
            setFormData({ name: '', email: '', message: '' });
            toast.success("Thank you! Your message has been sent.");
        }, 1000);
    };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="in"
      exit="out"
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-16">
        <h1 className="text-5xl md:text-6xl font-bold font-serif text-slate-900 dark:text-white">Contact Us</h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-500 dark:text-slate-400">
          Have a question or want to work with us? Drop us a line.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white dark:bg-slate-800 p-8 sm:p-12 rounded-2xl shadow-lg">
        {/* Contact Info */}
        <div className="space-y-8">
            <h2 className="text-3xl font-bold font-serif">Get in Touch</h2>
            <p className="text-slate-500 dark:text-slate-400">
                We're here to help and answer any question you might have. We look forward to hearing from you.
            </p>
            <div className="space-y-4">
                <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 p-3 bg-primary-100 dark:bg-primary-900/50 rounded-full">
                        <MapPinIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold">Our Office</h3>
                        <p className="text-slate-500 dark:text-slate-400">123 Inkwell Lane, Storyville, USA 12345</p>
                    </div>
                </div>
                <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 p-3 bg-primary-100 dark:bg-primary-900/50 rounded-full">
                        <MailIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold">Email Us</h3>
                        <p className="text-slate-500 dark:text-slate-400">hello@inkwell.com</p>
                    </div>
                </div>
                <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 p-3 bg-primary-100 dark:bg-primary-900/50 rounded-full">
                        <PhoneIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold">Call Us</h3>
                        <p className="text-slate-500 dark:text-slate-400">(123) 456-7890</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Contact Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="name" className="sr-only">Name</label>
                <input type="text" name="name" id="name" required placeholder="Your Name" value={formData.name} onChange={handleChange} className="block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-slate-100 dark:bg-slate-700 sm:text-sm p-3" />
            </div>
             <div>
                <label htmlFor="email" className="sr-only">Email</label>
                <input type="email" name="email" id="email" required placeholder="Your Email" value={formData.email} onChange={handleChange} className="block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-slate-100 dark:bg-slate-700 sm:text-sm p-3" />
            </div>
             <div>
                <label htmlFor="message" className="sr-only">Message</label>
                <textarea name="message" id="message" rows={5} required placeholder="Your Message" value={formData.message} onChange={handleChange} className="block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-slate-100 dark:bg-slate-700 sm:text-sm p-3"></textarea>
            </div>
            <div>
                <button type="submit" disabled={isSubmitting} className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all disabled:bg-slate-400">
                    {isSubmitting ? <Loader2Icon className="w-5 h-5 animate-spin" /> : 'Send Message'}
                </button>
            </div>
        </form>
      </div>
    </motion.div>
  );
};

export default ContactPage;