import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listModels } from '$lib/server/llm';

export const GET: RequestHandler = async () => {
    try {
        const models = await listModels();
        return json({ models });
    } catch (error) {
        console.error('Error fetching models:', error);
        return new Response('Failed to fetch models', { status: 500 });
    }
}; 