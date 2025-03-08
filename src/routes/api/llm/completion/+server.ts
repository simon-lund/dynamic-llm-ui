import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { generateCompletion  } from '$lib/server/llm';
import type { TCompletionRequest } from '$lib/components/features/response-pane/schema';

export const POST: RequestHandler = async ({ request }) => {
    try {
        const body = await request.json() as TCompletionRequest;

        if (!body.model) {
            return new Response('Model ID is required', { status: 400 });
        }

        if (!body.context || !Array.isArray(body.context) || body.context.length === 0) {
            return new Response('Context array is required and must not be empty', { status: 400 });
        }

        // Validate each context item
        for (const item of body.context) {
            if (!item.role || !item.content || !['system', 'user', 'assistant'].includes(item.role)) {
                return new Response('Invalid context item format', { status: 400 });
            }
        }

        // Add system message to ensure markdown output if not already present
        if (!body.context.some(item => item.role === 'system')) {
            body.context.unshift({
                role: 'system',
                content: 'You are a helpful assistant. Format your responses in markdown. Use appropriate markdown features like headers, lists, code blocks, and emphasis to structure your response.'
            });
        }

        const completion = await generateCompletion(body);
        return json(completion);
    } catch (error) {
        console.error('Error generating completion:', error);
        
        if (error instanceof Error) {
            return new Response(error.message, { status: 500 });
        }

        return new Response('Failed to generate completion', { status: 500 });
    }
}; 