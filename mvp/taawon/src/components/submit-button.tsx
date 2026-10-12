"use client";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import type { ComponentProps } from "react";
import { buttonClass } from "./ui";

/** Submit button that shows a spinner while its parent <form action> is pending. */
export function SubmitButton({
  children,
  variant = "primary",
  size = "md",
  className,
  pendingText,
  ...props
}: ComponentProps<"button"> & {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "care" | "outline";
  size?: "sm" | "md" | "lg";
  pendingText?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending || props.disabled} className={buttonClass(variant, size, className)} {...props}>
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          {pendingText ?? children}
        </>
      ) : (
        children
      )}
    </button>
  );
}
