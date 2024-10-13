"use client"

import { X } from "@phosphor-icons/react/dist/ssr"
import { Command as CommandPrimitive } from "cmdk"
import * as React from "react"

import { Badge } from "@/components/ui/badge"
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Skeleton } from "./ui/skeleton"

type SelectOption = Record<"value" | "label", string>

export function FancyMultiSelect({
  options,
  defaultSelected,
  placeholder = "Select More Actions...",
  handleOnClick,
  fetchingOptions = false,
  onSelect,
}: {
  options: SelectOption[]
  defaultSelected: SelectOption[] | undefined
  placeholder: string
  handleOnClick: () => void
  fetchingOptions: boolean
  onSelect: (option: SelectOption) => void
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [open, setOpen] = React.useState(false)
  const [selected, setSelected] = React.useState<SelectOption[]>(
    defaultSelected || []
  )
  const [inputValue, setInputValue] = React.useState("")

  const handleUnselect = React.useCallback((option: SelectOption) => {
    setSelected((prev) => prev.filter((s) => s.value !== option.value))
  }, [])

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const input = inputRef.current
      if (input) {
        if (e.key === "Delete" || e.key === "Backspace") {
          if (input.value === "") {
            setSelected((prev) => {
              const newSelected = [...prev]
              newSelected.pop()
              return newSelected
            })
          }
        }
        // This is not a default behaviour of the <input /> field
        if (e.key === "Escape") {
          input.blur()
        }
      }
    },
    []
  )

  const selectables = options.filter(
    (option) => !selected.includes(option)
  )

  console.log(selectables, selected, inputValue)

  return (
    <Command
      onKeyDown={handleKeyDown}
      className="overflow-visible bg-transparent"
    >
      <div className="group rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <div className="flex flex-wrap gap-1">
          {selected.map((framework) => {
            return (
              <Badge key={framework.value} variant="secondary">
                {framework.label}
                <button
                  className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleUnselect(framework)
                    }
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  onClick={() => handleUnselect(framework)}
                >
                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </button>
              </Badge>
            )
          })}
          {/* Avoid having the "Search" Icon */}
          <CommandPrimitive.Input
            ref={inputRef}
            value={inputValue}
            onValueChange={setInputValue}
            onBlur={() => setOpen(false)}
            onFocus={() => setOpen(true)}
            onClick={() => handleOnClick()}
            placeholder={placeholder}
            className="ml-2 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>
      <div className="relative mt-2">
        <CommandList>
          {open && (
            <div className="absolute top-0 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
              {fetchingOptions ? (
                <CommandGroup className="h-full overflow-auto p-2">
                  {[...Array(5)].map((_, index) => (
                    <CommandItem key={index} className="cursor-default">
                      <Skeleton className="h-4 w-full" />
                    </CommandItem>
                  ))}
                </CommandGroup>
              ) : selectables.length > 0 ? (
                <CommandGroup className="h-full overflow-auto">
                  {selectables.map((option) => (
                    <CommandItem
                      key={option.value}
                      onMouseDown={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                      onSelect={(value) => {
                        setInputValue("")
                        setSelected((prev) => [...prev, option])
                        onSelect(option)
                      }}
                      className="cursor-pointer"
                    >
                      {option.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ) : (
                <CommandGroup>
                  <CommandItem>No options available</CommandItem>
                </CommandGroup>
              )}
            </div>
          )}
        </CommandList>
      </div>
    </Command>
  )
}
