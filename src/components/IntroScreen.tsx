import React, { useEffect } from 'react';
import { motion } from 'motion/react';

interface IntroScreenProps {
  onComplete: () => void;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({ onComplete }) => {
  useEffect(() => {
    // Automatically hide intro after 5.5 seconds (gives time to read the quote)
    const timer = setTimeout(() => {
      onComplete();
    }, 5500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      key="intro-screen"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 1.4, ease: 'easeInOut' } }}
      className="absolute inset-0 z-50 flex items-center justify-center p-6 sm:p-12 pointer-events-none"
    >
      {/* Subtle vignette shadow to focus the text */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0e0907]/50 via-transparent to-[#0e0907]/50" />

      {/* Initial 3D reveal container */}
      <motion.div
        initial={{ opacity: 0, y: 35, rotateX: 25, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
        transition={{ duration: 2.0, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto"
        style={{ perspective: '1200px' }}
      >
        {/* Gentle continuous bobbing animation for a true 3D floating effect */}
        <motion.div
          animate={{ y: [-4, 4, -4] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="flex flex-col items-center"
        >
          <h1 className="font-serif text-2xl sm:text-3xl md:text-5xl font-semibold leading-relaxed sm:leading-tight text-[#dcb881] drop-shadow-[0_8px_16px_rgba(40,15,5,0.7)] mb-5 sm:mb-8 tracking-wide">
            "Keep your face always toward the sunshine—and shadows will fall behind you."
          </h1>
          
          <motion.div
            initial={{ opacity: 0, filter: 'blur(5px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 1.8, delay: 1.4, ease: "easeOut" }}
            className="font-serif italic text-sm sm:text-xl tracking-[0.25em] text-[#a57849]"
          >
            — Walt Whitman
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};