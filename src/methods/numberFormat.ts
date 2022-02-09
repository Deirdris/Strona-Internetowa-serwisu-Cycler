export const numberFormat = (value: number) => {
    return value.toLocaleString(undefined, {
        maximumFractionDigits: 1,
    })
}