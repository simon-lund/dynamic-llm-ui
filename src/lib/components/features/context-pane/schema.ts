export type TNodeDependency = {
    nodeId: string;
    // TODO: But this is only relevant for text nodes.... and if we truly want to decouple things this should be stored in the node data and then there should be a adapter to get the context content to display in the context pane or tritgger or subsciber whtaterbe, somthing properly updates. bu tprobably i m gong to have to implemnt the complementar clases for all noides implmented in the whiteboard pane, so i can just use the same data structure and not have to worry about this.
    choiceIndex: number;
    hidden: boolean;
}

export type TContextSpace = {
    title: string;
    nodeDependencies: TNodeDependency[];
}

export type TContext = {
    spaces: TContextSpace[];
    currentSpaceIndex: number;
}