/**
 * TextNode specific actions
 * Collection of actions that can be performed on a text node
 */

// TODO: getNode should contain a type guard to ensure the correct type is returned
// TODO: add function to remove a node from a context space
// TODO: add function to load a choices for a context space

import type { TChoice, TTextNode, TUnregisteredTextNode } from './schema';

import { addNode, deleteNode, duplicateNode, getNode, updateNodeData } from '$lib/stores/nodes.svelte';
import { contextStore } from '$lib/stores/context.svelte';

export { getNode, duplicateNode, deleteNode, updateNodeData };

/**
 * Add an empty text node to the whiteboard.
 * On creation, the 'NewDialog' will automatically open to allow the user to write an initial text (first choice)
 */
export function addTextNode(data: Partial<TUnregisteredTextNode['data']> = {}) {
	const newNode: TUnregisteredTextNode = {
		type: 'text',
		// TODO: whereevery we merge it should be done like htis not like {x, ...new} if new might contian values but actually undefined, and there is probably a library for this
		//  Example: v = { z: "1"} y = {z: undefined} => {...v, ...y} === {z: undefined} but we want {z: "1"} so we cant do this
		data: {
			generatedBy: data?.generatedBy ?? 'user',
			choices: data?.choices ?? [],
			currentChoiceIndex: data?.currentChoiceIndex ?? 0,
			isExpanded: data?.isExpanded ?? false,
		}
	};

	addNode(newNode);
}

/**
 * Add a new choice at the end of the list of choices of a text node
 * @param nodeId
 * @param title
 * @param text
 */
export function addChoice(nodeId: string, title: string, text: string) {
	const node = getNode(nodeId) as TTextNode;
	const choices = node.data.choices;
	const newChoice: TChoice = {
		title,
		text,
		timestamp: Date.now()
	};

	choices.push(newChoice);
	updateNodeData(nodeId, { choices });
}

/**
 * Switch to a different choice of a node. This will update the currentChoiceIndex of the text node.
 * @param nodeId
 * @param choiceIndex The index of the choice to switch to
 */
export function switchChoice(nodeId: string, choiceIndex: number) {

	const node = getNode(nodeId) as TTextNode;
	if (choiceIndex < 0 || choiceIndex >= node.data.choices.length) {
		throw new Error(`Out of bounds choice index: ${choiceIndex} [0, ${node.data.choices.length})`);
	}
	updateNodeData(nodeId, { currentChoiceIndex: choiceIndex });

	// Update the choice index (the reference to this node) in the context space if the node is in the context space
	// TODO: shorten
	const nodeDependencies = contextStore.spaces[contextStore.currentSpaceIndex].nodeDependencies;
	const nodeDependencyIndex = nodeDependencies.findIndex((nd) => nd.nodeId === nodeId);
	// If it's not in the context space, we don't need to do anything
	if (nodeDependencyIndex === -1) return;

	contextStore.spaces[contextStore.currentSpaceIndex].nodeDependencies[nodeDependencyIndex].choiceIndex = choiceIndex;
}

/**
 * Updates the content of a specific choice of a text node
 * @param nodeId
 * @param choiceIndex
 * @param title
 * @param text
 */
export function updateChoice(nodeId: string, choiceIndex: number, title: string, text: string) {
	const node = getNode(nodeId) as TTextNode;
	const choices = node.data.choices;

	choices[choiceIndex] = {...choices[choiceIndex], title, text};
	updateNodeData(nodeId, { choices });
}

/**
 * Add a node to the current context space
 * @param nodeId
 */
export function addNodeToContextSpace(nodeId: string) {
	const node = getNode(nodeId);
	// TODO: should check here if the node is already in the context space (even though we do it in the component as well)
	// TODO: we should turn spaces into state so we dont need to reassign the whole object
	const nodeDependencies = contextStore.spaces[contextStore.currentSpaceIndex].nodeDependencies;
	contextStore.spaces[contextStore.currentSpaceIndex].nodeDependencies = [...nodeDependencies, { nodeId, choiceIndex: node.data.currentChoiceIndex, hidden:false }];
}
