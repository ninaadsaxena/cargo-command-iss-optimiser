
import React from 'react';

// Simple motion implementation to avoid needing to install framer-motion
export const motion = {
  div: React.forwardRef(({ 
    initial, 
    animate, 
    transition, 
    className, 
    children, 
    ...props 
  }: any, ref: any) => {
    return (
      <div 
        ref={ref}
        className={className}
        style={{
          transition: `all ${transition?.duration || 0.3}s ease`,
          ...animate
        }}
        {...props}
      >
        {children}
      </div>
    );
  }),
  span: React.forwardRef(({ 
    initial, 
    animate, 
    transition, 
    className, 
    children, 
    ...props 
  }: any, ref: any) => {
    return (
      <span 
        ref={ref}
        className={className}
        style={{
          transition: `all ${transition?.duration || 0.3}s ease`,
          ...animate
        }}
        {...props}
      >
        {children}
      </span>
    );
  })
};
