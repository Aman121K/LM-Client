import { useEffect, useRef } from 'react';

export const usePerformanceMonitor = (componentName) => {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(performance.now());

  useEffect(() => {
    renderCount.current += 1;
    const currentTime = performance.now();
    const timeSinceLastRender = currentTime - lastRenderTime.current;
    
    console.log(`[${componentName}] Render #${renderCount.current} - Time since last render: ${timeSinceLastRender.toFixed(2)}ms`);
    
    lastRenderTime.current = currentTime;
  });

  const logPerformance = (operation, duration) => {
    console.log(`[${componentName}] ${operation}: ${duration.toFixed(2)}ms`);
  };

  return { logPerformance, renderCount: renderCount.current };
};
