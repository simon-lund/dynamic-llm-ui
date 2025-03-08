<script lang="ts">
	import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { cn } from '$lib/utils';

	type TProps = {
		currentIdx: number
		total: number
		onPrev: (e: Event) => void
		onNext: (e: Event) => void
	}

	const { currentIdx, total, onNext, onPrev }: TProps = $props();
</script>

<div class={cn("inline-flex items-center gap-x-0.5")} aria-label="Pagination">
	<Button
		variant="ghost"
		size="icon"
		class={cn("h-4 w-4")}
		onclick={onPrev}
		title="Previous choice"
		disabled={currentIdx === 0}
	>
		<ChevronLeftIcon />
	</Button>
	<div class="text-sm leading-normal text-nowrap text-muted-foreground">
		{currentIdx + 1}
		<span aria-label="of">/</span>
		{total || 1}
	</div>
	<Button
		variant="ghost"
		size="icon"
		class={cn("h-4 w-4")}
		onclick={onNext}
		title="Next choice"
		disabled={currentIdx >= total - 1}
	>
		<ChevronRightIcon />
	</Button>
</div>