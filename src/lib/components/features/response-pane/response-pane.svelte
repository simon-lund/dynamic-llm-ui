<!--
    Response Pane Component
    - Shows the AI response based on the current context
    - Allows switching between different responses via floating menu
    - Provides actions for regeneration, adding to whiteboard, and clearing
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import { Pagination } from '$lib/components/ui/pagination_';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { marked } from 'marked';
	import {
		RefreshCcwIcon,
		PlusSquareIcon,
		SparklesIcon,
		TrashIcon
	} from 'lucide-svelte';
	import { Separator } from '$lib/components/ui/separator';
	import { addTextNode } from '$lib/components/features/nodes';
	import * as Select from '$lib/components/ui/select';
	import type { TChoice, TUnregisteredTextNode } from '$lib/components/features/nodes/text-node/schema';
	import type { TCompletionRequest } from './schema';
	import * as api from '$lib/api';
	import { getCurrentContextSpace } from '$lib/stores/context.svelte';
	import { getNode } from '$lib/stores/nodes.svelte';

	// Configure marked options
	marked.setOptions({
		gfm: true,
		breaks: true
	});

	// State
	let availableModels = $state<string[]>([]);
	let selectedModel = $state<string>();
	let isLoading = $state(false);
	let responses: TChoice[] = $state([]);
	let hasResponses = $derived(responses.length > 0);
	let currentResponseIndex = $state(0);
	let currentResponse = $derived(responses[currentResponseIndex]);

	// Handlers
	async function handleGenerateResponse() {
		isLoading = true;

		const currentContextSpace = getCurrentContextSpace();
		if (currentContextSpace.nodeDependencies.length === 0) {
			toast.error('Please configure context before generating a response');
		}


		const llmContext = currentContextSpace.nodeDependencies.map((nodeDependency) => {
			// This happens when a node was deleted but is still referenced in the context space
			let node;
			try {
				node = getNode(nodeDependency.nodeId);
			} catch {
				return null;
			}

			// Also ignore nodes that are hidden
			if (nodeDependency.hidden) {
				return null;
			}

			const choice = node.data.choices[nodeDependency.choiceIndex];

			let role = '';
			switch (node.data.generatedBy) {
				case 'user':
					role = 'user';
					break;
				case 'ai':
					role = 'assistant';
					break;
				default:
					throw new Error('Invalid generatedBy value');
			}

			return {
				role,
				content: choice.text
			};
		}).filter((context) => context !== null) as TCompletionRequest['context'];

		try {
			const { content: text } = await api.generateResponse(llmContext, selectedModel as string);
			const title = (await api.generateTitle(text));

			responses = [...responses, {
				title: title.trim(),
				text: text.trim(),
				model: selectedModel as string,
				timestamp: Date.now()
			}];
			currentResponseIndex = responses.length - 1;
		} catch (e) {
			console.log('Failed to generate response: ', e);
			toast.error('Failed to generate response. Please try again.');
		} finally {
			isLoading = false;
		}
	}

	function handleSave() {
		const data: Partial<TUnregisteredTextNode['data']> = {
			generatedBy: 'ai',
			choices: responses,
			currentChoiceIndex: currentResponseIndex
		};
		addTextNode(data);
	}

	function handleClear() {
		responses = [];
		currentResponseIndex = 0;
	}

	// Lifecycle
	onMount(async () => {
		// Load available models
		const { models } = await api.listModels();
		availableModels = models;
		if (availableModels.length === 0) throw new Error('No models available');

		console.log(availableModels);

		// Set default model
		selectedModel = availableModels[0];

		// Blablador specific alias for fast model
		// https://sdlaml.pages.jsc.fz-juelich.de/ai/guides/blablador_api_access/#model-aliases
		if (availableModels.includes('alias-fast')) selectedModel = 'alias-fast';
	});
</script>

<div class="flex flex-col h-full relative" data-testid="response-pane">
	<!-- Header -->
	<div class="flex items-center justify-between min-h-12 h-12 px-4 bg-background border-b gap-8">
		<h2 class="text-sm font-medium">Response</h2>
		<Select.Root type="single" bind:value={selectedModel}>
			<Select.Trigger class="w-[240px]">
				<span class="truncate">{selectedModel}</span>
			</Select.Trigger>
			<Select.Content>
				{#each availableModels as model (model)}
					<Select.Item value={model}>
						{model}
					</Select.Item>
				{/each}
			</Select.Content>
		</Select.Root>
	</div>

	<!-- Content -->
	<ScrollArea class="grow">
		{#if isLoading}
			<div class="p-6">
				<div class="space-y-4">
					<Skeleton class="h-6 w-2/3" />
					<div class="space-y-2">
						<Skeleton class="h-4 w-full" />
						<Skeleton class="h-4 w-[95%]" />
						<Skeleton class="h-4 w-[90%]" />
					</div>
					<div class="space-y-2">
						<Skeleton class="h-4 w-[88%]" />
						<Skeleton class="h-4 w-[92%]" />
						<Skeleton class="h-4 w-[85%]" />
					</div>
				</div>
			</div>
		{:else if hasResponses}
			<div class="relative">
				<!-- Sticky Response Header -->
				<div class="sticky top-0 px-6 py-4 bg-background/90 backdrop-blur-sm border-b">
					<h3 class="text-base font-medium">{currentResponse.title}</h3>
				</div>
				<!-- Response Content -->
				<div class="px-6 pt-4 pb-24">
					<!-- TODO: use global style and componetn to remvoe this styling from componetn -->
					<div class="prose prose-sm dark:prose-invert max-w-none [&>:first-child]:mt-0 [&>:last-child]:mb-0">
						<!-- TODO: Make sure this is secure and does not lead to XSS attack						-->
						<!-- TODO: Make sure its save html, here and in tex-tnode	-->
						<div
							class="[&_p+p]:mt-3 [&_h2]:mt-6 [&_h3]:mt-4 [&_ul]:my-3 [&_ol]:my-3 [&_blockquote]:my-3 [&_pre]:my-3">{@html marked(currentResponse.text)}</div>
					</div>
				</div>
			</div>
		{:else}
			<!-- This height was chosen to match the placeholder height in the context pane -->
			<div class="flex flex-col items-center justify-center h-[calc(100vh-10rem)] text-center gap-4">
				<p class="text-sm text-muted-foreground max-w-[12rem]">
					Configure your context and click on the button below to generate a response.
				</p>
				<div class="min-h-10">
					<Button onclick={handleGenerateResponse}>
						<SparklesIcon />
						<span>Generate</span>
					</Button>
				</div>
			</div>
		{/if}
	</ScrollArea>

	<!-- Floating Menu -->
	{#if hasResponses}
		<div
			class="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-2 bg-background/90 backdrop-blur-lg border rounded-lg shadow-lg">
			<Pagination
				currentIdx={currentResponseIndex}
				total={responses.length}
				onPrev={() => currentResponseIndex = currentResponseIndex - 1}
				onNext={() => currentResponseIndex = currentResponseIndex + 1}
			/>
			<Separator orientation="vertical" class="h-6" />
			<Button
				variant="ghost"
				size="icon"
				class="h-8 w-8"
				onclick={handleGenerateResponse}
				title="Regenerate"
				disabled={isLoading}
			>
				<RefreshCcwIcon />
			</Button>
			<Button
				variant="ghost"
				size="icon"
				class="h-8 w-8"
				onclick={handleSave}
				title="Add to whiteboard"
				disabled={isLoading}
			>
				<PlusSquareIcon />
			</Button>
			<Button
				variant="ghost"
				size="icon"
				class="h-8 w-8 text-destructive"
				onclick={handleClear}
				title="Clear responses"
				disabled={isLoading}
			>
				<TrashIcon />
			</Button>
		</div>
	{/if}
</div>

<!-- TODO: Are there other block that we need to style? e.g. headings, see styling of tex-tnode -->
<style>
    /* Adjust code block styling */
    :global(.prose pre) {
        background-color: hsl(var(--muted));
        padding: 1rem;
        border-radius: 0.5rem;
        margin: 1rem 0;
    }

    :global(.prose code) {
        background-color: hsl(var(--muted));
        padding: 0.2em 0.4em;
        border-radius: 0.25rem;
        font-size: 0.875em;
    }

    :global(.prose pre code) {
        background-color: transparent;
        padding: 0;
        border-radius: 0;
    }

    /* Adjust blockquote styling */
    :global(.prose blockquote) {
        border-left: 3px solid hsl(var(--border));
        padding-left: 1rem;
        font-style: italic;
        color: hsl(var(--muted-foreground));
    }
</style>
