import type { ComponentProps } from "react";

type Props = ComponentProps<"div"> & {
  className?: string;
};

export function Skeleton({ className = "", ...rest }: Props) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-surface-container-low ${className}`}
      {...rest}
    />
  );
}
