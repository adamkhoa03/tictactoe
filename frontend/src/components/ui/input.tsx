import * as React from "react";
import { cn } from "@/utils/cn";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: string;
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", icon, error, ...props }, ref) => {
    return (
      <div
        className={cn(
          "relative group input-focus-glow rounded-xl border bg-surface-container-lowest transition-all duration-300",
          error ? "border-error focus-within:border-error" : "border-outline-variant",
          className
        )}
      >
        {icon && (
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant group-focus-within:text-primary transition-colors duration-300">
            {icon}
          </span>
        )}
        <input
          type={type}
          className={cn(
            "w-full bg-transparent border-none outline-none focus:ring-0 py-4 font-nunito text-body-md font-normal rounded-xl placeholder:text-outline-variant text-on-surface",
            icon ? "pl-12" : "pl-4",
            type === "password" ? "pr-12" : "pr-4"
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
