import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared'
import { appName } from './shared'
export const baseOptions = (): BaseLayoutProps => ({
  githubUrl: 'https://github.com/1qh/levitato',
  nav: {
    title: appName
  }
})
