<!--TODO: if switch between context spaces, load new context and update currentChoiceIndices for nodes which are part of the context space-->
<!-- TODO: cdontext panes should be deletable -->
<!-- TODO: if node doesn exist anymore show tomb placeholder -->
<!-- TODO: this is super annoying, because i basically need redo/undo to save different states of the context space which is ughhhhhh also becasue someone might change the whiteboard in the maning time. persistence and versioning is horrot!-->

<!--
    Context Pane Component
    - Shows the current context space and its nodes
    - Allows switching between different context spaces
    - Provides actions for managing context spaces
-->
<script lang="ts">
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import {
		contextStore,
		addContextSpace,
		deleteContextSpace,
		duplicateContextSpace
	} from '$lib/stores/context.svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Pagination } from '$lib/components/ui/pagination_';
	import {
		MoreVerticalIcon,
		PlusIcon,
		PencilIcon,
		CopyIcon,
		TrashIcon
	} from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import { nodesStore } from '$lib/stores/nodes.svelte';
	import ContextItem from './context-item.svelte';
	import {
		DndContext,
		DragOverlay,
		type DragEndEvent,
		type DragStartEvent
	} from '@dnd-kit-svelte/core';
	import {
		SortableContext,
		arrayMove
	} from '@dnd-kit-svelte/sortable';

	// State
	let totalContextSpaces = $derived(contextStore.spaces.length);
	let currentContextSpaceIndex = $derived(contextStore.currentSpaceIndex);
	let currentContextSpace = $derived(contextStore.spaces[currentContextSpaceIndex]);
	let activeId = $state<string | null>(null);
	const activeNode = $derived(currentContextSpace.nodeDependencies.find(dep => dep.nodeId === activeId));

	function handleAddContext(e: Event) {
		e.stopPropagation();
		addContextSpace();
	}

	function handleDuplicate(e: Event) {
		e.stopPropagation();
		duplicateContextSpace(currentContextSpaceIndex);
	}

	function handleRename(e: Event) {
		e.stopPropagation();
		// TODO: implement
		toast.info('Not implemented yet');
	}

	function handleDelete(e: Event) {
		e.stopPropagation();
		// TODO: do we need to ask for confirmation?
		deleteContextSpace(currentContextSpaceIndex);
	}

	function handleDragStart(event: DragStartEvent) {
		activeId = event.active.id as string;
	}

	function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event;
		
		if (over && active.id !== over.id) {
			const oldIndex = currentContextSpace.nodeDependencies.findIndex(
				dep => dep.nodeId === active.id
			);
			const newIndex = currentContextSpace.nodeDependencies.findIndex(
				dep => dep.nodeId === over.id
			);

			contextStore.spaces[currentContextSpaceIndex] = {
				...currentContextSpace,
				nodeDependencies: arrayMove(currentContextSpace.nodeDependencies, oldIndex, newIndex)
			};
		}
		
		activeId = null;
	}

	function handleRemoveNode(nodeId: string) {
		const newDeps = currentContextSpace.nodeDependencies.filter(
			dep => dep.nodeId !== nodeId
		);
		contextStore.spaces[currentContextSpaceIndex] = {
			...currentContextSpace,
			nodeDependencies: newDeps
		};
	}

	function handleToggleVisibility(nodeId: string) {
		const newDeps = currentContextSpace.nodeDependencies.map(dep => {
			if (dep.nodeId === nodeId) {
				return {
					...dep,
					hidden: !dep.hidden
				};
			}
			return dep;
		});
		contextStore.spaces[currentContextSpaceIndex] = {
			...currentContextSpace,
			nodeDependencies: newDeps
		};
	}
</script>

<div class="flex flex-col h-full" data-testid="context-pane">
	<!-- Header -->
	<div class="flex items-center justify-between h-12 px-4 bg-background border-b">
		<!-- Left: Title -->
		<div class="flex items-center gap-2 w-24">
			<h2 class="text-sm font-medium">Context</h2>
		</div>

		<!-- Center: Context Name & Pagination -->
		<div class="grow flex items-center justify-center gap-4">
			<span class="text-sm text-muted-foreground leading-normal">{currentContextSpace.title}</span>
			<Pagination
				currentIdx={currentContextSpaceIndex}
				total={totalContextSpaces}
				onNext={() => contextStore.currentSpaceIndex = currentContextSpaceIndex + 1}
				onPrev={() => contextStore.currentSpaceIndex = currentContextSpaceIndex - 1}
			/>
		</div>

		<!-- Right: Actions -->
		<!-- TODO: for this to work as i want it, the nodes need to update the choiceIndex when i load a new context space, until then its diabled		-->
		<div class="flex items-center justify-end w-24 gap-1">
			<Button
				variant="ghost"
				size="icon"
				class="size-6"
				disabled
				onclick={handleAddContext}
			>
				<PlusIcon />
			</Button>

			<DropdownMenu.Root>
				<DropdownMenu.Trigger class={buttonVariants({variant: 'ghost', size: 'icon', class: 'size-6'})}>
					<MoreVerticalIcon />
				</DropdownMenu.Trigger>
				<DropdownMenu.Content align="end" class="w-40">
					<DropdownMenu.Item onclick={handleRename}>
						<PencilIcon />
						<span>Rename</span>
					</DropdownMenu.Item>
					<DropdownMenu.Item onclick={handleDuplicate}>
						<CopyIcon />
						<span>Duplicate</span>
					</DropdownMenu.Item>
					<DropdownMenu.Separator />
					<!--	TODO: title not shown when disabled	-->
					<DropdownMenu.Item onclick={handleDelete} class="!text-destructive" disabled={totalContextSpaces === 1}
														 title={totalContextSpaces === 1 ? 'Cannot delete the last context space' : ''}>
						<TrashIcon />
						<span>Delete</span>
					</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>
	</div>

	<!-- Content -->
	{#if currentContextSpace.nodeDependencies.length === 0}
		<div class="grow overflow-y-auto p-4">
			<!-- This height was chosen to match the placeholder height in the response pane -->
			<div class="flex flex-col items-center justify-center h-[calc(100vh-14rem)] text-center text-muted-foreground">
				<p class="text-sm max-w-[12rem]">
					Click on the plus of a node in the whiteboard pane to add it to the current context space.
				</p>
			</div>
		</div>
	{:else}
		<!-- TODO:
            - display deleted nodes as card with tombstone icon and short info plus remove button
            - implement card,
            - with drag and drop
            - a x to remove from card
            - use fade for nice animation
            - show title
            - show id
            - click to highlight node in whiteboard
            - click to center node in whiteboard
            - click to expand node in context (does that make sense)
            - show nodeType -->
		<ScrollArea class="grow">
			<div class="p-4">
				<DndContext 
					onDragStart={handleDragStart}
					onDragEnd={handleDragEnd}
				>
					<SortableContext
						items={currentContextSpace.nodeDependencies.map(dep => dep.nodeId)}
					>
						{#each currentContextSpace.nodeDependencies as nodeDependency (nodeDependency.nodeId)}
							{@const node = $nodesStore.find(node => node.id === nodeDependency.nodeId) ?? null}
							<ContextItem
								{node}
								nodeId={nodeDependency.nodeId}
								choiceIndex={nodeDependency.choiceIndex}
								isHidden={nodeDependency.hidden}
								onRemove={() => handleRemoveNode(nodeDependency.nodeId)}
								onToggleVisibility={() => handleToggleVisibility(nodeDependency.nodeId)}
							/>
						{/each}
					</SortableContext>

					<DragOverlay>
						{#if activeId && activeNode}
							{@const node = $nodesStore.find(node => node.id === activeNode.nodeId) ?? null}
							<ContextItem
								{node}
								nodeId={activeNode.nodeId}
								choiceIndex={activeNode.choiceIndex}
								isHidden={activeNode.hidden}
								onRemove={() => handleRemoveNode(activeNode.nodeId)}
								onToggleVisibility={() => handleToggleVisibility(activeNode.nodeId)}
								isDragging={true}
							/>
						{/if}
					</DragOverlay>
				</DndContext>
			</div>
		</ScrollArea>
	{/if}
</div>