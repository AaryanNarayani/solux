import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { BreadcrumbItem } from '../../types';

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

const Breadcrumbs = ({ items, className = '' }: BreadcrumbsProps) => {
  return (
    <nav className={`flex items-center space-x-2 text-sm ${className}`}>
      {items.map((item, index) => (
        <motion.div
          key={index}
          className="flex items-center space-x-2"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          {index > 0 && (
            <svg
              className="w-4 h-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          )}

          {item.href ? (
            <Link
              to={item.href}
              className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors duration-200"
            >
              {item.icon && (
                <span className="w-4 h-4">
                  {item.icon}
                </span>
              )}
              <span>{item.label}</span>
            </Link>
          ) : (
            <span className="flex items-center space-x-1 text-gray-300">
              {item.icon && (
                <span className="w-4 h-4">
                  {item.icon}
                </span>
              )}
              <span>{item.label}</span>
            </span>
          )}
        </motion.div>
      ))}
    </nav>
  );
};

export default Breadcrumbs; 