<!-- Edit Dialog for Text Node
	Two-step process:
	1. Choose whether to edit in place or create new choice
	2. Edit title and content with document-like interface
-->
<script lang="ts">
	import * as Alert from '$lib/components/ui/alert';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { fade } from 'svelte/transition';
	import * as actions from './actions.svelte';
	import { CircleAlertIcon } from 'lucide-svelte';

	type TProps = {
		nodeId: string;
		open: boolean;
	};

	let { nodeId, open = $bindable<boolean>() }: TProps = $props();

	// State
	// If editingMethod === null, user is shown step 1 to choose edit type
	let editingMethod: 'in-place' | 'new' | undefined = $state();
	let editedTitle: string | undefined = $state();
	let editedContent: string | undefined = $state();
	let errorText: string | undefined = $state();

	// Handlers
	function handleSave(e: Event) {
		e.stopPropagation();
		if (!editedTitle?.trim() || !editedContent?.trim()) {
			errorText = 'Neither title nor content can be empty.';
			return;
		}

		const node = actions.getNode(nodeId);
		if (editingMethod === 'in-place') {
			actions.updateChoice(nodeId, node.data.currentChoiceIndex, editedTitle, editedContent);
		} else if (editingMethod === 'new') {
			actions.addChoice(nodeId, editedTitle.trim(), editedContent.trim());
			actions.switchChoice(nodeId, node.data.choices.length - 1);
		}
		open = false;
	}

	// Effects
	$effect(() => {
		// Effect triggers on state change, i.e. we check the 'new' state value
		// If dialog was opened, load editor state
		if (open) {
			const node = actions.getNode(nodeId);
			const currentChoice = node.data.choices[node.data.currentChoiceIndex];
			editedTitle = currentChoice.title;
			editedContent = currentChoice.text;
		} else {
			// Vice versa, if dialog was closed, reset state
			editingMethod = undefined;
			editedTitle = undefined;
			editedContent = undefined;
			errorText = undefined;
		}
	});
</script>

<!-- TODO: weird cursor behavior show text edit cursor -->
<Dialog.Root bind:open>
	<Dialog.Content>
		{#if editingMethod === undefined}
			<Dialog.Header>
				<Dialog.Title>Choose Editing Method</Dialog.Title>
				<Dialog.Description>
					Choose how you want to edit this node's content.
				</Dialog.Description>
			</Dialog.Header>
			<div class="space-y-4">
				<p class="text-sm">
					Editing in-place affects all context spaces. Use a new variant to keep the original content.
					Edit in-place for minor fixes or typos.
				</p>
				<Card.Root
					class="cursor-pointer transition-all hover:bg-accent/50 hover:border-accent-foreground/20"
					onclick={() => editingMethod = 'new'}
				>
					<Card.Header class="p-4">
						<Card.Title>
							New Variant
						</Card.Title>
						<Card.Description>
							Create a new variant of this node. Great for heavy edits.
						</Card.Description>
					</Card.Header>
				</Card.Root>
				<Card.Root
					class="cursor-pointer transition-all hover:bg-accent/50 hover:border-accent-foreground/20"
					onclick={() => editingMethod = 'in-place'}
				>
					<Card.Header class="p-4">
						<Card.Title>
							In-Place
						</Card.Title>
						<Card.Description>
							Edit content in place. Great for fixing typos or small changes.
						</Card.Description>
					</Card.Header>
				</Card.Root>
			</div>
		{:else}
			<div in:fade={{duration: 150}}>
				<Dialog.Header>
					<Dialog.Title>Edit Node</Dialog.Title>
					<Dialog.Description>
						{#if editingMethod === 'in-place'}
							You are editing this node in place. Changes will be reflected in all context spaces.
						{:else if editingMethod === 'new'}
							You are creating a new variant of this node. Changes will not affect the original variant.
						{/if}
					</Dialog.Description>
				</Dialog.Header>
				<div class="grid gap-4 py-4">
					<div class="grid gap-2">
						<Label for="title">Title</Label>
						<Input
							id="title"
							bind:value={editedTitle}
							placeholder="Enter a title..."
						/>
					</div>
					<div class="grid gap-2">
						<Label for="content">Content</Label>
						<div class="relative">
							<Textarea
								id="content"
								bind:value={editedContent}
								class="min-h-[200px] resize-y font-mono text-sm leading-relaxed"
								placeholder="Enter your content here..."
							/>
							<div class="absolute bottom-2 right-2 text-xs text-muted-foreground">
								{editedContent?.length ?? 0} characters
							</div>
						</div>
					</div>
				</div>
				<!-- TODO: probably not accessible, do we need superforms & formsnap? -->
				{#if errorText}
					<Alert.Root variant="destructive">
						<CircleAlertIcon class="size-4" />
						<Alert.Title>Error</Alert.Title>
						<Alert.Description>
							{errorText}
						</Alert.Description>
					</Alert.Root>
				{/if}
			</div>
		{/if}
		<Dialog.Footer>
			<Dialog.Close>Cancel</Dialog.Close>
			<Button variant="default" onclick={handleSave} disabled={!editingMethod}>Save Changes</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>