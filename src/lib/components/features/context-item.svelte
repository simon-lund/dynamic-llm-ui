    // Simplified sortable usage
    const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSortableDragging } = useSortable({ id: nodeId });
    
    let style = '';
    $effect(() => {
        if (!transform?.current) return;
        style = `
            transform: translate3d(${transform.current.x}px, ${transform.current.y}px, 0);
            transition: ${transition?.current || ''};
        `;
    }); 