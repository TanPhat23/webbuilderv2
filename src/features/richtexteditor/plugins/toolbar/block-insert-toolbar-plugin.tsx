"use client"

import { Plus } from "lucide-react"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectTrigger,
} from "@/components/ui/select"

export function BlockInsertDropDown({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Select>
      <SelectTrigger className="!h-8 w-min gap-1">
        <Plus className="h-4 w-4" />
        <span>Insert</span>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>{children}</SelectGroup>
      </SelectContent>
    </Select>
  )
}
