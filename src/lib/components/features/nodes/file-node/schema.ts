import type { Node as TSvelteFlowNode } from '@xyflow/svelte';
import type { TDataBase } from '../schema';


/**
 * The data of a file node.
 */
export type TFileNodeData = TDataBase & {
	file: File; // Check if File is the correct type
	name: string;
}

export type TFileNode = TSvelteFlowNode<TFileNodeData, 'file'>;
