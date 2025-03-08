<!-- Context Item Component -->
<script lang="ts">
    import { Badge } from '$lib/components/ui/badge';
    import { ScrollArea } from '$lib/components/ui/scroll-area';
    import { marked } from 'marked';
    import { ChevronDown, ChevronUp, X, GripVertical, EyeIcon, EyeOffIcon } from 'lucide-svelte';
    import { useSortable } from '@dnd-kit-svelte/sortable';

    interface TNode {
        id: string;
        data: {
            choices: Array<{
                title: string;
                text: string;
            }>;
            generatedBy?: string;
        };
    }

    // TODO: only the text should be greyed out
    // TODO: actions should always be shown
    const { node, nodeId, choiceIndex, onRemove, onToggleVisibility, isHidden = false, isDragging = false }: {
        node: TNode | null;
        nodeId: string;
        choiceIndex: number;
        onRemove: () => void;
        onToggleVisibility: () => void;
        isHidden?: boolean;
        isDragging?: boolean;
    } = $props();

    let isExpanded = $state(false);

    const title = $derived(node?.data.choices[choiceIndex].title || 'Deleted Node');
    const content = $derived(node?.data.choices[choiceIndex].text || '');
    const isTombstone = $derived(!node);

    const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSortableDragging } = useSortable({ id: nodeId });
    
    let style = '';
    $effect(() => {
        if (!transform?.current) return;
        
        const x = transform.current.x ?? 0;
        const y = transform.current.y ?? 0;
        
        style = `
            transform: translate3d(${x}px, ${y}px, 0);
            transition: ${transition?.current || ''};
            z-index: ${isSortableDragging.current ? 10 : 'auto'};
        `;
    });
</script>

<div 
    use:setNodeRef
    class="group relative border rounded-md bg-card p-3 mb-2 transition-all touch-none select-none hover:border-border"
    class:shadow-md={isDragging}
    class:hidden-item={isHidden}
    {style}
>
    <!-- Content - becomes invisible during drag but maintains dimensions -->
    <div class:invisible={isSortableDragging.current}>
        <!-- Header -->
        <div class="flex items-start justify-between gap-2">
            <div class="flex items-start gap-2">
                <div 
                    class="cursor-grab touch-none flex items-center justify-center text-muted-foreground hover:text-foreground mt-0.5" 
                    data-handle
                    {...attributes.current} 
                    {...listeners.current}
                >
                    <GripVertical class="size-4" />
                </div>
                <div class="flex-1 min-w-0">
                    <!-- Title -->
                    <h3 class="text-sm font-medium truncate leading-tight">{title}</h3>
                    
                    <!-- Node ID & Badge -->
                    <div class="flex items-center gap-2 mt-0.5">
                        <span class="text-xs text-muted-foreground font-mono">#{nodeId}</span>
                        {#if !isTombstone && node}
                            <Badge variant="secondary" class="text-[10px] px-1 py-0 h-4">
                                {node.data.generatedBy || 'Manual'}
                            </Badge>
                        {/if}
                        {#if isHidden}
                            <Badge variant="outline" class="text-[10px] px-1 py-0 h-4 border-dashed">
                                Hidden
                            </Badge>
                        {/if}
                    </div>
                </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-1">
                <button
                    class="size-6 flex items-center justify-center hover:text-foreground"
                    class:text-primary={isHidden}
                    class:text-muted-foreground={!isHidden}
                    onclick={onToggleVisibility}
                    title={isHidden ? "Show" : "Hide"}
                >
                    {#if isHidden}
                        <EyeOffIcon class="size-4" />
                    {:else}
                        <EyeIcon class="size-4" />
                    {/if}
                </button>
                <button
                    class="size-6 flex items-center justify-center text-muted-foreground hover:text-destructive"
                    onclick={onRemove}
                    title="Remove"
                >
                    <X class="size-4" />
                </button>
                <button
                    class="size-6 flex items-center justify-center text-muted-foreground hover:text-foreground"
                    onclick={() => isExpanded = !isExpanded}
                    title={isExpanded ? "Collapse" : "Expand"}
                >
                    {#if isExpanded}
                        <ChevronUp class="size-4" />
                    {:else}
                        <ChevronDown class="size-4" />
                    {/if}
                </button>
            </div>
        </div>

        <!-- Content -->
        {#if isExpanded}
            <div class="mt-2 pt-2 border-t">
                <ScrollArea class="h-[150px]">
                    <div class="prose prose-sm dark:prose-invert max-w-none">
                        {@html marked(content)}
                    </div>
                </ScrollArea>
            </div>
        {/if}
    </div>

    <!-- Drag placeholder - visible only during drag -->
    {#if isSortableDragging.current}
        <div class="absolute inset-0 flex items-center justify-center rounded-md border-2 border-dashed border-primary/50 bg-muted/20">
            <div class="text-xs text-muted-foreground">Drop here: {title}</div>
        </div>
    {/if}

    <!-- Tombstone Overlay -->
    {#if isTombstone}
        <div class="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-md">
            <div class="flex flex-col items-center gap-1.5 text-muted-foreground">
                <X class="size-4" />
                <span class="text-xs">Node deleted</span>
            </div>
        </div>
    {/if}
</div>

<style>
    /* Hidden item styling */
    .hidden-item {
        border-style: dashed;
        filter: grayscale(0.7);
        background-image: repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 5px,
            rgba(var(--muted) / 0.1) 5px,
            rgba(var(--muted) / 0.1) 7px
        );
    }

    /* Adjust code block styling */
    :global(.prose pre) {
        background-color: hsl(var(--muted));
        padding: 0.75rem;
        border-radius: 0.375rem;
        margin: 0.75rem 0;
    }

    :global(.prose code) {
        background-color: hsl(var(--muted));
        padding: 0.15em 0.3em;
        border-radius: 0.25rem;
        font-size: 0.9em;
    }

    :global(.prose pre code) {
        background-color: transparent;
        padding: 0;
        border-radius: 0;
    }

    /* Adjust blockquote styling */
    :global(.prose blockquote) {
        border-left: 2px solid hsl(var(--border));
        padding-left: 0.75rem;
        font-style: italic;
        color: hsl(var(--muted-foreground));
        margin: 0.75rem 0;
    }
</style> 