import React, { useState, useEffect, useRef } from 'react';

interface EnhancedTypingEffectProps {
  text: string;
  typingSpeed?: number; // milliseconds per character
  initialDelay?: number; // milliseconds before starting to type
  className?: string;
}

const EnhancedTypingEffect: React.FC<EnhancedTypingEffectProps> = ({ 
  text, 
  typingSpeed = 25, 
  initialDelay = 200,
  className = ''
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startTyping, setStartTyping] = useState(false);
  const prefersReducedMotion = useRef<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Check if user prefers reduced motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotion.current = mediaQuery.matches;
    
    const handleChange = () => {
      prefersReducedMotion.current = mediaQuery.matches;
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Initial delay before starting to type
  useEffect(() => {
    const timer = setTimeout(() => {
      setStartTyping(true);
    }, initialDelay);

    return () => clearTimeout(timer);
  }, [initialDelay]);

  // Reset when text changes completely
  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
    setStartTyping(false);
    
    // Reset the initial delay when text changes
    const timer = setTimeout(() => {
      setStartTyping(true);
    }, initialDelay);
    
    return () => clearTimeout(timer);
  }, [text, initialDelay]);

  // Typing effect with variable speed based on punctuation
  useEffect(() => {
    if (!startTyping) return;
    
    // If user prefers reduced motion, show the entire text immediately
    if (prefersReducedMotion.current) {
      setDisplayedText(text);
      setCurrentIndex(text.length);
      return;
    }
    
    if (currentIndex < text.length) {
      // Adjust typing speed based on punctuation
      let currentSpeed = typingSpeed;
      const currentChar = text[currentIndex];
      
      // Slow down at punctuation for more natural rhythm
      if (['.', '!', '?', ',', ';', ':'].includes(currentChar)) {
        currentSpeed = typingSpeed * 3; // Pause longer at punctuation
      }
      
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prevIndex => prevIndex + 1);
      }, currentSpeed);
      
      return () => clearTimeout(timer);
    }
  }, [currentIndex, text, typingSpeed, startTyping]);

  // Apply subtle highlight to newly typed text
  useEffect(() => {
    if (containerRef.current && currentIndex > 0) {
      const lastChar = containerRef.current.querySelector('.latest-char');
      if (lastChar) {
        lastChar.classList.add('highlight-new');
        setTimeout(() => {
          lastChar.classList.remove('highlight-new');
        }, 300);
      }
    }
  }, [displayedText]);

  // Format text with spans for each character to enable highlighting
  const formattedText = displayedText.split('').map((char, index) => {
    const isLatest = index === displayedText.length - 1;
    return (
      <span 
        key={index} 
        className={isLatest ? 'latest-char' : ''}
      >
        {char}
      </span>
    );
  });

  return (
    <div 
      ref={containerRef}
      className={`typing-effect-container ${className}`}
    >
      {formattedText}
      {currentIndex < text.length && !prefersReducedMotion.current && (
        <span
          className="inline-block w-2 h-5 bg-current opacity-75 animate-cursor-blink ml-0.5 align-middle"
          aria-hidden="true"
        ></span>
      )}
      
      {/* Add styles for the typing effect */}
      <style jsx>{`
        .highlight-new {
          opacity: 0.7;
          animation: fadeToNormal 0.3s forwards;
        }
        
        @keyframes fadeToNormal {
          from { opacity: 0.7; }
          to { opacity: 1; }
        }
        
        .typing-effect-container {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 1.05rem;
          line-height: 1.6;
          letter-spacing: -0.01em;
        }
        
        @keyframes cursorBlink {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
        
        .animate-cursor-blink {
          animation: cursorBlink 0.8s infinite;
        }
      `}</style>
    </div>
  );
};

export default EnhancedTypingEffect;