import * as React from "react";
import { cn } from "@/utils/cn";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "error" | "success" | "warning";
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "error", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          "flex gap-3 p-4 rounded-xl text-left font-nunito text-[14px] leading-relaxed border transition-all duration-300",
          variant === "error" && "bg-error-container/80 text-error border-error/20",
          variant === "success" && "bg-tertiary-fixed/80 text-tertiary border-tertiary/20",
          variant === "warning" && "bg-secondary-fixed/80 text-on-secondary-fixed-variant border-secondary-fixed-dim/20",
          className
        )}
        {...props}
      >
        <span className="material-symbols-outlined shrink-0 select-none">
          {variant === "error" && "error"}
          {variant === "success" && "check_circle"}
          {variant === "warning" && "warning"}
        </span>
        <div className="flex-grow">{children}</div>
      </div>
    );
  }
);
Alert.displayName = "Alert";

export { Alert };
