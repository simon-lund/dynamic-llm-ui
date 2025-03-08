<script lang="ts">
	import * as Resizable from "$lib/components/ui/resizable";
	import { WhiteboardPane } from '$lib/components/features/whiteboard-pane';
	import { ContextPane } from '$lib/components/features/context-pane';
	import { ResponsePane } from '$lib/components/features/response-pane';
</script>

<main class="h-full">
	<Resizable.PaneGroup direction="horizontal">
		<Resizable.Pane minSize={20}>
				<WhiteboardPane />
		</Resizable.Pane>
		<Resizable.Handle withHandle />
		<Resizable.Pane minSize={20}>
				<ContextPane />
		</Resizable.Pane>
		<Resizable.Handle withHandle />
		<Resizable.Pane minSize={20}>
				<ResponsePane />
		</Resizable.Pane>
	</Resizable.PaneGroup>
</main>

