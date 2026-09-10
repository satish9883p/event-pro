import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/common/Button';

export const NotFound = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />

      <div className="flex items-center justify-center py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="text-6xl mb-4">404</div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Page Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
            Sorry, the page you're looking for doesn't exist.
          </p>
          <Link to="/">
            <Button size="lg">Go Home</Button>
          </Link>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};
