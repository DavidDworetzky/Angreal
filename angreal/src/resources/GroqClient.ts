import { Groq } from 'groq-sdk';
import CompletionClient from './CompletionClient';
import CompletionSettings from '../completionSettings';

const modes = {
    'suggest': {
        'role': 'You are a coding assistant helping complete suggestions. You will be given a file context a description of some code to complete.',
        template: 'CONTEXT:{0},CODE:{1}',
        settings: {
            temperature: 0.7,
            top_p: 1,
            frequency_penalty: 0.0,
            presence_penalty: 0.0,
            n: 1,
            max_tokens: 1028,
        }
    },
    'replace': {
        'role': 'You are a coding assistant helping replace a selected section of code with new code based on context. You will be given a file context, the original code snippet, and a prompt used to transform the replacement.',
        template: 'CONTEXT:{0},ORIGINAL_CODE:{1},REPLACEMENT_PROMPT:{2}',
        settings: {
            temperature: 0.7,
            top_p: 1,
            frequency_penalty: 0.0,
            presence_penalty: 0.0,
            n: 1,
            max_tokens: 1028,
        }
    },
};

class GroqClient implements CompletionClient {
    private groq: Groq;
    private completionSettings: CompletionSettings;

    constructor(private apiKey: string, completionSettings: CompletionSettings) {
        this.groq = new Groq({ apiKey: this.apiKey });
        this.completionSettings = completionSettings;
    }

    private async chatCompletion(role: string, prompt: string, settings: typeof modes['suggest']['settings']): Promise<string> {
        try {
            const chatCompletion = await this.groq.chat.completions.create({
                messages: [
                    {
                        role: "user",
                        content: role + prompt
                    }
                ],
                model: "llama3-70b-8192",
                temperature: this.completionSettings.Temperature ?? settings.temperature,
                max_tokens: this.completionSettings.MaxTokens ?? settings.max_tokens,
                top_p: settings.top_p,
                stream: true,
                stop: null
            });

            let content = '';
            for await (const chunk of chatCompletion) {
                content += chunk.choices[0]?.delta?.content ?? '';
            }
            return content;
        } catch (error) {
            console.error('Error in chatCompletion:', error);
            throw error;
        }
    }

    public async suggest(file: string, line: string): Promise<string> {
        try {
            const suggestionMode = modes['suggest'];
            const prompt = suggestionMode.template.replace('{0}', file).replace('{1}', line);
            return await this.chatCompletion(suggestionMode.role, prompt, suggestionMode.settings);
        } catch (error) {
            console.error('Error in suggest:', error);
            throw error;
        }
    }

    public async replace(file: string, originalCode: string, newCode: string): Promise<string> {
        try {
            const replaceMode = modes['replace'];
            const prompt = replaceMode.template.replace('{0}', file).replace('{1}', originalCode).replace('{2}', newCode);
            return await this.chatCompletion(replaceMode.role, prompt, replaceMode.settings);
        } catch (error) {
            console.error('Error in replace:', error);
            throw error;
        }
    }

    public describe(): string {
        return 'Groq Client.';
    }
}

export default GroqClient;