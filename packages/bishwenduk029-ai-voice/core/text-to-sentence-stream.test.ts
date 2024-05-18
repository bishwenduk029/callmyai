import { describe, expect, it } from "@jest/globals";

import { generateSentences } from './text-to-sentence-stream copy';

describe('generateSentences', () => {
  const createTextGenerator = async function* (chunks: string[]): AsyncIterableIterator<string> {
    for (const chunk of chunks) {
      yield chunk;
    }
  };

  // it('should handle Chinese text', async () => {
  //   const text = '我喜欢读书。天气很好。我们去公园吧。今天是星期五。早上好。这是我的朋友。请帮我。吃饭了吗？我在学中文。晚安。';
  //   const expected = ['我喜欢读书。', '天气很好。', '我们去公园吧。', '今天是星期五。', '早上好。', '这是我的朋友。', '请帮我。', '吃饭了吗？', '我在学中文。晚安。'];
  //   const sentences = await collectSentences(generateSentences(createTextGenerator([text]), 2, 2, 10, false, false, false, undefined, 'stanza', 'zh'));
  //   expect(sentences).toEqual(expected);
  // });

  it('should handle a generator', async () => {
    const generator = async function* () {
      yield 'Hallo, ';
      yield 'wie geht es dir? ';
      yield 'Mir geht es gut.';
    };
    const expected = ['Hallo, wie geht es dir? Mir geht es gut.'];
    const sentences = await collectSentences(generateSentences(generator(), 3, 5, 3, true));
    expect(sentences).toEqual(expected);
  });

  it('should return incomplete last sentence', async () => {
    const text = 'How I feel? I feel fine';
    const expected = ['How I feel? I feel fine'];
    const sentences = await collectSentences(generateSentences(createTextGenerator([text])));
    expect(sentences).toEqual(expected);
  });

  it.only('should handle "Hello, world."', async () => {
    const text = 'Hello, world.';
    const expected = ["Hello, world."];
    const sentences = await collectSentences(generateSentences(createTextGenerator([text]), 3, 12, 3, true));
    console.log(sentences)
    expect(sentences).toEqual(expected);
  });

  it('should handle "Hello, world! Hello all, my dear friends of realtime apps."', async () => {
    const text = 'Hello, world! Hello all, my dear friends of realtime apps.';
    const expected = ['Hello, world!', 'Hello all, my dear friends of realtime apps.'];
    const sentences = await collectSentences(generateSentences(createTextGenerator([text]), 3));
    expect(sentences).toEqual(expected);
  });

  it('should handle basic text', async () => {
    const text = 'This is a test. This is another test sentence. Just testing out the module.';
    const expected = ['This is a test.', 'This is another test sentence.', 'Just testing out the module.'];
    const sentences = await collectSentences(generateSentences(createTextGenerator([text])));
    expect(sentences).toEqual(expected);
  });

  it('should handle tricky sentence 1', async () => {
    const text = 'Good muffins cost $3.88 in New York. Please buy me two of them.';
    const expected = ['Good muffins cost $3.88 in New York.', 'Please buy me two of them.'];
    const sentences = await collectSentences(generateSentences(createTextGenerator([text])));
    expect(sentences).toEqual(expected);
  });

  it('should handle tricky sentence 2', async () => {
    const text = 'I called Dr. Jones. I called Dr. Jones.';
    const expected = ['I called Dr. Jones.', 'I called Dr. Jones.'];
    const sentences = await collectSentences(generateSentences(createTextGenerator([text])));
    expect(sentences).toEqual(expected);
  });

  it('should handle quick yield', async () => {
    const text = 'First, this. Second, this.';
    const expected = ['First,', 'this.', 'Second, this.'];
    const sentences = await collectSentences(generateSentences(createTextGenerator([text]), 3, 12, 3, true));
    expect(sentences).toEqual(expected);
  });

  it('should handle quick yield 2', async () => {
    const text = 'First, this. Second, this.';
    const expected = ['First,', 'this. Second, this.'];
    const sentences = await collectSentences(generateSentences(createTextGenerator([text]), 6, 12, 3, true));
    expect(sentences).toEqual(expected);
  });

  it('should handle quick yield 3', async () => {
    const text = 'First, this. Second, this.';
    const expected = ['First, this.', 'Second, this.'];
    const sentences = await collectSentences(generateSentences(createTextGenerator([text]), 3, 12, 6, true));
    expect(sentences).toEqual(expected);
  });

  it('should handle quick yield 4', async () => {
    const text = 'First, this. Second, this.';
    const expected = ['First, this.', 'Second, this.'];
    const sentences = await collectSentences(generateSentences(createTextGenerator([text]), 6, 12, 6, true));
    expect(sentences).toEqual(expected);
  });

  it('should handle minimum length 1', async () => {
    const text = 'Short. Longer sentence.';
    const expected = ['Short.', 'Longer sentence.'];
    const sentences = await collectSentences(generateSentences(createTextGenerator([text]), 6));
    expect(sentences).toEqual(expected);
  });

  it('should handle minimum length 2', async () => {
    const text = 'Short. Longer sentence.';
    const expected = ['Short. Longer sentence.'];
    const sentences = await collectSentences(generateSentences(createTextGenerator([text]), 7));
    expect(sentences).toEqual(expected);
  });

  it('should handle text cleanup', async () => {
    const text = 'Text with link: https://www.example.com and emoji 😀';
    const expected = ['Text with link:  and emoji'];
    const sentences = await collectSentences(generateSentences(createTextGenerator([text]), 10, 12, 10, false, true, true));
    expect(sentences).toEqual(expected);
  });

  it('should handle check 1', async () => {
    const text = "I'll go with a glass of red wine. Thank you.";
    const expected = ["I'll go with a glass of red wine.", 'Thank you.'];
    const sentences = await collectSentences(generateSentences(createTextGenerator([text]), 10, 12, 10, true, true, true));
    expect(sentences).toEqual(expected);
  });

  it('should handle very short text', async () => {
    const text = 'Excuse me?';
    const expected = ['Excuse me?'];
    const sentences = await collectSentences(generateSentences(createTextGenerator([text]), 18, 12, 10, true, true, true));
    expect(sentences).toEqual(expected);
  });

  it('should log characters', async () => {
    const text = 'Hello world';
    console.log();
    const sentences = await collectSentences(generateSentences(createTextGenerator([text]), 10, 12, 10, false, false, false, "en", true));
    console.log();
    console.log();
    console.log(`test_log_characters succeeded, if ${text} was printed above.`);
    console.log();
    expect(sentences.length).toBeGreaterThan(0);
  });

  it('should not log characters', async () => {
    const text = 'Do not show these characters.';
    const expected = ['Do not show these characters.'];
    const sentences = await collectSentences(generateSentences(createTextGenerator([text]), 10, 12, 10, false, false, false, 'en', false));
    console.log(`\ntest_not_log_characters succeeded, if "${text}" was not printed above.`);
    expect(sentences).toEqual(expected);
  });
});

async function collectSentences(sentenceGenerator: AsyncIterableIterator<string>): Promise<string[]> {
  const sentences: string[] = [];
  for await (const sentence of sentenceGenerator) {
    sentences.push(sentence);
  }
  return sentences;
}