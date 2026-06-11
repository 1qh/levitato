# levitato

Floating draggable bubble for React. Snap to an edge, open a panel, dismiss by dragging, and keep its position across sessions.

## Install

```sh
bun add levitato
```

## Quick Start

```tsx
import { Bubble } from 'levitato'

const App = () => (
  <Bubble title="Settings">
    <div className="p-3">Panel content</div>
  </Bubble>
)
```

## Features

- Edge-docked draggable bubble
- Popover panel with controlled or uncontrolled open state
- Keyboard shortcut support
- Local storage persistence
- Drag-to-dismiss affordance
- Viewport resize handling that preserves the bubble’s relative vertical position

## Props

| Prop           | Type                          | Default           | Description                                           |
| -------------- | ----------------------------- | ----------------- | ----------------------------------------------------- |
| `children`     | `ReactNode`                   | -                 | Popover content                                       |
| `config`       | `DeepPartial<LevitatoConfig>` | -                 | Size, spacing, spring, dismiss, and popover overrides |
| `dismissible`  | `boolean`                     | `true`            | Enables drag-to-dismiss                               |
| `hotkey`       | `false \| string`             | `mod+.`           | Keyboard shortcut                                     |
| `icon`         | `ReactNode`                   | -                 | Custom bubble icon                                    |
| `open`         | `boolean`                     | -                 | Controlled open state                                 |
| `onOpenChange` | `(open: boolean) => void`     | -                 | Open-state callback                                   |
| `storage`      | `StorageAdapter`              | `localStorage`    | Persistence adapter                                   |
| `storageKey`   | `string`                      | `levitato:bubble` | Persistence key                                       |
| `title`        | `string`                      | -                 | Popover and button accessible label                   |

## License

MIT
