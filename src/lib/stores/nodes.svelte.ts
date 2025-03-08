/**
 * Node Store and Actions
 * This file contains the store and actions for managing nodes in the application.
 */

import { fromStore, writable } from 'svelte/store';
import type { TTextNode, TUnregisteredTextNode } from '$lib/components/features/nodes/text-node/schema';
import _ from 'lodash';

const testData: TTextNode[] = [
    {
        id: '1',
        type: 'text',
        position: { x: 100, y: 100 },
        data: {
            generatedBy: 'ai',
            currentChoiceIndex: 2,
            choices: [
                {
                    title: 'Initial Analysis',
                    text: `# Project Overview

This is a **comprehensive analysis** of the project structure and its implications.

## Key Points
- Modular architecture
- Type-safe components
- Responsive design

\`\`\`typescript
interface IComponent {
    name: string;
    version: string;
}
\`\`\`

> Note: This is a preliminary analysis and may need further refinement.`
                },
                {
                    title: 'Technical Details',
                    text: `## Implementation Details

1. **Frontend Stack**
   - Svelte 5 with Runes
   - TypeScript for type safety
   - TailwindCSS for styling

2. **Key Features**
   - Markdown support
   - Real-time updates
   - Context management

\`\`\`svelte
<script lang="ts">
    let count = $state(0);
</script>
\`\`\``
                },
                {
                    title: 'Architecture Overview',
                    text: `# System Architecture

The system follows a **modular design** with clear separation of concerns.

## Components
- Whiteboard Pane
- Context Manager
- Response Handler

### Benefits
1. Better maintainability
2. Easier testing
3. Clear dependencies

> The architecture allows for future extensibility while maintaining current functionality.

\`\`\`typescript
type TModule = {
    id: string;
    dependencies: string[];
};
\`\`\``
                }
            ],
            isExpanded: true,
        }
    },
    {
        id: '2',
        type: 'text',
        position: { x: 400, y: 100 },
        data: {
            generatedBy: 'user',
            currentChoiceIndex: 0,
            choices: [
                {
                    title: 'User Requirements',
                    text: `# Feature Requirements

## Must Have
- [ ] Real-time collaboration
- [ ] Version control
- [ ] Export functionality

## Nice to Have
- [ ] Custom themes
- [ ] Plugin system
- [ ] AI assistance

> Priority should be given to core functionality before adding extra features.

### Timeline
1. Phase 1: Core Features
2. Phase 2: Enhancements
3. Phase 3: Optimization`
                },
            ],
            isExpanded: true,
        }
    },
    {
        id: '3',
        type: 'text',
        position: { x: 100, y: 400 },
        data: {
            generatedBy: 'user',
            currentChoiceIndex: 0,
            choices: [
                {
                    title: 'Implementation Notes',
                    text: `## Development Notes

### Current Status
- [x] Basic structure
- [x] Component system
- [ ] State management
- [ ] API integration

\`\`\`typescript
// TODO: Implement proper error handling
function handleError(err: Error) {
    console.error(err);
}
\`\`\`

> Remember to add proper documentation for all new features.

#### Next Steps
1. Complete state management
2. Add error boundaries
3. Implement caching`
                },
            ],
            isExpanded: true,
        }
    },
]

// TODO: sync with local storage
export const nodesStore = writable<Array<TTextNode>>(testData);

nodesStore.subscribe(value => {
    console.log('Nodes store updated:', value);
})

const nodes = fromStore(nodesStore)

/**
 * Add a new text node to the nodes store.
 * The node will be assigned a new ID (overwriting any existing ID in the node object).
 * @param node
 */
export function addNode(node: TUnregisteredTextNode) {
    const nodeIds = nodes.current.map((node) => parseInt(node.id));
    const maxId: number = _.max(nodeIds) ?? 0;
    const newNodeId = (maxId + 1).toString();

    const newNode = {
        ...node,
        id: newNodeId,
        // TODO: we should center the new node in the viewport or add it at free position then fit the viewport
        position: node?.position ?? { x: 200, y: 200 },
        selected: true,
    };

    // Make sure only the new node is selected and add new node to the list of nodes
    nodes.current = [...nodes.current.map(n => ({ ...n, selected: false })), newNode];
}

/**
 * Duplicate a node with a new ID and a slight offset in position.
 * @param nodeId
 */
export function duplicateNode(nodeId: string) {
    const node = getNode(nodeId);
    const newNode = _.clone(node);

    addNode({
        ...newNode,
        position: { x: newNode.position.x + 10, y: newNode.position.y + 10 }
    });
}

/**
 * Get a node by its ID.
 * @param nodeId
 */
export function getNode(nodeId: string) {
    const node = nodes.current.find((node: TTextNode) => node.id === nodeId);
    if (!node) throw new Error(`Node with ID ${nodeId} not found.`);
    return node;
}

/**
 * Update the data of a node with the given ID.
 * @param nodeId
 * @param data
 */
export function updateNodeData(nodeId: string, data: Partial<TTextNode['data']>) {
    // TODO: should use nodes, instead, but then we need to use 'let'
    // TODO: we should make sure that the type of "data" matches the type of the node's data
    nodesStore.update(current => current.map(node =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
    ));
}

/**
 * Delete a node by its ID.
 * @param nodeId
 */
export function deleteNode(nodeId: string) {
    // TODO: should use nodes, instead, but then we need to use 'let'
    nodesStore.update(current => current.filter(n => n.id !== nodeId));
}






