import * as React from "react"
import { cn } from "../../lib/utils"

export function Avatar({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("relative w-10 h-10 rounded-full overflow-hidden", className)} {...props} />
}

export function AvatarImage({ src, alt }: { src?: string; alt?: string }) {
  return <img src={src} alt={alt} className="object-cover w-full h-full" />
}

export function AvatarFallback({ children }: { children: React.ReactNode }) {
  return <div className="bg-muted flex items-center justify-center w-full h-full text-sm text-muted-foreground">{children}</div>
}
