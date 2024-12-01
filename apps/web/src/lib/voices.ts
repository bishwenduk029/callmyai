export interface Voice {
  id: string
  name?: string
  gender: string
  accent: string
  description: string
  language?: string
  provider: string
}

export const voices: Voice[] = [
  {
    id: "nova",
    gender: "female",
    accent: "American",
    description: "Professional female voice, American",
    name: "Nova",
    provider: "openai"
  },
  {
    id: "onyx",
    gender: "male", 
    accent: "British",
    description: "Warm and authoritative male voice, British",
    name: "Onyx",
    provider: "openai"
  },
  {
    id: "shimmer",
    gender: "female",
    accent: "American",
    description: "Energetic female voice, American",
    name: "Shimmer",
    provider: "openai"
  },
  {
    id: "echo",
    gender: "male",
    accent: "American", 
    description: "Deep and engaging male voice, American",
    name: "Echo",
    provider: "openai"
  },
  {
    id: "alloy",
    gender: "female",
    accent: "American",
    description: "Upbeat male voice, American",
    name: "Alloy",
    provider: "openai"
  },
  {
    id: "s3://voice-cloning-zero-shot/0b29eab5-834f-4463-b3ad-4e6177d2b145/flynnsaad/manifest.json",
    gender: "male",
    accent: "British",
    description: "Fast-paced male voice, British",
    name: "Flynn",
    language: "English (US)",
    provider: "playht"
  },
  {
    id: "s3://voice-cloning-zero-shot/fdb74aec-ede9-45f8-ad87-71cb45f01816/original/manifest.json",
    gender: "female", 
    accent: "Mexican",
    description: "Warm female voice, Mexican accent",
    name: "Mexican Female",
    provider: "playht"
  },
  {
    id: "s3://voice-cloning-zero-shot/b3def996-302e-486f-a234-172fa0279f0e/anthonysaad/manifest.json",
    gender: "male",
    accent: "American", 
    description: "Clear male voice, American",
    name: "Anthony",
    provider: "playht"
  },
  {
    id: "s3://peregrine-voices/barry ads parrot saad/manifest.json",
    gender: "male",
    accent: "Australian",
    description: "Engaging male voice, Australian",
    name: "Australian Male",
    provider: "playht"
  },
  {
    id: "s3://peregrine-voices/barry narrative parrot saad/manifest.json",
    gender: "male", 
    accent: "Australian",
    description: "Storytelling male voice, Australian",
    name: "Australian Male",
    provider: "playht"
  },
  {
    id: "s3://voice-cloning-zero-shot/7bad42d5-52be-4687-9a07-7891f31daa6b/logansaad/manifest.json",
    gender: "male",
    accent: "British",
    description: "Rich-toned male voice, British",
    name: "British Male",
    provider: "playht"
  },
  {
    id: "s3://voice-cloning-zero-shot/7fdf51ea-c162-4e6e-876e-0473a0255bb8/lancesaad/manifest.json",
    name: "Lance",
    accent: "British",
    gender: "male",
    language: "English (US)",
    description: "Casual male voice, British",
    provider: "playht"
  },
  {
    id: "s3://voice-cloning-zero-shot/8218bea1-aad9-49cc-95b3-e9234e28d4a6/wilbursaad/manifest.json",
    name: "Wilbur",
    accent: "American",
    gender: "male",
    language: "English (US)",
    description: "Youthful male voice, American",
    provider: "playht"
  },
  {
    id: "s3://voice-cloning-zero-shot/2cbffa49-5dfe-4378-a54f-b824f7bbb032/theodoresaad/manifest.json",
    name: "Theodore",
    accent: "American",
    gender: "male",
    language: "English (US)",
    description: "Gravelly male voice, American",
    provider: "playht"
  },
  {
    id: "s3://voice-cloning-zero-shot/f2863f63-5334-4f65-9d30-438feb79c2ec/arianasaad2/manifest.json",
    name: "Ariana",
    accent: "American",
    gender: "female",
    language: "English (US)",
    description: "Young female voice, American",
    provider: "playht"
  }
]
