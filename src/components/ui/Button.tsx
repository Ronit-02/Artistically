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
    "inline-flex min-h-11 items-center justify-center gap-2 font-medium transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-200 disabled:cursor-not-allowed disabled:opacity-50 select-none";
  const sizes = {
    sm: "px-4 py-2 text-[13px] rounded-lg",
    md: "px-5 py-2.5 text-sm rounded-xl",
    lg: "px-7 py-3.5 text-sm rounded-xl",
  };
  const variants = {
    primary:
      "bg-gray-900 text-white enabled:hover:bg-[var(--color-action-primary-hover)] enabled:active:bg-[var(--color-action-primary-pressed)] border-none shadow-sm",
    secondary:
      "bg-white text-gray-700 border border-gray-200 enabled:hover:border-[var(--color-border-strong)] enabled:hover:bg-[var(--color-surface-muted)] enabled:active:bg-[var(--color-surface)] shadow-sm",
    ghost:
      "bg-transparent text-gray-500 enabled:hover:text-[var(--color-text-heading)] enabled:hover:bg-[var(--color-surface-muted)] enabled:active:bg-[var(--color-surface)] border-none",
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
