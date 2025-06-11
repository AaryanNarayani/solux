import { motion } from 'framer-motion';
import Header from './Header';
import Footer from './Footer';
import Breadcrumbs from './Breadcrumbs';
import type { BreadcrumbItem } from '../../types';

export interface DetailPageLayoutProps {
  children: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  title?: string;
  subtitle?: string;
  badges?: React.ReactNode[];
  className?: string;
}

const DetailPageLayout = ({ 
  children, 
  breadcrumbs,
  title,
  subtitle,
  badges,
  className = ''
}: DetailPageLayoutProps) => {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      <main className={`pt-28 pb-20 ${className}`}>
        <div className="max-w-7xl mx-auto px-6">
          {/* Breadcrumbs */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Breadcrumbs items={breadcrumbs} />
            </motion.div>
          )}

          {/* Page Header */}
          {(title || subtitle || badges) && (
            <motion.div
              className="mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="flex flex-wrap items-center gap-4 mb-4">
                {title && (
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-light bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
                    {title}
                  </h1>
                )}
                
                {badges && badges.length > 0 && (
                  <div className="flex flex-wrap gap-2 items-center">
                    {badges.map((badge, index) => (
                      <div key={index}>{badge}</div>
                    ))}
                  </div>
                )}
              </div>
              
              {subtitle && (
                <p className="text-lg text-gray-400 max-w-3xl">
                  {subtitle}
                </p>
              )}
            </motion.div>
          )}

          {/* Page Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {children}
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DetailPageLayout; 