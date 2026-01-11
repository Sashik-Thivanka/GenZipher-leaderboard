import { ComponentProps } from "react";
import clsx from "clsx";

interface ButtonProps extends ComponentProps<"button"> {
  glowing?: boolean;
}

export default function Button({ className, glowing = true, type = "button", ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        "relative inline-flex items-center justify-center overflow-hidden rounded-full px-7 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-dusk-50 transition-all disabled:cursor-not-allowed disabled:opacity-50",
        glowing && "shadow-glow-gold",
        "bg-gradient-to-r from-[#5a3b16] via-[#c1904b] to-[#6d461c]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember/60",
        "hover:shadow-[0_0_35px_rgba(228,177,103,0.45)]",
        className
      )}
      type={type}
      {...props}
    />
  );
}
