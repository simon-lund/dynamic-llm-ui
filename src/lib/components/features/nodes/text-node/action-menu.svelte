<script lang="ts">
	import { CopyIcon, MoreVerticalIcon, PencilIcon, TrashIcon } from 'lucide-svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { buttonVariants } from '$lib/components/ui/button';
	import * as actions from './actions.svelte';
	import EditNodeDialog from './edit-node-dialog.svelte';
	import DeleteNodeDialog from './delete-node-dialog.svelte';

	type TProps = {
		nodeId: string,
	}

	const { nodeId }: TProps = $props();

	// Bindings
	let editDialogOpen = $state(false);
	let deleteDialogOpen = $state(false);

	// Handlers
	function handleDuplicate(e: Event) {
		e.stopPropagation();
		actions.duplicateNode(nodeId);
	}

	function openEditDialog(e: Event) {
		e.stopPropagation();
		editDialogOpen = true;
	}

	function openDeleteDialog(e: Event) {
		e.stopPropagation();
		deleteDialogOpen = true;
	}
</script>

<EditNodeDialog {nodeId} bind:open={editDialogOpen} />
<DeleteNodeDialog {nodeId} bind:open={deleteDialogOpen}/>

<DropdownMenu.Root>
	<DropdownMenu.Trigger class={buttonVariants({variant: 'ghost', size: 'icon', class: 'size-6'})} title="More actions">
		<MoreVerticalIcon />
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="end" class="w-40">
		<DropdownMenu.Item onclick={openEditDialog}>
			<PencilIcon />
			<span>Edit</span>
		</DropdownMenu.Item>
		<DropdownMenu.Item onclick={handleDuplicate}>
			<CopyIcon />
			<span>Duplicate</span>
		</DropdownMenu.Item>
		<DropdownMenu.Separator />
		<DropdownMenu.Item class=" !text-destructive" onclick={openDeleteDialog}>
			<TrashIcon />
			<span>Delete</span>
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>

