export const calcTotal = (base, selectedOptions) =>
    base + selectedOptions.reduce((sum, o) => sum + (o?.price || 0), 0)

export const getDisabledIds = (selectedIds, incompatibilities) => {
    const disabled = new Set()
    for (const { option_a, option_b } of incompatibilities) {
        if (selectedIds.includes(option_a)) disabled.add(option_b)
        if (selectedIds.includes(option_b)) disabled.add(option_a)
    }
    selectedIds.forEach(id => disabled.delete(id))
    return disabled
}
