import React from "react";

export default function Button({
  children,
  onClick,
  variant = "default",
  className = "",
  type = "button",
}) {
  const baseStyle = {
    borderRadius: "9999px",
    padding: "0.5rem 1.5rem",
    fontWeight: 600,
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    cursor: "pointer",
    transition: "all 0.2s ease-in-out",
    fontSize: "0.95rem",
  };

  const variants = {
    default: {
      backgroundColor: "#00ffaa",
      color: "#000",
      border: "none",
      boxShadow: "0 0 10px #00ffaa55",
    },
    outline: {
      backgroundColor: "transparent",
      color: "#00ffaa",
      border: "2px solid #00ffaa",
    },
    ghost: {
      backgroundColor: "transparent",
      color: "#00ffaa",
      border: "none",
    },
  };

  const style = { ...baseStyle, ...variants[variant] };

  return (
    <button type={type} onClick={onClick} style={style} className={className}>
      {children}
    </button>
  );
}
