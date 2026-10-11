import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

export interface GiltEdgeGlowProps {
  isDragging: boolean;
  dragProgress: number; // 0 to 1
  dragDirection: 'next' | 'prev';
  bookWidth: number;
  bookHeight: number;
  isPortrait: boolean;
}

export const GiltEdgeGlow: React.FC<GiltEdgeGlowProps> = ({
  isDragging,
  dragProgress,
  dragDirection,
  bookWidth,
  bookHeight,
  isPortrait,
}) => {
  // Normalize drag progress between 0.15 and 1.0 for dynamic intensity
  const intensity = Math.min(Math.max(dragProgress, 0.1), 1.0);

  // Dynamic glow values synced with drag progress via Framer Motion
  const glowRadius = Math.round(10 + intensity * 26);
  const glowSpread = Math.round(3 + intensity * 10);
  const foilWidth = 2.5 + intensity * 1.5;
  const washWidth = Math.round(16 + intensity * 32);

  // In portrait mode, the active outer edge is on the right
  const showRight = isPortrait || dragDirection === 'next';
  const showLeft = !isPortrait && dragDirection === 'prev';

  return (
    <AnimatePresence>
      {isDragging && (
        <motion.div
          key="gilt-edge-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.35, ease: 'easeOut' } }}
          className="absolute inset-0 pointer-events-none z-30 overflow-visible"
          style={{
            width: `${bookWidth}px`,
            height: `${bookHeight}px`,
          }}
        >
          {/* ========================================================= */}
          {/* RIGHT OUTER GILT EDGE (Turning Forward)                   */}
          {/* ========================================================= */}
          {showRight && (
            <motion.div
              key="right-gilt-edge"
              initial={{ opacity: 0, x: 4 }}
              animate={{
                opacity: 0.4 + intensity * 0.6,
                x: 0,
              }}
              exit={{ opacity: 0, x: 2, transition: { duration: 0.28 } }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="absolute top-0 bottom-0 right-0 flex items-center justify-end"
              style={{
                width: `${washWidth}px`,
              }}
            >
              {/* Soft Ambient Gold Wash Bleeding Inwards onto paper margin */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                animate={{
                  opacity: 0.3 + intensity * 0.6,
                }}
                transition={{ duration: 0.15 }}
                style={{
                  background:
                    'linear-gradient(to left, rgba(234, 185, 84, 0.45) 0%, rgba(212, 160, 50, 0.22) 40%, rgba(180, 130, 30, 0.08) 75%, transparent 100%)',
                }}
              />

              {/* Luminous Outer Gold Aura Bloom */}
              <motion.div
                className="absolute right-0 top-0 bottom-0 pointer-events-none rounded-r-xs"
                animate={{
                  boxShadow: `0 0 ${glowRadius}px ${glowSpread}px rgba(245, 197, 85, ${0.45 + intensity * 0.45}), 0 0 ${glowRadius * 1.8}px rgba(212, 160, 50, ${0.25 + intensity * 0.35})`,
                }}
                transition={{ duration: 0.12 }}
                style={{
                  width: `${foilWidth}px`,
                }}
              />

              {/* Burnished 24K Gold Foil Metallic Gilt Rim */}
              <motion.div
                className="relative h-full pointer-events-none overflow-hidden rounded-r-xs"
                animate={{
                  width: `${foilWidth}px`,
                }}
                transition={{ duration: 0.12 }}
                style={{
                  background:
                    'linear-gradient(to bottom, #d4a044 0%, #fff0b3 15%, #c5933a 35%, #ffd97d 50%, #b8832a 68%, #fff0b3 85%, #d4a044 100%)',
                }}
              >
                {/* Moving Metallic Specular Sheen Animation */}
                <motion.div
                  className="absolute inset-0 w-full pointer-events-none"
                  animate={{
                    y: ['-100%', '100%'],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.8 - intensity * 0.6,
                    ease: 'linear',
                  }}
                  style={{
                    height: '200%',
                    background:
                      'linear-gradient(to bottom, transparent 0%, rgba(255, 255, 255, 0.8) 50%, transparent 100%)',
                  }}
                />
              </motion.div>

              {/* Dynamic Sparkle Accents along Gilt Rim */}
              {intensity > 0.2 && (
                <>
                  <motion.div
                    className="absolute right-[-2px] top-[22%] w-2 h-2 pointer-events-none rounded-full bg-[#fff4c2] shadow-[0_0_8px_#ffd700]"
                    animate={{
                      scale: [0.6, 1.2, 0.6],
                      opacity: [0.4, 0.95, 0.4],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.2,
                      ease: 'easeInOut',
                    }}
                  />
                  <motion.div
                    className="absolute right-[-2px] top-[50%] w-2.5 h-2.5 pointer-events-none rounded-full bg-[#fffdf0] shadow-[0_0_10px_#ffe066]"
                    animate={{
                      scale: [0.8, 1.4, 0.8],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.5,
                      delay: 0.3,
                      ease: 'easeInOut',
                    }}
                  />
                  <motion.div
                    className="absolute right-[-2px] top-[76%] w-2 h-2 pointer-events-none rounded-full bg-[#fff4c2] shadow-[0_0_8px_#ffd700]"
                    animate={{
                      scale: [0.6, 1.2, 0.6],
                      opacity: [0.4, 0.95, 0.4],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.3,
                      delay: 0.6,
                      ease: 'easeInOut',
                    }}
                  />
                </>
              )}
            </motion.div>
          )}

          {/* ========================================================= */}
          {/* LEFT OUTER GILT EDGE (Turning Backward)                    */}
          {/* ========================================================= */}
          {showLeft && (
            <motion.div
              key="left-gilt-edge"
              initial={{ opacity: 0, x: -4 }}
              animate={{
                opacity: 0.4 + intensity * 0.6,
                x: 0,
              }}
              exit={{ opacity: 0, x: -2, transition: { duration: 0.28 } }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="absolute top-0 bottom-0 left-0 flex items-center justify-start"
              style={{
                width: `${washWidth}px`,
              }}
            >
              {/* Soft Ambient Gold Wash Bleeding Inwards onto paper margin */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                animate={{
                  opacity: 0.3 + intensity * 0.6,
                }}
                transition={{ duration: 0.15 }}
                style={{
                  background:
                    'linear-gradient(to right, rgba(234, 185, 84, 0.45) 0%, rgba(212, 160, 50, 0.22) 40%, rgba(180, 130, 30, 0.08) 75%, transparent 100%)',
                }}
              />

              {/* Luminous Outer Gold Aura Bloom */}
              <motion.div
                className="absolute left-0 top-0 bottom-0 pointer-events-none rounded-l-xs"
                animate={{
                  boxShadow: `0 0 ${glowRadius}px ${glowSpread}px rgba(245, 197, 85, ${0.45 + intensity * 0.45}), 0 0 ${glowRadius * 1.8}px rgba(212, 160, 50, ${0.25 + intensity * 0.35})`,
                }}
                transition={{ duration: 0.12 }}
                style={{
                  width: `${foilWidth}px`,
                }}
              />

              {/* Burnished 24K Gold Foil Metallic Gilt Rim */}
              <motion.div
                className="relative h-full pointer-events-none overflow-hidden rounded-l-xs"
                animate={{
                  width: `${foilWidth}px`,
                }}
                transition={{ duration: 0.12 }}
                style={{
                  background:
                    'linear-gradient(to bottom, #d4a044 0%, #fff0b3 15%, #c5933a 35%, #ffd97d 50%, #b8832a 68%, #fff0b3 85%, #d4a044 100%)',
                }}
              >
                {/* Moving Metallic Specular Sheen Animation */}
                <motion.div
                  className="absolute inset-0 w-full pointer-events-none"
                  animate={{
                    y: ['-100%', '100%'],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.8 - intensity * 0.6,
                    ease: 'linear',
                  }}
                  style={{
                    height: '200%',
                    background:
                      'linear-gradient(to bottom, transparent 0%, rgba(255, 255, 255, 0.8) 50%, transparent 100%)',
                  }}
                />
              </motion.div>

              {/* Dynamic Sparkle Accents along Gilt Rim */}
              {intensity > 0.2 && (
                <>
                  <motion.div
                    className="absolute left-[-2px] top-[22%] w-2 h-2 pointer-events-none rounded-full bg-[#fff4c2] shadow-[0_0_8px_#ffd700]"
                    animate={{
                      scale: [0.6, 1.2, 0.6],
                      opacity: [0.4, 0.95, 0.4],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.2,
                      ease: 'easeInOut',
                    }}
                  />
                  <motion.div
                    className="absolute left-[-2px] top-[50%] w-2.5 h-2.5 pointer-events-none rounded-full bg-[#fffdf0] shadow-[0_0_10px_#ffe066]"
                    animate={{
                      scale: [0.8, 1.4, 0.8],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.5,
                      delay: 0.3,
                      ease: 'easeInOut',
                    }}
                  />
                  <motion.div
                    className="absolute left-[-2px] top-[76%] w-2 h-2 pointer-events-none rounded-full bg-[#fff4c2] shadow-[0_0_8px_#ffd700]"
                    animate={{
                      scale: [0.6, 1.2, 0.6],
                      opacity: [0.4, 0.95, 0.4],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.3,
                      delay: 0.6,
                      ease: 'easeInOut',
                    }}
                  />
                </>
              )}
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
