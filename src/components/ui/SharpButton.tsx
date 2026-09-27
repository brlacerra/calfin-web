import React from "react";

interface SharpButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline-gold" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
}

export const SharpButton: React.FC<SharpButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  icon,
  className = "",
  disabled,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 font-medium tracking-wide uppercase text-xs transition-all duration-150 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 select-none";

  const sizeStyles = {
    sm: "px-3 py-1.5 text-[11px]",
    md: "px-5 py-2.5 text-xs font-semibold",
    lg: "px-6 py-3 text-sm font-semibold",
  }[size];

  const variantStyles = {
    primary:
      "bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white border border-amber-600 shadow-xs hover:shadow-sm",
    secondary:
      "bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-800 border border-slate-300",
    "outline-gold":
      "bg-white hover:bg-amber-50 active:bg-amber-100 text-amber-800 border border-amber-400 font-semibold",
    ghost: "bg-transparent hover:bg-slate-100 text-slate-600 border border-transparent",
    danger: "bg-rose-600 hover:bg-rose-700 text-white border border-rose-600",
  }[variant];

  return (
    <button
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      style={{ borderRadius: "0px" }}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
};
