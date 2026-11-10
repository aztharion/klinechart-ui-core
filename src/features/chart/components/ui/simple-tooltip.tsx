"use client"

import * as React from "react"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

/** TradeDash-compatible tooltip API for terminal components. */
export function SimpleTooltip({
  content,
  side = "top",
  children,
  open,
}: {
  content: React.ReactNode
  side?: "top" | "right" | "bottom" | "left"
  children: React.ReactNode
  /** Force tooltip closed (e.g. while a nested popover is open). */
  open?: boolean
}) {
  return (
    <Tooltip {...(open !== undefined ? { open } : {})}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side}>{content}</TooltipContent>
    </Tooltip>
  )
}
