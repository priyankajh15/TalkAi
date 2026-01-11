import { useState, useEffect } from 'react';

export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    // Cleanup: cancel the timeout if value changes before delay
    return () => clearTimeout(timer);
  }, [value, delay]);
  
  return debouncedValue;
};