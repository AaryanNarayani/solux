import { motion } from 'framer-motion';
import type { Feature } from '../../types';

const Features = () => {
  const features: Feature[] = [
    {
      id: 'speed',
      title: 'Lightning Fast Search',
      description: 'Optimized indexing delivers instant results. Search addresses, transactions, and blocks in milliseconds, not seconds.',
      icon: '⚡',
      gradient: 'from-purple-400/20 via-pink-400/20 to-purple-400/20'
    },
    {
      id: 'insights',
      title: 'Deep Analytics',
      description: 'Advanced transaction analysis, token flows, and account relationships. See beyond the surface with comprehensive data visualization.',
      icon: '🔍',
      gradient: 'from-teal-400/20 via-green-400/20 to-teal-400/20'
    },
    {
      id: 'developer',
      title: 'Developer First',
      description: 'API-first design with comprehensive documentation. Built by developers, for developers. Integration takes minutes, not hours.',
      icon: '👩‍💻',
      gradient: 'from-blue-400/20 via-indigo-400/20 to-blue-400/20'
    },
    {
      id: 'realtime',
      title: 'Real-time Updates',
      description: 'Live network monitoring with instant notifications. Stay connected to the blockchain with WebSocket-powered updates.',
      icon: '📡',
      gradient: 'from-orange-400/20 via-yellow-400/20 to-orange-400/20'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <section id="features" className="py-20 px-6 relative">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-white mb-6">
            Why Choose
            <span 
              className="bg-clip-text text-transparent font-normal ml-4"
              style={{ 
                background: 'linear-gradient(135deg, #DC1FFF, #00FFA3, #00D1FF)',
                WebkitBackgroundClip: 'text'
              }}
            >
              Solux
            </span>
          </h2>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Experience blockchain exploration like never before. Fast, intuitive, and built for the future of Solana.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature) => (
            <motion.div
              key={feature.id}
              className={`relative p-8 rounded-2xl backdrop-blur-xl bg-gradient-to-br ${feature.gradient} border border-white/10 group hover:border-white/20 transition-all duration-500`}
              variants={itemVariants}
              whileHover={{ 
                y: -10,
                transition: { duration: 0.3 }
              }}
            >
              {/* Background glow effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Floating particles effect */}
              <div className="absolute inset-0 overflow-hidden rounded-2xl">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-white/20 rounded-full"
                    style={{
                      left: `${20 + i * 30}%`,
                      top: `${20 + i * 20}%`,
                    }}
                    animate={{
                      y: [0, -20, 0],
                      opacity: [0.2, 0.8, 0.2],
                      scale: [1, 1.5, 1]
                    }}
                    transition={{
                      duration: 3 + i,
                      repeat: Infinity,
                      delay: i * 0.5,
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </div>

              <div className="relative z-10">
                {/* Icon */}
                <motion.div
                  className="text-4xl mb-6 inline-block"
                  whileHover={{ 
                    scale: 1.2,
                    rotate: [0, -10, 10, 0],
                    transition: { duration: 0.5 }
                  }}
                >
                  {feature.icon}
                </motion.div>

                {/* Title */}
                <h3 className="text-2xl md:text-3xl font-medium text-white mb-4 leading-tight">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-gray-400 leading-relaxed text-lg">
                  {feature.description}
                </p>

                {/* Interactive element */}
                <motion.div
                  className="mt-6 inline-flex items-center space-x-2 text-sm text-white/70 group-hover:text-white transition-colors duration-300"
                  whileHover={{ x: 5 }}
                >
                  <span>Learn more</span>
                  <motion.svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    whileHover={{ x: 3 }}
                    transition={{ duration: 0.2 }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </motion.svg>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="text-white/80">
              Ready to experience the future of blockchain exploration?
            </div>
            <motion.button
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-teal-400 text-black font-semibold rounded-lg hover:from-purple-400 hover:to-teal-300 transition-all duration-300"
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 0 30px rgba(220, 31, 255, 0.3)"
              }}
              whileTap={{ scale: 0.95 }}
            >
              Start Exploring
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Features; 