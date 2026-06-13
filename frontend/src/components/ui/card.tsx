import * as React from "react";
import { cn } from "@/utils/cn";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> { }

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "glass-panel rounded-3xl text-center transition-all duration-500 hover:shadow-2xl",
          className
        )}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";

export { Card };
