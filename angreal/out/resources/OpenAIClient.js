"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios = require("axios");
const modes = {
    'suggest': {
        'role': 'You are a coding assistant helping complete suggestions. You will be given a file context and a line of code, followed by a number of lines to complete.',
        template: 'CONTEXT:{0},CODE:{1},NUMBER_OF_LINES:{2}'
    },
};
class OpenAIClient {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.axiosInstance = axios.default.create({
            baseURL: 'https://api.openai.com/v1/',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
            },
        });
    }
    async suggest(file, line, numberOfLines) {
        const suggestionMode = modes['suggest'];
        const prompt = modes['suggest'].template.replace('{0}', file).replace('{1}', line).replace('{2}', numberOfLines.toString());
        return await this.chatCompletion(suggestionMode.role, prompt);
    }
    async chatCompletion(role, prompt) {
        const requestBody = {
            model: 'gpt-4.0-turbo',
            messages: [
                {
                    role: 'system',
                    content: role
                },
                {
                    role: 'user',
                    content: prompt
                }
            ]
        };
        try {
            const response = await this.axiosInstance.post('completions', requestBody);
            const assistantMessage = response.data['choices'][0]['message']['content'];
            return assistantMessage;
        }
        catch (error) {
            console.error(error);
            return '';
        }
    }
}
exports.default = OpenAIClient;
//# sourceMappingURL=OpenAIClient.js.map