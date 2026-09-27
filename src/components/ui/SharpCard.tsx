import React from "react";

interface SharpCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  highlightGold?: boolean;
}

export const SharpCard: React.FC<SharpCardProps> = ({
  children,
  className = "",
  highlightGold = false,
  ...props
}) => {
  return (
    <div
      className={`bg-white border ${
        highlightGold ? "border-amber-400 border-t-2 border-t-amber-500 shadow-sm" : "border-slate-200 shadow-xs"
      } p-6 transition-all duration-150 ${className}`}
      style={{ borderRadius: "0px" }}
      {...props}
    >
      {children}
    </div>
  );
};
