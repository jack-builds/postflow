import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-zinc-700",
        {
          "bg-white text-black hover:bg-zinc-200":
            variant === "primary",

          "border border-zinc-800 bg-zinc-950 text-zinc-100 hover:bg-zinc-900":
            variant === "secondary",
        },
        className
      )}
      {...props}
    />
  );
}