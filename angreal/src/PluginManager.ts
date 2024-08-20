
import CompletionClient from './resources/CompletionClient';
import OpenAIClient from './resources/OpenAIClient';
import GroqClient from './resources/GroqClient';
import CompletionSettings from './completionSettings';

class PluginManager {
    private ClientType: string;
    private VsCodeConfiguration: any;
    
    constructor(clientType: string, vsCodeConfiguration: any) {
        this.ClientType = clientType;
        this.VsCodeConfiguration = vsCodeConfiguration;
    }

    public getClient(): CompletionClient {
        //@ts-ignore
        const openAiKey = this.VsCodeConfiguration.get<string>('OpenAIKey') as string | null;
        //@ts-ignore
        const groqKey = this.VsCodeConfiguration.get<string>('GroqKey') as string | null;
        //@ts-ignore
        const temperature = this.VsCodeConfiguration.get<number>('Temperature') as number | null;
        //@ts-ignore
        const maxTokens = this.VsCodeConfiguration.get<number>('MaxTokens') as number | null;

        const completionSettings = {
            Temperature: temperature,
            MaxTokens: maxTokens
        } as CompletionSettings;

        switch (this.ClientType) {
            case 'openai':
                if (!openAiKey) {
                    throw new Error('OpenAI API key is not available. Please provide it in the configuration settings.');
                }
                return new OpenAIClient(openAiKey, completionSettings);
            case 'groq':
                if (!groqKey) {
                    throw new Error('Groq API key is not available. Please provide it in the configuration settings.');
                }
                return new GroqClient(groqKey, completionSettings);
            default:
                throw new Error('Invalid client type');
        }
    }
}

export default PluginManager;