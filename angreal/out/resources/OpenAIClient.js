"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios = require("axios");
const modes = {
    'suggest': {
        'role': 'You are a coding assistant helping complete suggestions. You will be given a file context and a line of code, followed by a number of lines to complete.',
        template: 'CONTEXT:{0},CODE:{1},NUMBER_OF_LINES:{2}',
        settings: {
            "temperature": 0.7,
            "top_p": 1,
            "frequency_penalty": 0.0,
            "presence_penalty": 0.0,
            "n": 1,
            "max_tokens": 1028,
        }
    },
    // next mode is a mode called 'replace' that replaces a selected section of code with new code based off of context
    'replace': {
        'role': 'You are a coding assistant helping replace a selected section of code with new code based on context. You will be given a file context, the original code snippet, and a prompt used to transform the replacement.',
        template: 'CONTEXT:{0},ORIGINAL_CODE:{1},REPLACEMENT_PROMPT:{2}',
        settings: {
            "temperature": 0.7,
            "top_p": 1,
            "frequency_penalty": 0.0,
            "presence_penalty": 0.0,
            "n": 1,
            "max_tokens": 1028,
        }
    },
};
class OpenAIClient {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.axiosInstance = axios.default.create({
            baseURL: 'https://api.openai.com/v1/chat/',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
            },
        });
    }
    async suggest(file, line, numberOfLines) {
        const suggestionMode = modes['suggest'];
        const settings = suggestionMode.settings;
        const prompt = modes['suggest'].template.replace('{0}', file).replace('{1}', line).replace('{2}', numberOfLines.toString());
        return await this.chatCompletion(suggestionMode.role, prompt, settings);
    }
    async replace(file, originalCode, newCode) {
        const replaceMode = modes['replace'];
        const settings = replaceMode.settings;
        const prompt = replaceMode.template.replace('{0}', file).replace('{1}', originalCode).replace('{2}', newCode);
        return await this.chatCompletion(replaceMode.role, prompt, settings);
    }
    async chatCompletion(role, prompt, settings) {
        const requestBody = {
            model: 'gpt-4',
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
        }
        catch (error) {
            console.error(error);
            return '';
        }
    }
}
exports.default = OpenAIClient;
//# sourceMappingURL=OpenAIClient.js.map