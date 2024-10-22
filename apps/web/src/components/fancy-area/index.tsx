"use client"

import React from "react"

import { Integration } from "@/db/schema"

import { Write } from "./write"

// TODO: TabsList has an interesting tab focus. Need to investigate on it

const defaultText = `Build by @mxkaske, _powered by_ @shadcn **ui**.\n\nSupports raw <code>html</code>.`

type Props = {
  integrations?: Integration[]
  placeholder?: string
  className?: string
  id?: string
  onNewActionSelected?: (action: string) => void
  [key: string]: any
}

export function FancyArea({
  integrations = [],
  placeholder = defaultText,
  className,
  id,
  onNewActionSelected,
  ...props
}: Props = {}) {
  console.log(props)
  const [textValue, setTextValue] = React.useState(props.value || placeholder)

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-medium text-primary"
      >
        Describe Your Workflow
      </label>
      <Write
        {...{
          textValue,
          setTextValue,
          integrations,
          placeholder,
          className,
          id,
          onNewActionSelected,
          ...props,
        }}
      />
    </div>
  )
}
