<script lang="ts">
	import '../app.css';
	import { Toaster } from "$lib/components/ui/sonner";

	let { children } = $props();
</script>

<svelte:head>
	<title>Context UI | Experimental</title>
	<meta name="description" content="Dynamic interface for LLMs with adaptable context" />
</svelte:head>

<Toaster />

{@render children()}