"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import {
  createComposioLinkAction,
  fetchExternalAppsAction,
  type ExternalApp,
} from "@/actions/integration"
import { CaretUpDown } from "@phosphor-icons/react/dist/ssr"
import { useAction } from "next-safe-action/hooks"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Icons } from "./icons"

interface LinearComboboxProps {
  userEmail: string
  onLinkGenerated: (app: ExternalApp | null) => void
}

export function LinearCombobox({ userEmail, onLinkGenerated }: LinearComboboxProps) {
  const [openPopover, setOpenPopover] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const [selectedApp, setSelectedApp] = useState<ExternalApp | null>(null)
  const [composioLink, setComposioLink] = useState<string | null>(null)
  const [isLoadingAppLink, setIsLoadingAppLink] = useState(false)

  const {
    execute: fetchApps,
    result,
    status,
  } = useAction(fetchExternalAppsAction)
  
  const {
    execute: createLink,
    result: createLinkResult,
    status: createLinkStatus,
  } = useAction(createComposioLinkAction)

  useEffect(() => {
    fetchApps()
  }, [fetchApps])

  useEffect(() => {
    if (createLinkResult.data) {
      if (createLinkResult.data.success) {
        setComposioLink(createLinkResult.data.data.link)
        setIsLoadingAppLink(false)
        onLinkGenerated(selectedApp)
      } else {
        console.error(
          "Error creating Composio link:",
          createLinkResult.data.error || "Unknown error"
        )
        setIsLoadingAppLink(false)
      }
    }
  }, [createLinkResult])

  const apps = result.data?.data.items ?? []

  function handleAppSelect(app: ExternalApp) {
    setSelectedApp(app)
    setIsLoadingAppLink(true)
    setOpenPopover(false)
    setSearchValue("")
    createLink({ userEmail, appId: app.key })
  }

  return (
    <div className="flex flex-col justify-start items-start gap-2 content-baseline mb-12">
      <Popover open={openPopover} onOpenChange={setOpenPopover}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            aria-label="Select app"
            size="lg"
            className="text-md mt-2 h-8 w-fit px-2 font-medium leading-normal text-primary"
          >
            {selectedApp ? (
              <>
                <Image
                  src={selectedApp.logo}
                  alt={selectedApp.name}
                  width={16}
                  height={16}
                  className="mr-2"
                />
                {selectedApp.name}
              </>
            ) : (
              "Select An External App"
            )}
            <CaretUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[250px] rounded-lg p-0"
          align="start"
          onCloseAutoFocus={(e) => e.preventDefault()}
          sideOffset={6}
        >
          <Command className="rounded-lg">
            <CommandInput
              value={searchValue}
              onValueChange={setSearchValue}
              className="text-md leading-normal"
              placeholder="Search apps..."
            />
            <CommandList>
              <CommandGroup>
                {apps.filter((app: ExternalApp) => !app.enabled).map((app: ExternalApp) => (
                  <CommandItem
                    key={app.appId}
                    value={app.name}
                    onSelect={() => handleAppSelect(app)}
                    className="text-md group flex w-full cursor-pointer items-center justify-between rounded-md leading-normal text-primary"
                  >
                    <div className="flex items-center">
                      <Image
                        src={app.logo}
                        alt={app.name}
                        width={16}
                        height={16}
                        className="mr-2"
                      />
                      <span>{app.name}</span>
                    </div>
                    {selectedApp?.appId === app.appId && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-4 w-4"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {(composioLink || isLoadingAppLink) && (
        <Button
          variant={composioLink ? "outline" : "default"}
          className="mt-4 p-8"
          onClick={composioLink && !isLoadingAppLink ? () => window.open(composioLink, "_blank") : undefined}
          disabled={isLoadingAppLink}
        >
          {isLoadingAppLink ? (
            <>
              <Icons.spinner
                className="mr-2 size-4 animate-spin"
                aria-hidden="true"
              />
              <span>Generating Auth Link...</span>
            </>
          ) : (
            <>
              {selectedApp && (
                <Avatar className="mr-2">
                  <AvatarImage src={selectedApp.logo} alt={selectedApp.name} />
                  <AvatarFallback>{selectedApp.name.charAt(0)}</AvatarFallback>
                </Avatar>
              )}
              Connect to {selectedApp?.name}
            </>
          )}
        </Button>
      )}
    </div>
  )
}
