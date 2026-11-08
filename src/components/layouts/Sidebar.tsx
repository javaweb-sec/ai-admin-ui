import React, { ReactNode } from "react";

interface SidebarProps {
  children: ReactNode;
  width?: string;
  className?: string;
}

const Sidebar = ({ children, width, className = "" }: SidebarProps) => {
  return (
    <div
      className={`${width || ""} min-w-14 h-full bg-white dark:bg-[#0a0a0a] border-r border-border dark:border-white/10 flex flex-col relative transition-[width] duration-200 ease-out overflow-hidden ${className}`}
      style={{ width: width ? undefined : "auto", willChange: "width" }}
    >
      {children}
    </div>
  );
};

export default Sidebar;
