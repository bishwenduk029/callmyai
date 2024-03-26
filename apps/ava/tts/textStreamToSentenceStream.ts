const GRPC_STREAMING_LIMITS = {
  MAX_NUMBER_OF_LINES: 6,
  LINE_MAX_LENGTH: 300,
  LINE_DESIRED_LENGTH: 200
}

const PUNCTUATION_REGEX = /[.!?]/
const STREAM_SENTENCE_AGGREGATE_TIMEOUT = 150

export function textStreamToSentences(
  inputStream: ReadableStream<Uint8Array>
): ReadableStream<string> {
  let textInput = ''
  let combinedSentences = ''
  let isFirstSentence = true
  let timer: ReturnType<typeof setTimeout> | undefined

  const outStream = new ReadableStream<string>({
    start(controller) {
      const pushSentences = () => {
        if (combinedSentences.trim().length > 0) {
          controller.enqueue(combinedSentences.trim())
          combinedSentences = ''
          clearTimeout(timer!)
          timer = setTimeout(pushSentences, STREAM_SENTENCE_AGGREGATE_TIMEOUT)
        }
      }

      const reader = inputStream.getReader()

      const readChunk = async () => {
        const { done, value } = await reader.read()

        if (done) {
          clearTimeout(timer!)
          if (combinedSentences.trim().length > 0) {
            controller.enqueue(combinedSentences.trim())
          }
          if (textInput.trim().length > 0) {
            controller.enqueue(textInput.trim())
          }
          controller.close()
          return
        }

        const text = new TextDecoder().decode(value)
        textInput += text

        let punctuationMatch

        while (
          (punctuationMatch = PUNCTUATION_REGEX.exec(textInput)) !== null
        ) {
          const sentence = textInput.slice(0, punctuationMatch.index + 1).trim()
          textInput = textInput.slice(punctuationMatch.index + 1)

          if (sentence.length > 0) {
            if (isFirstSentence) {
              controller.enqueue(sentence)
              isFirstSentence = false
            } else if (
              combinedSentences.length + sentence.length >
              GRPC_STREAMING_LIMITS.LINE_MAX_LENGTH
            ) {
              pushSentences()
              combinedSentences = sentence
            } else {
              combinedSentences += ` ${sentence}`
              if (
                combinedSentences.length >
                GRPC_STREAMING_LIMITS.LINE_DESIRED_LENGTH
              ) {
                pushSentences()
              }
            }
          }
        }

        readChunk()
      }

      readChunk()
    }
  })

  return outStream
}
