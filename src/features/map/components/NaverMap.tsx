import { useEffect, useRef, useState } from 'react'
import { loadNaverMapsScript } from '../../../lib/naverMapsLoader'
import type { NaverMap as NaverMapInstance } from '../../../types/naverMaps'

function NaverMap() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapElementRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<NaverMapInstance | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>(
    'loading',
  )
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let isMounted = true

    loadNaverMapsScript()
      .then(() => {
        if (!isMounted || !window.naver?.maps || !mapElementRef.current) {
          return
        }

        const map = new window.naver.maps.Map(mapElementRef.current, {
          center: new window.naver.maps.LatLng(36.5, 127.8),
          mapDataControl: false,
          scaleControl: false,
          zoom: 7,
          zoomControl: true,
          zoomControlOptions: {
            position: window.naver.maps.Position.TOP_RIGHT,
          },
        })
        mapRef.current = map

        function updateMapSize() {
          if (!containerRef.current || !window.naver?.maps) {
            return
          }

          const { height, width } = containerRef.current.getBoundingClientRect()

          if (width <= 0 || height <= 0) {
            return
          }

          map.setSize(new window.naver.maps.Size(width, height))
          window.naver.maps.Event.trigger(map, 'resize')
        }

        window.requestAnimationFrame(updateMapSize)
        window.setTimeout(updateMapSize, 100)

        setStatus('ready')
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : 'Unknown Naver Maps error.',
          )
          setStatus('error')
        }
      })

    return () => {
      isMounted = false
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!containerRef.current) {
      return
    }

    const resizeObserver = new ResizeObserver(() => {
      if (!mapRef.current || !containerRef.current || !window.naver?.maps) {
        return
      }

      const { height, width } = containerRef.current.getBoundingClientRect()

      if (width <= 0 || height <= 0) {
        return
      }

      mapRef.current.setSize(new window.naver.maps.Size(width, height))
      window.naver.maps.Event.trigger(mapRef.current, 'resize')
    })

    resizeObserver.observe(containerRef.current)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  return (
    <div
      className="relative h-[420px] overflow-hidden rounded-lg border border-stone-200 bg-stone-100 shadow-sm lg:h-[calc(100vh-12rem)]"
      ref={containerRef}
    >
      <div
        ref={mapElementRef}
        style={{
          height: '100%',
          width: '100%',
        }}
      />

      {status !== 'ready' ? (
        <div className="absolute inset-0 grid place-items-center bg-stone-100/90 px-6 text-center">
          {status === 'loading' ? (
            <p className="text-sm font-medium text-stone-600">
              네이버지도를 불러오는 중입니다.
            </p>
          ) : (
            <div>
              <p className="text-sm font-semibold text-stone-800">
                지도를 불러오지 못했습니다.
              </p>
              <p className="mt-2 text-sm text-stone-600">
                Naver Cloud의 Web 서비스 URL과 Client ID를 확인해주세요.
              </p>
              {errorMessage ? (
                <p className="mt-2 text-xs text-stone-500">{errorMessage}</p>
              ) : null}
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}

export default NaverMap
