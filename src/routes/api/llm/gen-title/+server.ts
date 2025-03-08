import { text, error, type RequestEvent } from '@sveltejs/kit';
import { generateTitle } from '$lib/server/llm';

export async function GET({ url }: RequestEvent) {
    const content = url.searchParams.get('content');
    
    if (!content) {
        throw error(400, 'Content parameter is required');
    }

    try {
        const title = await generateTitle(content);
        return text(title);
    } catch (e) {
        console.error('Failed to generate title:', e);
        throw error(500, 'Failed to generate title');
    }
}