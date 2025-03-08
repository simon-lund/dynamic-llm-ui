import OpenAI from 'openai';
import { LLMS_API_KEY, LLMS_API_URL } from '$env/static/private';
import type { TCompletionRequest, TCompletionResponse } from '$lib/components/features/response-pane/schema';

const openai = new OpenAI({
    apiKey: LLMS_API_KEY,
    baseURL: LLMS_API_URL
});

// TODO: look at this code again and make sure it makes sense and also check api functions / handling of errors

export async function listModels(): Promise<string[]> {
    const response = await openai.models.list();
    return response.data.map(model => model.id);
}

export async function generateCompletion(request: TCompletionRequest): Promise<TCompletionResponse> {
    console.log(request.context);

    const completion = await openai.chat.completions.create({
        model: request.model,
        messages: request.context,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
    });

    console.log('completion', completion.choices[0].message.content);

    return {
        content: completion.choices[0].message.content || '',
        usage: completion.usage || {
            prompt_tokens: 0,
            completion_tokens: 0,
            total_tokens: 0
        },
        model: request.model
    };
}

export async function generateTitle(content: string, model = 'alias-fast'): Promise<string> {
    const completion = await openai.chat.completions.create({
        model,
        messages: [
            {
                role: 'system',
                content: 'You are a title generator. Generate a short, concise title (max 60 chars) for the given text. Return ONLY the title, no quotes or additional text.'
            },
            {
                role: 'user',
                content
            }
        ],
        temperature: 0.7,
        max_tokens: 60,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
    });

    return completion.choices[0].message.content?.trim() || 'Untitled';
}
