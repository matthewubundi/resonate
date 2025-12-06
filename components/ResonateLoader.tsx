import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

interface ResonateLoaderProps {
    onComplete?: () => void;
    className?: string;
}

export const ResonateLoader: React.FC<ResonateLoaderProps> = ({ onComplete, className = '' }) => {
    // Lock body scroll when component is mounted
    useEffect(() => {
        document.body.style.overflow = 'hidden';

        // If onComplete is provided, we might want to trigger it after some time?
        // The previous implementation had a 3s timer.
        // If the integration controls the unmounting, then this effect cleanup handles the scroll unlock.
        // If this component is responsible for timing out, we should add that logic here.
        // Assuming the parent controls visibility mostly, but for the 'loading' view in App.tsx, it had a self-contained timer.

        if (onComplete) {
            const timer = setTimeout(() => {
                onComplete();
            }, 3000); // Keep the approx 3s duration from the original implementation
            return () => clearTimeout(timer);
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [onComplete]);

    // Ripple configuration
    const ripples = [0, 1, 2];

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-paper via-[#F8FAFC] to-paleslate ${className}`}>
            <div className="relative flex items-center justify-center">

                {/* Ripples */}
                {ripples.map((index) => (
                    <motion.div
                        key={index}
                        className="absolute rounded-full border border-azure/30 bg-azure/5"
                        initial={{ width: '80px', height: '80px', opacity: 0.8, scale: 0.8 }}
                        animate={{
                            width: '300px',
                            height: '300px',
                            opacity: 0,
                            scale: 2.5
                        }}
                        transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            delay: index * 0.8,
                            ease: "easeOut",
                        }}
                    />
                ))}

                {/* Logo Container with Pulse */}
                <motion.div
                    className="relative z-10 w-24 h-24 flex items-center justify-center bg-white rounded-full shadow-lg p-4"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    {/* Logo Image */}
                    <div className="relative w-full h-full overflow-hidden">
                        <img
                            src="/Resonate-Logo.png"
                            alt="Resonate Logo"
                            className="w-full h-full object-contain"
                        />

                        {/* Scanning Shimmer Effect */}
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent"
                            style={{ skewX: -20 }}
                            initial={{ x: '-150%' }}
                            animate={{ x: '150%' }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                repeatDelay: 0.5,
                                ease: "linear"
                            }}
                        />
                    </div>
                </motion.div>

                {/* Text/Loading Status (Optional, kept minimal for 'calm' feel) */}
                <motion.div
                    className="absolute -bottom-16 text-azure font-medium tracking-[0.2em] text-sm uppercase"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: [0.5, 1, 0.5], y: 0 }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    Resonating Identity
                </motion.div>

            </div>
        </div>
    );
};
