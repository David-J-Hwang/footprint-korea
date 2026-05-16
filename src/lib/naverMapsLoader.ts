const NAVER_MAP_SCRIPT_ID = 'naver-map-script'
const NAVER_MAP_CALLBACK_NAME = 'initNaverMaps'

let naverMapsScriptPromise: Promise<void> | null = null

function isNaverMapsReady() {
  return Boolean(window.naver?.maps)
}

export function loadNaverMapsScript() {
  if (isNaverMapsReady()) {
    return Promise.resolve()
  }

  if (naverMapsScriptPromise) {
    return naverMapsScriptPromise
  }

  const naverMapClientId = import.meta.env.VITE_NAVER_MAP_CLIENT_ID

  if (!naverMapClientId) {
    return Promise.reject(new Error('Missing Naver Maps client ID.'))
  }

  naverMapsScriptPromise = new Promise((resolve, reject) => {
    let isSettled = false

    const resolveWhenReady = () => {
      if (isSettled) {
        return
      }

      if (isNaverMapsReady()) {
        isSettled = true
        resolve()
        return
      }

      window.setTimeout(() => {
        if (isSettled) {
          return
        }

        if (isNaverMapsReady()) {
          isSettled = true
          resolve()
          return
        }

        isSettled = true
        naverMapsScriptPromise = null
        reject(new Error('Naver Maps loaded without maps namespace.'))
      }, 0)
    }

    const rejectOnce = (error: Error) => {
      if (isSettled) {
        return
      }

      isSettled = true
      naverMapsScriptPromise = null
      reject(error)
    }

    const existingScript = document.getElementById(
      NAVER_MAP_SCRIPT_ID,
    ) as HTMLScriptElement | null

    window.navermap_authFailure = () => {
      rejectOnce(new Error('Naver Maps authentication failed.'))
    }

    window.initNaverMaps = () => {
      resolveWhenReady()
    }

    if (existingScript) {
      if (isNaverMapsReady()) {
        resolve()
        return
      }

      existingScript.remove()
    }

    const script = document.createElement('script')
    script.id = NAVER_MAP_SCRIPT_ID
    script.async = true
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${encodeURIComponent(
      naverMapClientId,
    )}&callback=${NAVER_MAP_CALLBACK_NAME}`
    script.addEventListener('load', resolveWhenReady, { once: true })
    script.addEventListener(
      'error',
      () => {
        rejectOnce(new Error('Failed to load Naver Maps script.'))
      },
      { once: true },
    )

    document.head.append(script)
  })

  return naverMapsScriptPromise
}
