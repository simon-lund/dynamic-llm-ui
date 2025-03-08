import type { TCompletionRequest, TCompletionResponse } from '$lib/components/features/response-pane/schema';

export async function generateTitle(content: string): Promise<string> {
		const res = await fetch(`/api/llm/gen-title?content=${encodeURIComponent(content)}`);

		if (!res.ok) throw new Error('Failed to generate title. Please try again.');

		return await res.text();
}

export async function listModels() {
	const res = await fetch('/api/llm/models');

	if (!res.ok) throw new Error('Failed to load models');

	return await res.json();
}

export async function generateResponse(context: TCompletionRequest['context'], model: string) {
	const res = await fetch('/api/llm/completion', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			model,
			context,
			temperature: 0.7
		})
	});

	if (!res.ok) throw new Error('Failed to generate response');

	return await res.json() as Promise<TCompletionResponse>;
}