<script lang="ts">
	import { writable } from 'svelte/store';
	import {
		SvelteFlow,
		Controls,
		Background,
		BackgroundVariant,
		type NodeTypes
	} from '@xyflow/svelte';
	import '@xyflow/svelte/dist/style.css';
	import { nodesStore } from '$lib/stores/nodes.svelte.js';
	import { PlusIcon, FileTextIcon, MessageSquareIcon } from 'lucide-svelte';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { TextNode, addTextNode } from '$lib/components/features/nodes';

	// Node types mapping
	const nodeTypes: NodeTypes = {
		text: TextNode
	};

	// We don't use edges yet, but we need to pass it to the SvelteFlow component to avoid a warning
	const edges = writable<never[]>([]);

	// TODO: new nodes should be added at the center of the viewport instead of fixed position (calcluate based on node size)
	// TODO: add switch fixed grid vs free flow
	// TODO: add clean up button to organize nodes into a grid (maybe use ai to cluster)
	// TODO: rework new node creation -> should be open dialog -> on save create node but allow cancel
</script>

<div class="flex flex-col h-dvh w-full" data-testid="whiteboard-pane">
	<div class="flex items-center justify-between h-12 px-4 bg-background border-b gap-8">
		<h2 class="text-sm font-medium">Whiteboard</h2>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger class={buttonVariants({ size: 'sm', variant: 'outline' })}>
				<PlusIcon />
				<span>Add Node</span>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="end" class="w-56">
				<DropdownMenu.Group>
					<DropdownMenu.Label>Node type</DropdownMenu.Label>
					<DropdownMenu.Separator />
					<DropdownMenu.Item onclick={addTextNode}>
						<MessageSquareIcon />
						<span>Text Node</span>
					</DropdownMenu.Item>
					<DropdownMenu.Item disabled>
						<FileTextIcon />
						<span>File Node (Coming soon)</span>
					</DropdownMenu.Item>
				</DropdownMenu.Group>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>
	<div class="grow">
		<!-- TODO: Add attribution={false} once we have a pro license -->
		<SvelteFlow
			nodes={nodesStore}
			{edges}
			{nodeTypes}
			fitView
			nodesConnectable={false}
		>
			<Controls />
			<Background variant={BackgroundVariant.Dots} />
		</SvelteFlow>
	</div>
</div>


