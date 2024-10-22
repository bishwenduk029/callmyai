"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"

import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Textarea } from "@/components/ui/textarea"

import { Integration } from "../../db/schema/index"
import { getCaretCoordinates, getCurrentWord, replaceWord } from "./utils"
import { ActionsControllerV1Service } from "composio-core/lib/src/sdk/client"

interface Props {
  textValue: string
  setTextValue: React.Dispatch<React.SetStateAction<string>>
  integrations: Integration[]
  placeholder?: string
  className?: string
  id?: string
  onNewActionSelected?: (action: string) => void
  [key: string]: any
}

export function Write({
  textValue,
  setTextValue,
  integrations,
  placeholder,
  className,
  id,
  onNewActionSelected,
  ...props
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [commandValue, setCommandValue] = useState("")

  // TODO: check if this is possible?!?
  // const texarea = textareaRef.current;
  // const dropdown = dropdownRef.current;

  const handleBlur = useCallback((e: Event) => {
    const dropdown = dropdownRef.current
    if (dropdown) {
      dropdown.classList.add("hidden")
      setCommandValue("")
    }
  }, [])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const textarea = textareaRef.current
    const input = inputRef.current
    const dropdown = dropdownRef.current
    if (textarea && input && dropdown) {
      const currentWord = getCurrentWord(textarea)
      const isDropdownHidden = dropdown.classList.contains("hidden")
      if (currentWord.startsWith("@") && !isDropdownHidden) {
        // FIXME: handle Escape
        if (
          e.key === "ArrowUp" ||
          e.keyCode === 38 ||
          e.key === "ArrowDown" ||
          e.keyCode === 40 ||
          e.key === "Enter" ||
          e.keyCode === 13 ||
          e.key === "Escape" ||
          e.keyCode === 27
        ) {
          e.preventDefault()
          input.dispatchEvent(new KeyboardEvent("keydown", e))
        }
      }
    }
  }, [])

  const onTextValueChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const text = e.target.value
      const textarea = textareaRef.current
      const dropdown = dropdownRef.current

      if (textarea && dropdown) {
        const caret = getCaretCoordinates(textarea, textarea.selectionEnd)
        const currentWord = getCurrentWord(textarea)
        setTextValue(text)
        if (currentWord.startsWith("@")) {
          setCommandValue(currentWord)
          dropdown.style.left = caret.left + "px"
          dropdown.style.top = caret.top + caret.height + "px"
          dropdown.classList.remove("hidden")
        } else {
          // REMINDER: apparently, we need it when deleting
          if (commandValue !== "") {
            setCommandValue("")
            dropdown.classList.add("hidden")
          }
          if (props.value) {
            props.onChange(text)
          }
        }
      }
    },
    [setTextValue, commandValue]
  )

  const onCommandSelect = useCallback((value: string) => {
    const textarea = textareaRef.current
    const dropdown = dropdownRef.current
    if (textarea && dropdown) {
      replaceWord(textarea, `${value}`)
      setCommandValue("")
      dropdown.classList.add("hidden")
      onNewActionSelected?.(value)
    }
  }, [])

  const handleMouseDown = useCallback((e: Event) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleSectionChange = useCallback(
    (e: Event) => {
      const textarea = textareaRef.current
      const dropdown = dropdownRef.current
      if (textarea && dropdown) {
        const currentWord = getCurrentWord(textarea)
        if (!currentWord.startsWith("@") && commandValue !== "") {
          setCommandValue("")
          dropdown.classList.add("hidden")
        }
      }
    },
    [commandValue]
  )

  useEffect(() => {
    const textarea = textareaRef.current
    const dropdown = dropdownRef.current
    textarea?.addEventListener("keydown", handleKeyDown)
    textarea?.addEventListener("blur", handleBlur)
    document?.addEventListener("selectionchange", handleSectionChange)
    dropdown?.addEventListener("mousedown", handleMouseDown)
    return () => {
      textarea?.removeEventListener("keydown", handleKeyDown)
      textarea?.removeEventListener("blur", handleBlur)
      document?.removeEventListener("selectionchange", handleSectionChange)
      dropdown?.removeEventListener("mousedown", handleMouseDown)
    }
  }, [handleBlur, handleKeyDown, handleMouseDown, handleSectionChange])

  return (
    <div className="relative w-full">
      <Textarea
        id={id}
        ref={textareaRef}
        autoComplete="off"
        autoCorrect="off"
        className={cn("h-auto resize-both", className)}
        value={textValue}
        onChange={onTextValueChange}
        rows={5}
        placeholder={placeholder}
      />
      <Command
        ref={dropdownRef}
        className={cn(
          "absolute hidden max-h-64 w-full max-w-md overflow-hidden border border-popover shadow"
        )}
      >
        <div className="hidden">
          <CommandInput ref={inputRef} value={commandValue} />
        </div>
        <CommandList>
          <CommandGroup>
            {integrations
              .flatMap(
                (integration) =>
                  integration.availableActions?.map((action) => ({
                    ...integration,
                    action,
                    displayName: `@${integration.connectedAccountName} - ${action}`,
                  })) || []
              )
              .map((integration) => {
                return (
                  <CommandItem
                    key={integration.displayName}
                    value={integration.displayName}
                    onSelect={onCommandSelect}
                  >
                    <div className="flex items-center">
                      <img
                        src={integration.logo || ""}
                        alt={`${integration.connectedAccountName} logo`}
                        className="mr-2 h-5 w-5"
                      />
                      <span>{integration.displayName}</span>
                    </div>
                  </CommandItem>
                )
              })}
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  )
}
