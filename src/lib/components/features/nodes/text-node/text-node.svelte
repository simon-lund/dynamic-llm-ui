<!-- Text Node Component
     - A node that displays text content with multiple choices (Choice = Term for a version/variant of the content)
     - The user can switch between choices using the pagination controls
     - The user can expand/collapse the node to show/hide the content
     - The user can add the node to the context space
     - The user can perform additional actions using the action menu
-->

<!--
	TODO: Component Improvements

	- Header Design:
		- Fix disabled plus button tooltip not showing when button is disabled
		- Add a button to show usages (i.e. go to the next context where this node is used)

	- Resize Functionality:
		- Add resize handle in bottom-right corner
		- Allow users to drag to resize the node
		- Consider min/max width constraints
		- Save size in node data for persistence
		- Add visual indicator for resizable corner
		- Consider using a resize observer to handle content reflow (also for collapsible nodes)

	- Animate Choice Switching (typewriter or slide effect)
-->

<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import {
		ChevronDownIcon,
		ChevronUpIcon,
		PlusIcon
	} from 'lucide-svelte';
	import { cn } from '$lib/utils';
	import { Pagination } from '$lib/components/ui/pagination_';
	import * as actions from './actions.svelte';
	import type { TData } from './schema';
	import NewNodeDialog from './new-node-dialog.svelte';
	import ActionMenu from './action-menu.svelte';
	import { marked } from 'marked';
	import { contextStore } from '$lib/stores/context.svelte';

	type TProps = {
		id: string;
		selected: boolean;
		data: TData;
	};

	const { id: nodeId, selected, data }: TProps = $props();

	// Configure marked options
	marked.setOptions({
		gfm: true,
		breaks: true
	});

	// State
	const currentChoice = $derived(data.choices[data.currentChoiceIndex]);
	let isNewNode = $state(false);

	// TODO: we have this quite a few times, can we encapsulate this somehow? (probarbly just move to the store file)
	let contextSpaces = $derived(contextStore.spaces);
	let currentContextSpaceIndex = $derived(contextStore.currentSpaceIndex);
	const isInContextSpace = $derived(contextSpaces[currentContextSpaceIndex].nodeDependencies.map(({ nodeId }) => nodeId).includes(nodeId));

	// Handlers
	function handlePrev(e: Event) {
		e.stopPropagation();
		actions.switchChoice(nodeId, data.currentChoiceIndex - 1);
	}

	function handleNext(e: Event) {
		e.stopPropagation();
		actions.switchChoice(nodeId, data.currentChoiceIndex + 1);
	}

	function addNodeToContextSpace(e: Event) {
		e.stopPropagation();
		actions.addNodeToContextSpace(nodeId);
	}

	function toggleNodeExpansion(e: Event) {
		e.stopPropagation();
		actions.updateNodeData(nodeId, { isExpanded: !data.isExpanded });
	}

	// Effects
	$effect(() => {
			// Since open can't be a derived store (must be bindable), we need to use an effect to update it
			if (data.choices.length === 0) {
				isNewNode = true;
			} else {
				isNewNode = false;
			}
		}
	);
</script>

<!-- TODO: adapt widht -->
<!-- TODO: adapt max-height (should have default max-heidght, which can be increased by resizing -->

{#if isNewNode}
	<NewNodeDialog {nodeId} bind:open={isNewNode} />
{:else}
	<!-- TODO: use svelte flow for width so we can resize the node, with min/max width constraints -->
	<Card.Root class={cn("w-[400px] overflow-hidden relative", selected && 'ring-2 ring-primary')}
						 aria-selected={selected}>
		<Card.Header class="flex-row !space-y-0 items-center justify-center p-4">
			<!-- Left side: ID and generatedBy badge -->
			<div class="flex items-center w-24 justify-start gap-2">
				<span class="text-sm leading-normal text-muted-foreground">#{nodeId}</span>
				<Badge variant={data.generatedBy === 'user' ? 'secondary' : 'default'}>
					{data.generatedBy === 'user' ? 'User' : 'Response'}
				</Badge>
			</div>

			<!-- Center: Choice Pagination -->
			<div class="grow flex items-center justify-center">
				<Pagination currentIdx={data.currentChoiceIndex} total={data.choices.length} onPrev={handlePrev}
										onNext={handleNext} />
			</div>

			<!-- Right side: Node actions -->
			<div class="flex items-center justify-end w-24">
				<div class="inline-flex items-center gap-0.5">
					<!--	Add to context action -->
					<!--	Extra margin to align spacing with perceived 'weight distribution' between filled and ghost buttons -->
					<!-- TODO: fix title not showing when button is disabled -->
					<!-- TODO: instead of disabling it, turn it into a minus icon to remove it from the context -->
					<Button
						size="icon"
						class="size-6 mr-1"
						onclick={addNodeToContextSpace}
						title={isInContextSpace ? "This element is already in the context, duplicate it to add again" : "Add to context"}
						disabled={isInContextSpace}
					>
						<PlusIcon />
					</Button>

					<!--	Expand/Collapse action -->
					<Button
						variant="ghost"
						size="icon"
						class="size-6"
						onclick={toggleNodeExpansion}
						title={data.isExpanded ? "Collapse" : "Expand"}
					>
						{#if data.isExpanded}
							<ChevronUpIcon />
						{:else}
							<ChevronDownIcon />
						{/if}
					</Button>

					<!--	Others actions -->
					<ActionMenu {nodeId} />
				</div>
			</div>
		</Card.Header>
		<Card.Content class="p-0">
			<!-- Title -->
			<Card.Title level={3} class={cn("px-4 pb-2 border-b", data.isExpanded && 'truncate')}>
				{currentChoice?.title}
			</Card.Title>

			<!-- Content -->
			<Card.Description class="p-4 pt-3">
				<!-- TODO: rpelace with good markdown styling -->
				<!-- TODO: we shoujld probably add AreaScroll here and not jsut extend and etend node				-->
				<!-- TODO: shis should be its own cmponetns -->
				<div class="prose prose-sm dark:prose-invert max-w-none [&>:first-child]:mt-0 [&>:last-child]:mb-0">
					<div
						class={cn("[&_p+p]:mt-3 [&_h2]:mt-6 [&_h3]:mt-4 [&_ul]:my-3 [&_ol]:my-3 [&_blockquote]:my-3 [&_pre]:my-3", !data.isExpanded && 'line-clamp-2')}>
						{@html marked(currentChoice?.text ?? '')}

					</div>
				</div>
			</Card.Description>
		</Card.Content>
	</Card.Root>
{/if}

<!-- TODO: maybe we just add typography prose? from tailwind css hmmm-->
<!-- TODO: move to global css -->
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


