import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  children: ReactNode;
  fullWidth?: boolean;
  loading?: boolean;
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button({
  variant = "primary",
  children,
  fullWidth,
  loading = false,
  disabled = false,
  className = "",
  type = "button",
  size = "md",
  ...nativeProps
}, ref) {
  const base =
    "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-200 disabled:cursor-not-allowed disabled:opacity-50 select-none";
  const sizes = {
    sm: "px-4 py-2 text-[13px] rounded-lg",
    md: "px-5 py-2.5 text-sm rounded-xl",
    lg: "px-7 py-3.5 text-sm rounded-xl",
  };
  const variants = {
    primary:
      "bg-gray-900 text-white hover:bg-gray-800 active:bg-gray-950 border-none shadow-sm",
    secondary:
      "bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 active:bg-gray-100 shadow-sm",
    ghost:
      "bg-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50 active:bg-gray-100 border-none",
  };
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`${base} ${sizes[size]} ${variants[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...nativeProps}
    >
      {loading && <span className="sr-only">Loading: </span>}
      {children}
    </button>
  );
});

Button.displayName = "Button";

export default Button;
