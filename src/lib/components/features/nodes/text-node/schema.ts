import type { Node as TSvelteFlowNode } from '@xyflow/svelte';
import type { TDataBase } from '../schema';
import type { Optional } from '$lib/types';

/**
 * A variant of a text node.
 */
export type TChoice = {
	title: string;
	text: string;
	model?: string;
	// TODO: should be updatedAt and createdAt (in general changes should be tracked)
	timestamp: number;
}

export type TData = TDataBase & {
	choices: TChoice[];
	currentChoiceIndex: number;
	isExpanded: boolean;
}

export type TTextNode = TSvelteFlowNode<TData, 'text'>;

export type TUnregisteredTextNode = Optional<Omit<TTextNode, 'id'>, 'position'>;
