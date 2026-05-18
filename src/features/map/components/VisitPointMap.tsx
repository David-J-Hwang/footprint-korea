import { useEffect, useRef, useState } from 'react'
import { loadNaverMapsScript } from '../../../lib/naverMapsLoader'
import type {
  NaverInfoWindow,
  NaverMap as NaverMapInstance,
  NaverMarker,
} from '../../../types/naverMaps'

type VisitPointMapProps = {
  latitude: number | null
  longitude: number | null
  title: string
}

function createVisitPointInfoWindowContent(title: string) {
  const content = document.createElement('div')
  content.className = 'w-56 px-4 py-3 text-stone-900'

  const label = document.createElement('p')
  label.className = 'text-xs font-semibold text-emerald-700'
  label.textContent = '방문 위치'

  const name = document.createElement('p')
  name.className = 'mt-1 text-sm font-bold leading-5 text-stone-950'
  name.textContent = title

  content.append(label, name)

  return content
}

function VisitPointMap({ latitude, longitude, title }: VisitPointMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapElementRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<NaverMapInstance | null>(null)
  const markerRef = useRef<NaverMarker | null>(null)
  const infoWindowRef = useRef<NaverInfoWindow | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>(
    latitude === null || longitude === null ? 'ready' : 'loading',
  )
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (latitude === null || longitude === null) {
      return
    }

    let isMounted = true

    loadNaverMapsScript()
      .then(() => {
        if (!isMounted || !window.naver?.maps || !mapElementRef.current) {
          return
        }

        const naverMaps = window.naver.maps
        const position = new naverMaps.LatLng(latitude, longitude)
        const map = new naverMaps.Map(mapElementRef.current, {
          center: position,
          mapDataControl: false,
          scaleControl: false,
          zoom: 16,
          zoomControl: true,
          zoomControlOptions: {
            position: naverMaps.Position.TOP_RIGHT,
          },
        })
        const marker = new naverMaps.Marker({
          map,
          position,
          title,
        })
        const infoWindow = new naverMaps.InfoWindow({
          anchorColor: '#ffffff',
          anchorSize: new naverMaps.Size(12, 10),
          backgroundColor: '#ffffff',
          borderColor: '#047857',
          borderWidth: 1,
          content: createVisitPointInfoWindowContent(title),
          maxWidth: 260,
          pixelOffset: new naverMaps.Point(0, -8),
        })

        mapRef.current = map
        markerRef.current = marker
        infoWindowRef.current = infoWindow
        infoWindow.open(map, marker)

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
          map.setCenter(position)
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
      infoWindowRef.current?.close()
      markerRef.current?.setMap(null)
      infoWindowRef.current = null
      markerRef.current = null
      mapRef.current = null
    }
  }, [latitude, longitude, title])

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

      if (latitude !== null && longitude !== null) {
        mapRef.current.setCenter(
          new window.naver.maps.LatLng(latitude, longitude),
        )
      }
    })

    resizeObserver.observe(containerRef.current)

    return () => {
      resizeObserver.disconnect()
    }
  }, [latitude, longitude])

  return (
    <section className="min-w-0">
      <div
        className="relative h-[320px] overflow-hidden rounded-lg border border-stone-200 bg-stone-100 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:h-[420px] lg:h-[calc(100vh-12rem)]"
        ref={containerRef}
      >
        {latitude !== null && longitude !== null ? (
          <div
            ref={mapElementRef}
            style={{
              height: '100%',
              width: '100%',
            }}
          />
        ) : (
          <div className="grid h-full place-items-center px-6 text-center">
            <div>
              <p className="text-sm font-semibold text-stone-800 dark:text-stone-100">
                저장된 좌표가 없습니다.
              </p>
              <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">
                수정 페이지에서 위치를 선택하면 지도에 표시됩니다.
              </p>
            </div>
          </div>
        )}

        {latitude !== null && longitude !== null && status !== 'ready' ? (
          <div className="absolute inset-0 grid place-items-center bg-stone-100/90 px-6 text-center dark:bg-stone-900/90">
            {status === 'loading' ? (
              <p className="text-sm font-medium text-stone-600 dark:text-stone-300">
                네이버지도를 불러오는 중입니다.
              </p>
            ) : (
              <div>
                <p className="text-sm font-semibold text-stone-800 dark:text-stone-100">
                  지도를 불러오지 못했습니다.
                </p>
                <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">
                  Naver Cloud 설정과 Client ID를 확인해주세요.
                </p>
                {errorMessage ? (
                  <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">
                    {errorMessage}
                  </p>
                ) : null}
              </div>
            )}
          </div>
        ) : null}
      </div>
    </section>
  )
}

export default VisitPointMap
