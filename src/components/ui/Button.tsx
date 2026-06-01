interface ButtonProps {
  variant?: "primary" | "secondary" | "ghost";
  children: React.ReactNode;
  onClick?: () => void;
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
  size?: "sm" | "md" | "lg";
}

export default function Button({
  variant = "primary",
  children,
  onClick,
  fullWidth,
  disabled,
  className = "",
  type = "button",
  size = "md",
}: ButtonProps) {
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
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${sizes[size]} ${variants[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
    >
      {children}
    </button>
  );
}
