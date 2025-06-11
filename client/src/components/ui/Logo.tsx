import { motion } from 'framer-motion';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showGlow?: boolean;
  className?: string;
}

const Logo = ({ size = 'md', showGlow = true, className = '' }: LogoProps) => {
  const sizeClasses = {
    sm: "w-8 h-8 text-xl",
    md: "w-10 h-10 text-2xl", 
    lg: "w-12 h-12 text-3xl",
    xl: "w-[400px] h-[400px] text-4xl"
  };

  return (
    <motion.div
      className={`flex items-center justify-center rounded-xl cursor-pointer relative overflow-hidden ${sizeClasses[size]} ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
      style={{
        background: 'linear-gradient(135deg, rgba(220, 31, 255, 0.15), rgba(0, 255, 163, 0.15))',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)'
      }}
    >
      {/* Subtle gradient overlay */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: 'linear-gradient(45deg, transparent 30%, rgba(220, 31, 255, 0.1) 50%, transparent 70%)'
        }}
      />
      
      {/* The "S" letter */}
      <motion.span 
        className={`font-bold relative z-10 ${showGlow ? 'drop-shadow-[0_0_8px_rgba(220,31,255,0.4)]' : ''}`}
        style={{ 
          background: 'linear-gradient(135deg, #DC1FFF, #00FFA3, #00D1FF)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent'
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        S
      </motion.span>
      
      {/* Subtle corner accent */}
      <div 
        className="absolute top-0 right-0 w-2 h-2 opacity-40"
        style={{
          background: 'linear-gradient(135deg, #00FFA3, transparent)',
          borderRadius: '0 0.75rem 0 0.75rem'
        }}
      />
    </motion.div>
  );
};

export default Logo; 