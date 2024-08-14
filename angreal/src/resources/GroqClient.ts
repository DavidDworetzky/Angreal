const Groq = require('groq-sdk');

const modes = {
    'suggest':
    {
        'role':
            'You are a coding assistant helping complete suggestions. You will be given a file context and a line of code, followed by a number of lines to complete.'
        ,
        template: 'CONTEXT:{0},CODE:{1},NUMBER_OF_LINES:{2}',
        settings: {
            "temperature" : 0.7,
            "top_p" : 1,
            "frequency_penalty" : 0.0,
            "presence_penalty" : 0.0,
            "n" : 1,
            "max_tokens" : 1028,
        }
    },
    // next mode is a mode called 'replace' that replaces a selected section of code with new code based off of context
'replace':
    {
        'role':
            'You are a coding assistant helping replace a selected section of code with new code based on context. You will be given a file context, the original code snippet, and a prompt used to transform the replacement.',
        template: 'CONTEXT:{0},ORIGINAL_CODE:{1},REPLACEMENT_PROMPT:{2}',
        settings: {
            "temperature" : 0.7,
            "top_p" : 1,
            "frequency_penalty" : 0.0,
            "presence_penalty" : 0.0,
            "n" : 1,
            "max_tokens" : 1028,
        }
    },
};


const groq = new Groq();
async function main() {
  const chatCompletion = await groq.chat.completions.create({
    "messages": [
      {
        "role": "system",
        "content": "You are a coding assistant helping complete suggestions. You will be given a file context and a line of code, followed by a number of lines to complete."
      },
      {
        "role": "user",
        "content": "Write a program to generate the first n prime numbers"
      }
    ],
    "model": "llama3-70b-8192",
    "temperature": 1,
    "max_tokens": 1024,
    "top_p": 1,
    "stream": true,
    "stop": null
  });

  for await (const chunk of chatCompletion) {
    process.stdout.write(chunk.choices[0]?.delta?.content || '');
  }
}

main();