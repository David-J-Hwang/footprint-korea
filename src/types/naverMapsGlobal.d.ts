import type { NaverMaps } from './naverMaps'

declare global {
  interface Window {
    naver?: NaverMaps
    initNaverMaps?: () => void
    navermap_authFailure?: () => void
  }
}

export {}
