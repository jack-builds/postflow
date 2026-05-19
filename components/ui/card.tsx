import { HTMLAttributes } from "react";
import clsx from "clsx";

export function Card({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-zinc-800 bg-zinc-950 p-6",
        className
      )}
      {...props}
    />
  );
}