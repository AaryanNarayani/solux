import { motion } from 'framer-motion';

interface WaveBackgroundProps {
  isQuerying?: boolean;
  intensity?: 'low' | 'medium' | 'high';
}

const WaveBackground = ({ isQuerying = false, intensity = 'medium' }: WaveBackgroundProps) => {
  // Solana brand colors - vibrant and dynamic
  const solanaColors = [
    'rgba(0, 255, 163, 0.6)',    // Bright Solana green
    'rgba(220, 31, 255, 0.6)',   // Vibrant Solana purple  
    'rgba(0, 209, 255, 0.5)',    // Electric Solana blue
    'rgba(255, 105, 180, 0.5)',  // Hot Solana pink
    'rgba(156, 39, 255, 0.5)',   // Deep vibrant purple
    'rgba(0, 255, 200, 0.4)',    // Bright teal
    'rgba(138, 43, 226, 0.5)',   // BlueViolet
    'rgba(0, 191, 255, 0.4)',    // DeepSkyBlue
  ];

  const intensityConfig = {
    low: { lineCount: 6, opacity: 0.2, movement: 15 },
    medium: { lineCount: 10, opacity: 0.4, movement: 25 },
    high: { lineCount:15, opacity: 0.6, movement: 35 }
  };

  const config = intensityConfig[intensity];

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Diagonal flowing lines - Solana style */}
      {[...Array(config.lineCount)].map((_, i) => (
        <motion.div
          key={`diagonal-${i}`}
          className="absolute h-px origin-left"
          style={{
            background: `linear-gradient(90deg, transparent, ${solanaColors[i % solanaColors.length]}, transparent)`,
            width: '160%',
            top: `${10 + i * (80 / config.lineCount)}%`,
            left: '-30%',
            transform: `rotate(${-20 + i * 3}deg)`,
          }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ 
            scaleX: isQuerying ? [1, 1.4, 1] : 1, 
            opacity: isQuerying ? [config.opacity, config.opacity * 2, config.opacity] : config.opacity,
            x: isQuerying ? [-config.movement, config.movement, -config.movement] : 0
          }}
          transition={{ 
            scaleX: { duration: 1.8, delay: i * 0.08 },
            opacity: { duration: 1.8, delay: i * 0.08 },
            x: { 
              duration: 2.5, 
              repeat: isQuerying ? Infinity : 0, 
              ease: "easeInOut",
              repeatType: "reverse"
            }
          }}
        />
      ))}

      {/* Vertical accent lines */}
      {[...Array(Math.floor(config.lineCount * 1.5))].map((_, i) => (
        <motion.div
          key={`vertical-${i}`}
          className="absolute w-px h-full"
          style={{
            background: `linear-gradient(180deg, transparent, ${solanaColors[i % solanaColors.length]}, transparent)`,
            left: `${5 + i * (90 / Math.floor(config.lineCount * 1.5))}%`,
          }}
          initial={{ scaleY: 0, opacity: 0 }}
          animate={{ 
            scaleY: isQuerying ? [1, 1.5, 1] : 1, 
            opacity: isQuerying ? [config.opacity * 0.3, config.opacity * 1.5, config.opacity * 0.3] : config.opacity * 0.3
          }}
          transition={{ 
            duration: 2.2, 
            delay: i * 0.03,
            repeat: isQuerying ? Infinity : 0,
            ease: "easeInOut",
            repeatType: "reverse"
          }}
        />
      ))}

      {/* Flowing wave paths */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1200 800" preserveAspectRatio="none">
        <defs>
          {solanaColors.slice(0, 3).map((color, i) => (
            <linearGradient key={`gradient-${i}`} id={`waveGradient${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="50%" stopColor={color} />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          ))}
        </defs>
        
        {/* Primary flowing wave */}
        <motion.path
          fill={`url(#waveGradient0)`}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ 
            pathLength: 1, 
            opacity: isQuerying ? [0.3, 0.8, 0.3] : 0.3,
            d: [
              "M0,400 Q200,350 400,380 T800,360 T1200,340 L1200,800 L0,800 Z",
              "M0,420 Q200,370 400,400 T800,380 T1200,360 L1200,800 L0,800 Z",
              "M0,400 Q200,350 400,380 T800,360 T1200,340 L1200,800 L0,800 Z"
            ]
          }}
          transition={{ 
            pathLength: { duration: 2, ease: "easeInOut" },
            opacity: { duration: 1.5 },
            d: { 
              duration: 8, 
              repeat: Infinity, 
              ease: "easeInOut",
              repeatType: "reverse"
            }
          }}
        />
        
        {/* Secondary wave */}
        <motion.path
          fill={`url(#waveGradient1)`}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ 
            pathLength: 1, 
            opacity: isQuerying ? [0.2, 0.6, 0.2] : 0.2,
            d: [
              "M0,500 Q300,450 600,480 T1200,460 L1200,800 L0,800 Z",
              "M0,520 Q300,470 600,500 T1200,480 L1200,800 L0,800 Z",
              "M0,500 Q300,450 600,480 T1200,460 L1200,800 L0,800 Z"
            ]
          }}
          transition={{ 
            pathLength: { duration: 2.5, ease: "easeInOut" },
            opacity: { duration: 2 },
            d: { 
              duration: 10, 
              repeat: Infinity, 
              ease: "easeInOut", 
              delay: 1,
              repeatType: "reverse"
            }
          }}
        />
        
        {/* Tertiary wave */}
        <motion.path
          fill={`url(#waveGradient2)`}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ 
            pathLength: 1, 
            opacity: isQuerying ? [0.15, 0.4, 0.15] : 0.15,
            d: [
              "M0,600 Q400,550 800,580 T1200,560 L1200,800 L0,800 Z",
              "M0,620 Q400,570 800,600 T1200,580 L1200,800 L0,800 Z",
              "M0,600 Q400,550 800,580 T1200,560 L1200,800 L0,800 Z"
            ]
          }}
          transition={{ 
            pathLength: { duration: 3, ease: "easeInOut" },
            opacity: { duration: 2.5 },
            d: { 
              duration: 12, 
              repeat: Infinity, 
              ease: "easeInOut", 
              delay: 2,
              repeatType: "reverse"
            }
          }}
        />
      </svg>

      {/* Central pulse effect for querying */}
      {isQuerying && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Multiple pulsing rings */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={`pulse-${i}`}
              className="absolute rounded-full border-2"
              style={{ 
                borderColor: solanaColors[i],
                width: `${(i + 1) * 128}px`,
                height: `${(i + 1) * 128}px`
              }}
              animate={{ 
                scale: [1, 2.2 - i * 0.2, 1],
                opacity: [0.6 - i * 0.1, 0.1, 0.6 - i * 0.1]
              }}
              transition={{ 
                duration: 2 - i * 0.3, 
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.5
              }}
            />
          ))}
        </motion.div>
      )}

      {/* Particle effect */}
      {isQuerying && (
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              className="absolute w-1 h-1 rounded-full"
              style={{
                backgroundColor: solanaColors[i % solanaColors.length],
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -100, 0],
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0]
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default WaveBackground; 