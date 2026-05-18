import { useEffect, useRef, useState } from 'react'
import { loadNaverMapsScript } from '../../../lib/naverMapsLoader'
import type {
  NaverInfoWindow,
  NaverLatLng,
  NaverMap as NaverMapInstance,
  NaverMarker,
} from '../../../types/naverMaps'

const SIGUNGU_GEOJSON_URL = `${import.meta.env.BASE_URL}geojson/TL_SCCO_SIG.json`

export type SelectedVisitLocation = {
  latitude: number
  longitude: number
}

type VisitLocationMapProps = {
  onSelectLocation?: (location: SelectedVisitLocation) => void
  selectedLocation?: SelectedVisitLocation | null
  selectedRegionCode?: string
}

type SigunguFeature = {
  geometry?: {
    coordinates?: unknown
  }
  properties?: {
    SIG_CD?: string
  }
}

type SigunguGeoJson = {
  features?: SigunguFeature[]
}

type RegionBounds = {
  east: number
  north: number
  south: number
  west: number
}

type MapClickEvent = {
  coord?: NaverLatLng
}

let sigunguGeoJsonPromise: Promise<SigunguGeoJson> | null = null

function loadSigunguGeoJson() {
  if (!sigunguGeoJsonPromise) {
    sigunguGeoJsonPromise = fetch(SIGUNGU_GEOJSON_URL).then((response) => {
      if (!response.ok) {
        throw new Error('행정구역 GeoJSON을 불러오지 못했습니다.')
      }

      return response.json() as Promise<SigunguGeoJson>
    })
  }

  return sigunguGeoJsonPromise
}

function collectLngLatPairs(
  coordinates: unknown,
  collectedPairs: Array<[number, number]> = [],
) {
  if (!Array.isArray(coordinates)) {
    return collectedPairs
  }

  const [lng, lat] = coordinates

  if (typeof lng === 'number' && typeof lat === 'number') {
    collectedPairs.push([lng, lat])
    return collectedPairs
  }

  coordinates.forEach((nestedCoordinates) => {
    collectLngLatPairs(nestedCoordinates, collectedPairs)
  })

  return collectedPairs
}

function getFeatureBounds(feature: SigunguFeature) {
  const coordinates = collectLngLatPairs(feature.geometry?.coordinates)

  if (coordinates.length === 0) {
    return null
  }

  return coordinates.reduce<RegionBounds>(
    (bounds, [lng, lat]) => ({
      east: Math.max(bounds.east, lng),
      north: Math.max(bounds.north, lat),
      south: Math.min(bounds.south, lat),
      west: Math.min(bounds.west, lng),
    }),
    {
      east: -Infinity,
      north: -Infinity,
      south: Infinity,
      west: Infinity,
    },
  )
}

function fitMapToBounds(map: NaverMapInstance, bounds: RegionBounds) {
  if (!window.naver?.maps) {
    return
  }

  const southWest = new window.naver.maps.LatLng(bounds.south, bounds.west)
  const northEast = new window.naver.maps.LatLng(bounds.north, bounds.east)
  const latLngBounds = new window.naver.maps.LatLngBounds(southWest, northEast)

  map.fitBounds(latLngBounds)
}

function resetMapToKorea(map: NaverMapInstance) {
  if (!window.naver?.maps) {
    return
  }

  map.setCenter(new window.naver.maps.LatLng(36.5, 127.8))
  map.setZoom(7)
}

function toSelectedLocation(coord: NaverLatLng) {
  return {
    latitude: coord.lat(),
    longitude: coord.lng(),
  }
}

function createSelectedLocationInfoWindowContent(
  location: SelectedVisitLocation,
) {
  const content = document.createElement('div')
  content.className = 'w-56 px-4 py-3 text-stone-900'

  const label = document.createElement('p')
  label.className = 'text-xs font-semibold text-emerald-700'
  label.textContent = '선택한 위치'

  const coordinates = document.createElement('p')
  coordinates.className = 'mt-1 text-sm font-bold leading-5 text-stone-950'
  coordinates.textContent = `${location.latitude.toFixed(
    6,
  )}, ${location.longitude.toFixed(6)}`

  const helper = document.createElement('p')
  helper.className = 'mt-2 text-xs leading-5 text-stone-500'
  helper.textContent = '좌표가 양식에 입력되었습니다.'

  content.append(label, coordinates)
  content.append(helper)

  return content
}

function updateSelectedMarker(
  map: NaverMapInstance,
  markerInfoWindow: NaverInfoWindow | null,
  currentMarker: NaverMarker | null,
  location: SelectedVisitLocation,
) {
  if (!window.naver?.maps) {
    return null
  }

  currentMarker?.setMap(null)

  const position = new window.naver.maps.LatLng(
    location.latitude,
    location.longitude,
  )
  const marker = new window.naver.maps.Marker({
    map,
    position,
    title: '선택한 위치',
  })

  markerInfoWindow?.setContent(createSelectedLocationInfoWindowContent(location))
  markerInfoWindow?.open(map, marker)
  map.setCenter(position)
  map.setZoom(15)

  return marker
}

function VisitLocationMap({
  onSelectLocation,
  selectedLocation,
  selectedRegionCode,
}: VisitLocationMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapElementRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<NaverMapInstance | null>(null)
  const markerInfoWindowRef = useRef<NaverInfoWindow | null>(null)
  const selectedMarkerRef = useRef<NaverMarker | null>(null)
  const onSelectLocationRef = useRef(onSelectLocation)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>(
    'loading',
  )
  const [locationSelectMessage, setLocationSelectMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    onSelectLocationRef.current = onSelectLocation
  }, [onSelectLocation])

  useEffect(() => {
    let isMounted = true

    loadNaverMapsScript()
      .then(() => {
        if (!isMounted || !window.naver?.maps || !mapElementRef.current) {
          return
        }

        const naverMaps = window.naver.maps
        const map = new naverMaps.Map(mapElementRef.current, {
          center: new naverMaps.LatLng(36.5, 127.8),
          mapDataControl: false,
          scaleControl: false,
          zoom: 7,
          zoomControl: true,
          zoomControlOptions: {
            position: naverMaps.Position.TOP_RIGHT,
          },
        })
        mapRef.current = map
        markerInfoWindowRef.current = new naverMaps.InfoWindow({
          anchorColor: '#ffffff',
          anchorSize: new naverMaps.Size(12, 10),
          backgroundColor: '#ffffff',
          borderColor: '#047857',
          borderWidth: 1,
          maxWidth: 280,
          pixelOffset: new naverMaps.Point(0, -8),
        })

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

        naverMaps.Event.addListener(map, 'click', (event) => {
          const coord = (event as MapClickEvent).coord

          if (!coord || !window.naver?.maps) {
            return
          }

          const location = toSelectedLocation(coord)

          selectedMarkerRef.current = updateSelectedMarker(
            map,
            markerInfoWindowRef.current,
            selectedMarkerRef.current,
            location,
          )
          onSelectLocationRef.current?.(location)
          setLocationSelectMessage('선택한 위치의 좌표가 양식에 입력되었습니다.')
        })

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
      selectedMarkerRef.current?.setMap(null)
      selectedMarkerRef.current = null
      markerInfoWindowRef.current = null
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    if (status !== 'ready' || !mapRef.current || !selectedLocation) {
      return
    }

    selectedMarkerRef.current = updateSelectedMarker(
      mapRef.current,
      markerInfoWindowRef.current,
      selectedMarkerRef.current,
      selectedLocation,
    )
    setLocationSelectMessage('선택한 위치의 좌표가 양식에 입력되었습니다.')
  }, [selectedLocation, status])

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

  useEffect(() => {
    if (status !== 'ready' || !mapRef.current || selectedLocation) {
      return
    }

    if (!selectedRegionCode) {
      resetMapToKorea(mapRef.current)
      return
    }

    let isMounted = true

    loadSigunguGeoJson()
      .then((geoJson) => {
        if (!isMounted || !mapRef.current) {
          return
        }

        const selectedFeature = geoJson.features?.find(
          (feature) => feature.properties?.SIG_CD === selectedRegionCode,
        )
        const selectedBounds = selectedFeature
          ? getFeatureBounds(selectedFeature)
          : null

        if (!selectedBounds) {
          return
        }

        window.requestAnimationFrame(() => {
          if (isMounted && mapRef.current) {
            fitMapToBounds(mapRef.current, selectedBounds)
          }
        })
      })
      .catch((error: unknown) => {
        if (!isMounted) {
          return
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : '행정구역 GeoJSON을 불러오지 못했습니다.',
        )
      })

    return () => {
      isMounted = false
    }
  }, [selectedLocation, selectedRegionCode, status])

  return (
    <section className="min-w-0">
      <div className="mb-3">
        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">위치 선택</p>
        <h2 className="mt-1 text-xl font-semibold text-stone-950 dark:text-stone-50">지도</h2>
        <p
          className="mt-2 text-sm text-stone-600 dark:text-stone-400"
        >
          {locationSelectMessage || '지도를 클릭하면 좌표가 입력됩니다.'}
        </p>
      </div>
      <div
        className="relative h-[320px] overflow-hidden rounded-lg border border-stone-200 bg-stone-100 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:h-[420px] lg:h-[calc(100vh-12rem)]"
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

export default VisitLocationMap
