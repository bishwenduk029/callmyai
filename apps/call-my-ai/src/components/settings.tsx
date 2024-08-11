"use client"

import { ChangeEvent, useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { updateUserHandle } from "@/actions/user"
import { CheckCircle, Copy, XCircle } from "@phosphor-icons/react"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface SettingsProps {
  user: { id: string; username: string | null; systemPrompt: string | null }
}

interface PromptInput {
  name: string
  type: "input" | "textarea"
}

interface PromptTemplate {
  id: string
  title: string
  promptTemplate: string
  inputs: PromptInput[]
}

const promptTemplates: PromptTemplate[] = [
  {
    id: "1",
    title: "Personal Call Assistant",
    promptTemplate: `You are Nova, an advanced AI call assistant for \${name}. Your primary objective is to manage incoming calls efficiently while protecting \${name}'s privacy and interests. Follow these guidelines:

  1. Greeting and Identity:
     - Always introduce yourself as 'Nova, \${name}'s personal assistant.'
     - Maintain a friendly, professional tone throughout the call.
  
  2. Information Gathering:
     - Politely inquire about the caller's name and the purpose of their call.
     - Listen attentively and ask relevant follow-up questions to gather useful information.
     - Pay special attention to any mentions of \${interests}.
  
  3. Privacy Protection:
     - Never disclose \${name}'s personal information, schedule, or whereabouts.
     - Do not reveal \${name}'s specific interests or intentions.
     - Avoid confirming or denying any assumptions about \${name}'s activities or preferences.
  
  4. Call Relevance Assessment:
     - Evaluate the relevance of the call based on \${name}'s interests.
     - For relevant calls, gather detailed information.
     - For irrelevant calls, politely wrap up the conversation without prolonging it unnecessarily.
  
  5. Handling Various Call Types:
     - Sales and Marketing: Listen briefly, then politely decline if not related to \${name}'s interests.
     - Relevant Agents: Express general interest and gather details without committing.
     - Personal Calls: Take messages and assure the caller that \${name} will be informed.
     - Emergencies: Gather critical information and assure immediate attention.
  
  6. Ethical Considerations:
     - Never engage in or encourage any illegal or unethical activities.
     - If you suspect any fraudulent or suspicious activity, make a note in your call summary.
  
  7. Strict Boundaries:
     - Do not offer personal advice, emotional support, or resources to callers.
     - If a caller asks for help with personal issues, firmly restate your role and end the call if necessary.
     - Do not engage in casual conversation or deviate from your primary purpose.
  
  Remember, your goal is to act as an efficient filter, gathering useful information while protecting \${name}'s time and privacy. Be smart, adaptable, and always prioritize \${name}'s interests.`,
    inputs: [
      { name: "Client Name", type: "input" },
      { name: "Interests", type: "textarea" },
    ],
  },
  {
    id: "2",
    title: "AI Receptionist",
    promptTemplate: `You are an AI-powered call assistant acting as a receptionist for \${businessName}. Your name is \${assistantName}. Your role is to:

  1. Greet callers professionally and warmly
  2. Determine the purpose of their call
  3. Direct calls to the appropriate department or individual from the following list: \${departments}
  4. Take messages if needed
  5. Answer basic questions about \${businessName}, including information about our key services: \${keyServices}
  6. Schedule appointments if applicable (Appointment booking available: \${appointmentBooking})
  
  Key information:
  - Business hours: \${businessHours}
  - Website: \${websiteUrl}
  - Emergency protocol: \${emergencyProtocol}
  
  Key behaviors:
  - Use a polite, friendly, and professional tone
  - Speak clearly and at an appropriate pace
  - Listen carefully to the caller's needs
  - Be patient and helpful
  - Maintain confidentiality of caller information
  - Follow company protocols for handling calls
  
  Sample greeting:
  "Thank you for calling \${businessName}. This is \${assistantName}, how may I assist you today?"
  
  Remember to:
  - Ask for clarification if needed
  - Confirm details before transferring calls or taking messages
  - Offer to provide additional assistance before ending the call
  
  Handle calls based on the provided information and always prioritize customer satisfaction while adhering to \${businessName}'s policies and procedures.`,
    inputs: [
      { name: "Business Name", type: "input" },
      { name: "Assistant Name", type: "input" },
      { name: "Business Hours", type: "input" },
      { name: "Departments", type: "textarea" },
      { name: "Key Services", type: "textarea" },
      { name: "Appointment Booking", type: "input" },
      { name: "Website URL", type: "input" },
      { name: "Emergency Protocol", type: "textarea" },
    ],
  },
]

export default function Settings({ user }: SettingsProps) {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [isInputChanged, setIsInputChanged] = useState(false)
  const [username, setUsername] = useState(user?.username || "")
  const [systemPrompt, setSystemPrompt] = useState("")
  const [selectedTemplate, setSelectedTemplate] =
    useState<PromptTemplate | null>(null)
  const [templateInputs, setTemplateInputs] = useState<Record<string, string>>(
    {}
  )
  const router = useRouter()

  // Parse the user's systemPrompt
  useEffect(() => {
    if (user?.systemPrompt) {
      try {
        const parsedSystemPrompt: PromptTemplate = JSON.parse(user.systemPrompt)
        setSelectedTemplate(parsedSystemPrompt)
        setSystemPrompt(parsedSystemPrompt.promptTemplate)

        // Find the matching template from promptTemplates
        const matchingTemplate = promptTemplates.find(
          (template) => template.id === parsedSystemPrompt.id
        )
        if (matchingTemplate) {
          setSelectedTemplate(matchingTemplate)
        }
      } catch (e) {
        console.error("Error parsing systemPrompt:", e)
      }
    } else {
      setSystemPrompt("")
    }
  }, [user?.systemPrompt])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    const formData = new FormData(event.currentTarget)
    formData.set("username", username)

    formData.set(
      "systemPrompt",
      JSON.stringify({
        ...selectedTemplate,
        promptTemplate: systemPrompt,
      })
    )

    const result = await updateUserHandle(user.id, formData)

    if (result.error) {
      setError(result.error)
    } else if (result.success) {
      setSuccess(result.success)
      router.refresh()
    }
    setIsInputChanged(false)
  }

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target
    if (name === "username") {
      setUsername(value)
    } else if (name === "systemPrompt") {
      setSystemPrompt(value)
    } else {
      setTemplateInputs((prev) => ({ ...prev, [name]: value }))
    }
    setIsInputChanged(true)
  }

  const handleTemplateChange = (value: string) => {
    const selected = promptTemplates.find(
      (template) => template.title === value
    )
    if (selected) {
      setSelectedTemplate(selected)
      setTemplateInputs({})
      
      let parsedUserPrompt;
      try {
        parsedUserPrompt = JSON.parse(user.systemPrompt || '{}');
      } catch (e) {
        console.error("Error parsing user's systemPrompt:", e);
        parsedUserPrompt = {};
      }
      console.log(selected, parsedUserPrompt)

      if (selected.id !== parsedUserPrompt.id) {
        setSystemPrompt(selected.promptTemplate);
      } else {
        setSystemPrompt(parsedUserPrompt.promptTemplate || selected.promptTemplate);
      }

      setIsInputChanged(true);
    }
  }

  const copyToClipboard = useCallback(() => {
    if (typeof window !== "undefined" && username) {
      const currentDomain = process.env["NEXT_PUBLIC_APP_URL"]
      const handle = `${currentDomain}/${username}`
      navigator.clipboard
        .writeText(handle)
        .then(() => {
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        })
        .catch((err) => {
          console.error("Failed to copy: ", err)
        })
    }
  }, [username])

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="w-full space-y-12 text-lg">
        <div className="space-y-2">
          <h2 className="font-inter text-3xl font-extrabold tracking-tight sm:text-3xl">
            Your Call Handle
          </h2>
          <div className="flex w-full items-center ">
            <div className="dark:border-white flex w-full items-center rounded-md border-2 border-slate-900">
              <span className="bg-primary px-2 py-3 text-primary-foreground">
                callmyai.com/
              </span>
              <Input
                id="username"
                name="username"
                placeholder="Enter your handle here"
                value={username}
                onChange={handleInputChange}
                className="flex-1 rounded-none border-none px-2 py-3 text-lg focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              {success && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ rotate: 360, scale: 1 }}
                  className="mx-2 font-extrabold"
                >
                  <CheckCircle size={25} className="text-green-500" />
                </motion.div>
              )}
              {error && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ rotate: 360, scale: 1 }}
                  className="mx-2 font-extrabold"
                >
                  <XCircle size={25} className="text-destructive" />
                </motion.div>
              )}
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ rotate: 360, scale: 1 }}
              className="mx-2 font-extrabold"
            >
              <Button
                variant={"ghost"}
                size="icon"
                type="button"
                onClick={copyToClipboard}
                title={copied ? "Copied!" : "Copy to clipboard"}
              >
                {copied ? (
                  <CheckCircle
                    size={25}
                    className={copied ? "text-green-500" : ""}
                  />
                ) : (
                  <Copy size={25} className={copied ? "text-green-500" : ""} />
                )}
              </Button>
            </motion.div>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="font-inter text-3xl font-extrabold tracking-tight sm:text-3xl">
            System Prompt Template
          </h2>
          <Select
            onValueChange={handleTemplateChange}
            value={selectedTemplate?.title}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select a template" />
            </SelectTrigger>
            <SelectContent>
              {promptTemplates.map((template) => (
                <SelectItem key={template.title} value={template.title}>
                  {template.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="space-y-2">
            <label
              htmlFor="systemPrompt"
              className="block text-sm font-medium text-gray-700"
            >
              Please read carefully and update the system prompt accordingly by
              replace `${"{}"}`
            </label>
            <Textarea
              id="systemPrompt"
              name="systemPrompt"
              placeholder="Enter your system prompt template here"
              value={systemPrompt}
              onChange={handleInputChange}
            />
          </div>

          {error && <p className=" text-destructive">{error}</p>}
          <Button type="submit" disabled={!isInputChanged}>
            {isInputChanged ? "Update" : "No changes"}
          </Button>
        </div>
      </div>
    </form>
  )
}
