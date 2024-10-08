import * as axios from 'axios';
import CompletionClient from './CompletionClient';
import CompletionSettings from '../completionSettings';


const modes = {
    'suggest':
    {
        'role':
            'You are a coding assistant helping complete suggestions. You will be given a file context a description of some code to complete.'
        ,
        template: 'CONTEXT:{0},CODE:{1}',
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

class OpenAIClient implements CompletionClient {
    private axiosInstance;
    private CompletionSettings: CompletionSettings;

    constructor(private apiKey: string, completionSettings: CompletionSettings) {
        this.axiosInstance = axios.default.create({
            baseURL: 'https://api.openai.com/v1/chat/',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
            },
        });
        this.CompletionSettings = completionSettings;
    }

    public async suggest(file: string, line: string): Promise<string> {
        const suggestionMode = modes['suggest'];
        const settings = suggestionMode.settings;
        const prompt = modes['suggest'].template.replace('{0}', file).replace('{1}', line);
        return await this.chatCompletion(suggestionMode.role,prompt, settings);
    }

    public async replace(file: string, originalCode: string, newCode: string): Promise<string> {
        const replaceMode = modes['replace'];
        const settings = replaceMode.settings;
        const prompt = replaceMode.template.replace('{0}', file).replace('{1}', originalCode).replace('{2}', newCode);
        return await this.chatCompletion(replaceMode.role, prompt, settings);
    }

    public describe(): string {
        return 'OpenAI Client.';
      }

    public async chatCompletion(role: string, prompt: string, settings : any): Promise<string> {
        settings.MaxTokens = this.CompletionSettings.MaxTokens ? this.CompletionSettings.MaxTokens : settings.max_tokens;
        settings.Temperature = this.CompletionSettings.Temperature ? this.CompletionSettings.Temperature : settings.temperature;
        const requestBody = {
            model: 'gpt-4', // Assuming that this is the GPT-4 model's name
            messages: [
                {
                    role: 'user',
                    content: role + '\n' + prompt,
                },
            ],
            ...settings
        };
        
        try {
            const response = await this.axiosInstance.post('completions', requestBody);
            const assistantMessage = response.data['choices'][0]['message']['content'];
            return assistantMessage;
        } catch (error) {
            console.error(error);
            return '';
        }
    }
}

export default OpenAIClient;