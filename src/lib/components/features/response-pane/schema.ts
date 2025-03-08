export type TCompletionRequest = {
    model: string;
    context: Array<{
        role: 'system' | 'user' | 'assistant';
        content: string;
    }>;
    temperature?: number;
    maxTokens?: number;
};

export type TCompletionResponse = {
    content: string;
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
    model: string;
};


