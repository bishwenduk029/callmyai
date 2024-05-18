import * as emoji from "node-emoji";
import tokenizers from "natural/lib/natural/tokenizers";

const tokenizer = new tokenizers.SentenceTokenizer();

function removeLinks(text: string): string {
  const pattern =
    /(http[s]?:\/\/(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*,]|(?:%[0-9a-fA-F][0-9a-fA-F]))+)/g;
  return text.replace(pattern, "");
}

function removeEmojis(text: string): string {
  return emoji.replace(text, "");
}

async function* generateCharacters(
  generator: AsyncIterableIterator<string>,
  logCharacters: boolean = false
): AsyncIterableIterator<string> {
  for await (const chunk of generator) {
    for (const char of chunk) {
      if (logCharacters) {
        console.log(char);
      }
      yield char;
    }
  }
}

function cleanText(
  text: string,
  cleanupTextLinks: boolean = false,
  cleanupTextEmojis: boolean = false,
  stripText: boolean = true
): string {
  if (cleanupTextLinks) {
    text = removeLinks(text);
  }
  if (cleanupTextEmojis) {
    text = removeEmojis(text);
  }
  if (stripText) {
    text = text.trim();
  }
  return text;
}

async function* tokenizeSentences(text: string): AsyncIterableIterator<string> {
  let sentences: string[];
  sentences = tokenizer.tokenize(text);
  for (const sentence of sentences) {
    yield sentence;
  }
}

export async function* generateSentences(
  generator: AsyncIterableIterator<string>,
  contextSize: number = 12,
  minimumSentenceLength: number = 10,
  minimumFirstFragmentLength: number = 10,
  quickYieldSingleSentenceFragment: boolean = false,
  cleanupTextLinks: boolean = true,
  cleanupTextEmojis: boolean = true,
  language: string = "en",
  logCharacters: boolean = true,
  sentenceFragmentDelimiters: string = ".?!;:,\n…)]}。-",
  forceFirstFragmentAfterWords: number = 15
): AsyncIterableIterator<string> {

  let buffer = "";
  let isFirstSentence = true;
  let wordCount = 0;

  for await (const char of generateCharacters(generator, logCharacters)) {
    if (char) {
      buffer += char;
      buffer = buffer.trimLeft();

      if (/\s/.test(char) || sentenceFragmentDelimiters.includes(char)) {
        wordCount++;
      }

      if (
        isFirstSentence &&
        buffer.length > minimumFirstFragmentLength &&
        quickYieldSingleSentenceFragment
      ) {
        if (
          sentenceFragmentDelimiters.includes(buffer[buffer.length - 1]) ||
          wordCount >= forceFirstFragmentAfterWords
        ) {
          const yieldText = cleanText(
            buffer,
            cleanupTextLinks,
            cleanupTextEmojis
          );
          yield yieldText;
          buffer = "";
          isFirstSentence = false;
          continue;
        }
      }

      if (buffer.length <= minimumSentenceLength + contextSize) {
        continue;
      }

      const delimiterChar = buffer[buffer.length - contextSize];

      if (sentenceFragmentDelimiters.includes(delimiterChar)) {
        for await (const sentence of tokenizeSentences(buffer)) {
          if (sentence.length === buffer.length - contextSize + 1) {
            const yieldText = cleanText(
              buffer.slice(0, -contextSize + 1),
              cleanupTextLinks,
              cleanupTextEmojis
            );
            yield yieldText;
            buffer = buffer.slice(-contextSize + 1);
            isFirstSentence = false;
          }
        }
      }
    }
  }

  if (buffer) {
    for await (const sentence of tokenizeSentences(buffer)) {
      let sentenceBuffer = "";
      sentenceBuffer += sentence;
      if (sentenceBuffer.length < minimumSentenceLength) {
        sentenceBuffer += " ";
        continue;
      }
      const yieldText = cleanText(
        sentenceBuffer,
        cleanupTextLinks,
        cleanupTextEmojis
      );
      yield yieldText;
      sentenceBuffer = "";
    }
  }
}
