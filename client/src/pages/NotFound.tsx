import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import DetailPageLayout from '../components/layout/DetailPageLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const NotFound = () => {
  return (
    <DetailPageLayout>
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="p-12 text-center max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-8xl mb-6">🔍</div>
            
            <motion.h1
              className="text-4xl md:text-5xl font-light mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-green-400"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              404 - Not Found
            </motion.h1>
            
            <motion.p
              className="text-xl text-gray-400 mb-8 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              The page you're looking for doesn't exist on the blockchain.
              <br />
              It might have been moved, deleted, or you entered the wrong URL.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Link to="/">
                <Button variant="primary" size="lg" className="w-full sm:w-auto">
                  Back to Home
                </Button>
              </Link>
              
              <Link to="/search?q=">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  Search Blockchain
                </Button>
              </Link>
            </motion.div>

            <motion.div
              className="mt-12 pt-8 border-t border-white/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <h3 className="text-lg font-medium text-white mb-4">
                Popular Searches
              </h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  'Latest Block',
                  'Recent Transactions',
                  'Token Transfers',
                  'NFT Activity'
                ].map((item, index) => (
                  <motion.button
                    key={item}
                    className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-purple-500/30 transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                  >
                    {item}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </Card>
      </div>
    </DetailPageLayout>
  );
};

export default NotFound; 