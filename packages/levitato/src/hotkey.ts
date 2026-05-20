const matchesHotkey = (e: KeyboardEvent, spec: string): boolean => {
  const parts = spec.toLowerCase().split('+').map(p => p.trim())
  const key = parts.at(-1) ?? ''
  const mods = new Set(parts.slice(0, -1))
  const wantMod = mods.has('mod') || mods.has('cmd') || mods.has('meta')
  const wantCtrl = mods.has('ctrl') || (mods.has('mod') && !(e.metaKey || e.ctrlKey))
  const wantShift = mods.has('shift')
  const wantAlt = mods.has('alt') || mods.has('option')
  if (wantMod && !(e.metaKey || e.ctrlKey)) return false
  if (wantCtrl && !e.ctrlKey) return false
  if (wantShift !== e.shiftKey) return false
  if (wantAlt !== e.altKey) return false
  return e.key.toLowerCase() === key
}
export { matchesHotkey }
