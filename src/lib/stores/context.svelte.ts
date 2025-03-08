// TODO: sync with local storage

import type { TContextSpace, TContext } from '$lib/components/features/context-pane/schema';
import _ from 'lodash';

export const contextStore = $state<TContext>({
    spaces: [{
        title: 'Default',
        nodeDependencies: [],
    }],
    currentSpaceIndex: 0,
});

export function addContextSpace() {
    const newContextSpace: TContextSpace = {
        title: 'New',
        nodeDependencies: [],
    };

    contextStore.spaces = [...contextStore.spaces, newContextSpace];
}

export function getCurrentContextSpace() {
    return contextStore.spaces[contextStore.currentSpaceIndex];
}

export function duplicateContextSpace(contextSpaceIndex: number) {
    const contextSpace = _.clone(contextStore.spaces[contextSpaceIndex]);
    contextStore.spaces = [...contextStore.spaces, contextSpace];

}

export function deleteContextSpace(contextSpaceIndex: number) {
    if (contextStore.spaces.length === 1) {
        throw new Error('Cannot delete the last context space');
    }
    contextStore.spaces = contextStore.spaces.filter((_, index) => index !== contextSpaceIndex);
}

