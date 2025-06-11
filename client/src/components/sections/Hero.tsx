import { motion } from 'framer-motion';
import { useState } from 'react';
import SearchBar from '../ui/SearchBar';
import WaveBackground from '../animations/WaveBackground';

const Hero = () => {
  const [isQuerying, setIsQuerying] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleSearch = (query: string) => {
    setIsQuerying(true);
    console.log('Searching for:', query);
    
    // Simulate search
    setTimeout(() => {
      setIsQuerying(false);
      // Here you would typically navigate to search results or handle the search
    }, 3000);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  };

  return (
    <section 
      className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-20 overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Animated Wave Background */}
      <WaveBackground isQuerying={isQuerying} intensity="medium" />
      
      {/* Subtle mouse-following gradient */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-10 -z-5"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, rgba(220, 31, 255, 0.05), transparent 50%)`
        }}
      />

      <div className="text-center max-w-5xl mx-auto space-y-16 relative z-10 flex-1 flex flex-col justify-center">
        {/* Main Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-light leading-tight tracking-tight mb-8">
            Explore with{' '}
            <span 
              className="bg-clip-text text-transparent font-normal"
              style={{ 
                background: 'linear-gradient(135deg, #DC1FFF 0%, #00FFA3 50%, #00D1FF 100%)',
                WebkitBackgroundClip: 'text'
              }}
            >
              Solux
            </span>
          </h1>

          {/* Subtitle */}
          <motion.p
            className="text-lg md:text-xl lg:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed font-light"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Explore the Solana blockchain with unparalleled clarity.
            <br className="hidden md:block" />
            Fast, intuitive, and beautifully designed.
          </motion.p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <SearchBar 
            onSearch={handleSearch}
            autoFocus={true}
            isQuerying={isQuerying}
          />
        </motion.div>

        {/* Feature highlights */}
        {/* <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          {[
            {
              icon: '⚡',
              title: 'Lightning Fast',
              description: 'Instant search results powered by optimized indexing'
            },
            {
              icon: '🔍',
              title: 'Deep Insights',
              description: 'Comprehensive transaction and account analysis'
            },
            {
              icon: '🎯',
              title: 'Developer First',
              description: 'Built with developers in mind, for developers'
            }
          ].map((feature) => (
            <motion.div
              key={feature.title}
              className="text-center group"
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-lg font-medium text-white mb-3">{feature.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div> */}
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.2 }}
        onClick={() => {
          const nextSection = document.querySelector('#network-stats');
          if (nextSection) {
            nextSection.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      >
        <motion.div
          className="w-5 h-8 border rounded-full flex justify-center relative overflow-hidden"
          style={{ borderColor: 'rgba(107, 114, 128, 0.6)' }}
          animate={{ 
            borderColor: [
              'rgba(107, 114, 128, 0.6)', 
              'rgba(220, 31, 255, 0.8)', 
              'rgba(0, 255, 163, 0.8)', 
              'rgba(107, 114, 128, 0.6)'
            ]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          whileHover={{ scale: 1.1 }}
        >
          <motion.div
            className="w-0.5 h-2 rounded-full mt-1.5"
            style={{ 
              background: 'linear-gradient(180deg, #DC1FFF, #00FFA3)' 
            }}
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero; 