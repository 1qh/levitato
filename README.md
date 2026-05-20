# ogrid

**The dashboard grid that builds itself.**

Drop widgets in. They measure themselves, find their place, and snap to a grid. Drag to rearrange. Resize to fit. Copy the config. Paste into code. Ship it.

Your users can do the same thing — toggle edit mode, customize their layout, and it persists automatically. One prop.

No other grid library does this. They all make you guess dimensions, wire up persistence, build dev tools from scratch. ogrid does it all.

## Install

```sh
bun add ogrid
```

## Quick start

```tsx
import { Grid } from 'ogrid'
import 'ogrid/styles.css'

const config = {
  layout: [
    { i: 'revenue', w: 12, fill: true },
    { i: 'users', w: 12 },
    { i: 'chart', w: 16, fill: true },
    { i: 'table', w: 8 },
  ],
}

<Grid config={config}>
  <RevenueChart key="revenue" />
  <UserCount key="users" />
  <ActivityChart key="chart" />
  <RecentTable key="table" />
</Grid>
```

That’s it. Each child needs a unique `key` matching a layout item’s `i`. Items without explicit `x`/`y` are auto-placed. Items with `fill: true` stretch to available height. Everything else sizes to content.

## Edit mode

```tsx
<Grid config={config} editable>
```

One prop. Drag handles appear. Items become resizable. Users can rearrange everything.

## Persistence

```tsx
<Grid config={config} editable id="dashboard" persist>
```

Two more props. User customizations save to localStorage automatically. Reload the page — layout restored. Reset clears it.

## The Panel

```tsx
<Grid.Panel />
<Grid config={config} editable id="dashboard" persist>
```

A toolbar that appears when `editable` is true. Sliders for columns, gap, and row height. Toggle cell boundaries. Copy the current layout as TypeScript. Reset to defaults. Accepts `children` (rendered at start) and `trailing` (rendered at end) for your own controls.

```tsx
<Grid.Panel trailing={<ThemeToggle />}>
  <EditSwitch />
</Grid.Panel>
```

## Dev workflow

1. Add `editable` to your Grid
2. Open the Panel — drag widgets, tweak sliders, toggle rings to see boundaries
3. Click **Copy** — get the exact `GridConfig` as TypeScript
4. Paste into your code as the default config
5. Remove `editable` — ship a static, clean dashboard

## User customization workflow

1. User triggers edit mode (button, keyboard shortcut, easter egg — you decide)
2. Drag handles and resize handles appear
3. User rearranges their dashboard
4. Layout persists to localStorage via `id` + `persist`
5. User exits edit mode — clean view, their layout preserved
6. **Reset** in Panel clears saved layout, restores your defaults

## Props

### `<Grid>`

| Prop             | Type                           | Default | Description                              |
| ---------------- | ------------------------------ | ------- | ---------------------------------------- |
| `config`         | `GridConfig`                   | —       | Layout configuration                     |
| `editable`       | `boolean`                      | `false` | Enable drag, resize, and handles         |
| `id`             | `string`                       | —       | Storage key for persistence              |
| `persist`        | `boolean`                      | `false` | Save user customizations to localStorage |
| `onConfigChange` | `(config: GridConfig) => void` | —       | Called after drag/resize/slider changes  |

### `<Grid.Panel>`

| Prop       | Type        | Description                               |
| ---------- | ----------- | ----------------------------------------- |
| `children` | `ReactNode` | Controls rendered at the start of the bar |
| `trailing` | `ReactNode` | Controls rendered at the end of the bar   |

Auto-hides when `editable` is `false` and no `children`/`trailing` are provided.

### `GridConfig`

```ts
interface GridConfig {
  cols?: number // default: 24
  gap?: number // default: 16px
  rowHeight?: number // default: 50px
  layout?: LayoutItem[]
}

interface LayoutItem {
  i: string // must match child's key
  w?: number // width in columns (default: full width)
  h?: number // height in rows
  x?: number // column position (auto-placed if omitted)
  y?: number // row position (auto-placed if omitted)
  fill?: boolean // stretch to available height
  minH?: number // minimum height (auto-computed from content)
  minW?: number // minimum width
  className?: string // CSS classes for the cell
}
```

## Hooks

### `useGridConfig()`

Returns the current `GridConfig` or `null` during measurement.

```tsx
import { useGridConfig } from 'ogrid'

const config = useGridConfig()
// { cols: 24, gap: 16, layout: [...] }
```

## How it works

1. **Measurement phase** — Grid renders invisible, measures each child’s natural height via ResizeObserver
2. **Layout computation** — Column-based placement algorithm finds optimal positions
3. **Content constraints** — Resize can never shrink a cell below its content height
4. **Freeform mode** — After measurement, items can be freely dragged and resized
5. **Responsive** — Below 768px, switches to single-column compact mode

## Built on

- [react-grid-layout](https://github.com/1qh/react-grid-layout) — the battle-tested layout engine that handles drag, resize, collision detection, and smooth animations

## License

MIT
