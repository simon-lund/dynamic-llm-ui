<script lang="ts">
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import * as actions from './actions.svelte';

	type TProps = {
		nodeId: string;
		open: boolean;
	}

	let { nodeId, open = $bindable<boolean>() }: TProps = $props();

	// TODO: get the number of context space dependencies from the store
	// The number of contexts that depend on this node
	const numContextSpaceDependencies = 0;

	function handleDelete(e: Event) {
		e.preventDefault();
		actions.deleteNode(nodeId);
		open = false;
	}
</script>

<AlertDialog.Root bind:open>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>
				Delete Node
			</AlertDialog.Title>
			<AlertDialog.Description>
				{#if numContextSpaceDependencies > 0}
					This node is used in <span class="font-bold">{numContextSpaceDependencies}</span>
					context{numContextSpaceDependencies === 1 ? '' : 's'}.
					Deleting it will remove it from all contexts.
				{:else}
					This node is safe to delete.
				{/if}
				This action cannot be undone.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action class="bg-red-500 hover:bg-red-600 text-white" onclick={handleDelete}>
				Delete Node
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
