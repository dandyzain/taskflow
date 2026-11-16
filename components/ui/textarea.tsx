import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-xl border border-input bg-card px-3.5 py-2 text-sm ring-offset-background placeholder:text-muted-foreground/70 focus-visible:outline-none hover:border-border-strong focus-visible:ring-4 focus-visible:ring-primary/15 focus-visible:border-primary/60 disabled:cursor-not-allowed disabled:opacity-50 transition-[border-color,box-shadow] duration-quick",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
