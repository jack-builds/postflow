import { InputHTMLAttributes } from "react";
import clsx from "clsx";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={clsx(
        "w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-100",
        "placeholder:text-zinc-500",
        "focus:outline-none focus:ring-2 focus:ring-zinc-700",
        className
      )}
      {...props}
    />
  );
}