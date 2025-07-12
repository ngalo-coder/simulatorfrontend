import React, { useState, useEffect, useRef } from 'react';

interface TypingEffectProps {
  text: string;
  typingSpeed?: number; // milliseconds per character
  initialDelay?: number; // milliseconds before starting to type
}

const TypingEffect: React.FC<TypingEffectProps> = ({ 
  text, 
  typingSpeed = 30, 
  initialDelay = 300 
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startTyping, setStartTyping] = useState(false);
  const prefersReducedMotion = useRef<boolean>(false);
  
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

  // Typing effect
  useEffect(() => {
    if (!startTyping) return;
    
    // If user prefers reduced motion, show the entire text immediately
    if (prefersReducedMotion.current) {
      setDisplayedText(text);
      setCurrentIndex(text.length);
      return;
    }
    
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prevIndex => prevIndex + 1);
      }, typingSpeed);
      
      return () => clearTimeout(timer);
    }
  }, [currentIndex, text, typingSpeed, startTyping]);

  return (
    <span className="whitespace-pre-wrap">
      {displayedText}
      {currentIndex < text.length && !prefersReducedMotion.current && (
        <span
          className="inline-block w-2 h-4 bg-current opacity-75 animate-blink ml-0.5"
          aria-hidden="true"
        ></span>
      )}
    </span>
  );
};

export default TypingEffect;