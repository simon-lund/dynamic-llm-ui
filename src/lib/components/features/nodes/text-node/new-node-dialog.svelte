<!-- New Node Dialog
This dialog opens automatically when a new node is created.
It allows the user to add content for the first choice of the node.
For convenience, the title will be auto-generated based on the content.
-->
<script lang="ts">
    import * as AlertDialog from '$lib/components/ui/alert-dialog';
    import * as Alert from '$lib/components/ui/alert';
    import { Button } from '$lib/components/ui/button';
    import { Label } from '$lib/components/ui/label';
    import { Textarea } from '$lib/components/ui/textarea';
    import { CircleAlertIcon, LoaderCircleIcon } from 'lucide-svelte';
    import * as actions from './actions.svelte';
    import * as api from '$lib/api';

    type TProps = {
        nodeId: string;
        open: boolean;
    }

    let { nodeId, open = $bindable<boolean>() }: TProps = $props();

    // State
    let content: string | undefined = $state();
    let errorText: string | undefined = $state();
    let isSaving = $state(false);

    // Handlers
    async function handleSave(e: Event) {
        e.stopPropagation();
        
        if (!content?.trim()) {
            errorText = 'Content cannot be empty.';
            return;
        }

        isSaving = true;

        // Get auto-generated title from LLM
        try {
            const title = await api.generateTitle(content);

            // Create the first choice with auto-generated title
            actions.addChoice(nodeId, title.trim(), content.trim());
        } catch (error) {
            errorText = 'Failed to generate title. Please try to save again.';
            console.error('Failed to generate title:', error);
        } finally {
            isSaving = false;
        }
    }

    // Effects
    $effect(() => {
        if (!open) {
            content = undefined;
            errorText = undefined;
            isSaving = false;
        }
    });
</script>

<AlertDialog.Root bind:open>
    <AlertDialog.Content>
        <AlertDialog.Header>
            <AlertDialog.Title>New Node</AlertDialog.Title>
            <AlertDialog.Description>
                Add content for your new node. A title will be automatically generated.
            </AlertDialog.Description>
        </AlertDialog.Header>
        <div class="grid gap-4 py-4">
            <div class="grid gap-2">
                <Label for="content">Content</Label>
                <div class="relative">
                    <Textarea
                        id="content"
                        bind:value={content}
                        class="min-h-[200px] resize-y font-mono text-sm leading-relaxed"
                        placeholder="Enter your content here..."
                        autofocus
                    />
                    <div class="absolute bottom-2 right-2 text-xs text-muted-foreground">
                        {content?.length ?? 0} characters
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
        <AlertDialog.Footer>
            <Button 
                variant="default" 
                onclick={handleSave} 
                disabled={isSaving}
            >
                {#if isSaving}
                    <LoaderCircleIcon class="animate-spin" />
                    Please wait
                {:else}
                    Create Node
                {/if}
            </Button>
        </AlertDialog.Footer>
    </AlertDialog.Content>
</AlertDialog.Root>