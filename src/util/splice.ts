
export const splice = <T>(arr: T[], deleteIndex: number, toDelete: number, ...toInsert: T[]) => {
  const before = arr.slice(0, deleteIndex)
  const after = arr.slice(deleteIndex+toDelete)
  return [...before, ...toInsert, ...after]
}
