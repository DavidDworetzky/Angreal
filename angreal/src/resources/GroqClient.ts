import * as Groq from 'groq-sdk';
import CompletionClient from './CompletionClient';

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

class GroqClient implements CompletionClient 
{
  private groq = new Groq();

  constructor (private apiKey: string) {
    this.groq.setApiKey(apiKey);
  }

  private async chatCompletion(role: string, prompt: string, settings: any): Promise<string> {
    const chatCompletion = await this.groq.chat.completions.create({
      "messages": [
        {
          "role": role,
          "content": prompt
        }
      ],
      "model": "llama3-70b-8192",
      "temperature": settings.temperature,
      "max_tokens": settings.max_tokens,
      "top_p": settings.top_p,
      "stream": true,
      "stop": null
    });

    let content = '';
    for await (const chunk of chatCompletion) {
      content += chunk.choices[0]?.delta?.content || '';
    } 
    return content;
}

  public async suggest(file: string, line: string, numberOfLines: number): Promise<string> {
    const suggestionMode = modes['suggest'];
    const settings = suggestionMode.settings;
    const prompt = modes['suggest'].template.replace('{0}', file).replace('{1}', line).replace('{2}', numberOfLines.toString());
    return await this.chatCompletion(suggestionMode.role,prompt, settings);
  }

  public async replace(file: string, originalCode: string, newCode: string): Promise<string> {
    const replaceMode = modes['replace'];
    const settings = replaceMode.settings;
    const prompt = replaceMode.template.replace('{0}', file).replace('{1}', originalCode).replace('{2}', newCode);
    return await this.chatCompletion(replaceMode.role, prompt, settings);
  }

  public describe(): string {
    return 'Groq Client.';
  }

}

export default GroqClient;