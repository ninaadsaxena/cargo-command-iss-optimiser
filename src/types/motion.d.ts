
declare module 'motion/react' {
  import * as React from 'react';

  export interface MotionProps {
    initial?: Record<string, any>;
    animate?: Record<string, any>;
    transition?: Record<string, any>;
    className?: string;
    key?: string | number;
    children?: React.ReactNode;
    [key: string]: any;
  }

  export const motion: {
    div: React.ForwardRefExoticComponent<MotionProps & React.RefAttributes<HTMLDivElement>>;
    span: React.ForwardRefExoticComponent<MotionProps & React.RefAttributes<HTMLSpanElement>>;
    // Add more HTML elements as needed
  };
}
