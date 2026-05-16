import { useEffect, useMemo, useRef, useState } from 'react'
import { loadNaverMapsScript } from '../../../lib/naverMapsLoader'
import type {
  GeoJsonFeatureCollection,
  NaverInfoWindow,
  NaverMap as NaverMapInstance,
} from '../../../types/naverMaps'

const SIGUNGU_GEOJSON_URL = `${import.meta.env.BASE_URL}geojson/TL_SCCO_SIG.json`
const REGION_CODE_URL = `${import.meta.env.BASE_URL}data/regionCode.json`

type RegionCodeMap = Record<string, string>

export type SelectedRegion = {
  code: string
  name: string
}

type NaverMapProps = {
  onCreateVisit?: (region: SelectedRegion) => void
  visitedRegionCodes?: string[]
}

function getSigunguLayerStyle(
  featureRegionCode: unknown,
  visitedRegionCodeSet: Set<string>,
) {
  const isVisited = visitedRegionCodeSet.has(String(featureRegionCode))

  return {
    clickable: true,
    fillColor: isVisited ? '#22c55e' : '#10b981',
    fillOpacity: isVisited ? 0.4 : 0.08,
    strokeColor: isVisited ? '#16a34a' : '#047857',
    strokeOpacity: isVisited ? 0.95 : 0.7,
    strokeWeight: isVisited ? 2 : 1,
  }
}

function applySigunguLayerStyle(
  map: NaverMapInstance,
  visitedRegionCodeSet: Set<string>,
) {
  map.data.setStyle((feature) =>
    getSigunguLayerStyle(
      feature.getProperty('SIG_CD'),
      visitedRegionCodeSet,
    ),
  )
}

function createRegionInfoWindowContent(
  regionName: string,
  regionCode: string,
  onCreateVisit?: (region: SelectedRegion) => void,
) {
  const content = document.createElement('div')
  content.className = 'w-52 px-4 py-3 text-stone-900'

  const label = document.createElement('p')
  label.className = 'text-xs font-semibold text-emerald-700'
  label.textContent = '선택한 행정구역'

  const title = document.createElement('p')
  title.className = 'mt-1 text-base font-bold text-stone-950'
  title.textContent = regionName

  const code = document.createElement('p')
  code.className = 'mt-1 text-xs text-stone-500'
  code.textContent = `행정구역 코드 ${regionCode}`

  const button = document.createElement('button')
  button.className =
    'mt-3 h-9 w-full cursor-pointer rounded-md bg-emerald-700 px-3 text-sm font-semibold text-white transition hover:bg-emerald-800'
  button.textContent = '+ 새 방문지 추가'
  button.type = 'button'
  button.addEventListener('click', () => {
    onCreateVisit?.({
      code: regionCode,
      name: regionName,
    })
  })

  content.append(label, title, code, button)

  return content
}

async function addSigunguLayer(
  map: NaverMapInstance,
  regionInfoWindow: NaverInfoWindow,
  getVisitedRegionCodeSet: () => Set<string>,
  onCreateVisit?: (region: SelectedRegion) => void,
) {
  let isRegionClick = false
  const [geoJsonResponse, regionCodeResponse] = await Promise.all([
    fetch(SIGUNGU_GEOJSON_URL),
    fetch(REGION_CODE_URL),
  ])

  if (!geoJsonResponse.ok) {
    throw new Error('Failed to load sigungu GeoJSON.')
  }

  if (!regionCodeResponse.ok) {
    throw new Error('Failed to load region code map.')
  }

  const [geoJson, regionCodeMap] = (await Promise.all([
    geoJsonResponse.json(),
    regionCodeResponse.json(),
  ])) as [GeoJsonFeatureCollection, RegionCodeMap]

  map.data.addGeoJson(geoJson)
  applySigunguLayerStyle(map, getVisitedRegionCodeSet())

  map.data.addListener('click', (event) => {
    isRegionClick = true

    const fallbackRegionName = String(
      event.feature.getProperty('SIG_KOR_NM') ?? '선택한 지역',
    )
    const regionCode = String(event.feature.getProperty('SIG_CD') ?? '-')
    const regionName = regionCodeMap[regionCode] ?? fallbackRegionName

    map.data.revertStyle()
    map.data.overrideStyle(event.feature, {
      fillColor: '#059669',
      fillOpacity: 0.2,
      strokeColor: '#065f46',
      strokeOpacity: 1,
      strokeWeight: 3,
    })

    regionInfoWindow.setContent(
      createRegionInfoWindowContent(regionName, regionCode, onCreateVisit),
    )
    regionInfoWindow.open(map, event.coord)

    window.setTimeout(() => {
      isRegionClick = false
    }, 0)
  })

  window.naver?.maps.Event.addListener(map, 'click', () => {
    if (isRegionClick) {
      isRegionClick = false
      return
    }

    regionInfoWindow.close()
    map.data.revertStyle()
  })
}

function NaverMap({
  onCreateVisit,
  visitedRegionCodes = [],
}: NaverMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapElementRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<NaverMapInstance | null>(null)
  const visitedRegionCodeSet = useMemo(
    () => new Set(visitedRegionCodes),
    [visitedRegionCodes],
  )
  const visitedRegionCodeSetRef = useRef(visitedRegionCodeSet)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>(
    'loading',
  )
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let isMounted = true

    loadNaverMapsScript()
      .then(async () => {
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

        const regionInfoWindow = new window.naver.maps.InfoWindow({
          anchorColor: '#ffffff',
          anchorSize: new window.naver.maps.Size(12, 10),
          backgroundColor: '#ffffff',
          borderColor: '#047857',
          borderWidth: 1,
          maxWidth: 240,
          pixelOffset: new window.naver.maps.Point(0, -6),
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

        window.requestAnimationFrame(updateMapSize)
        window.setTimeout(updateMapSize, 100)

        await addSigunguLayer(
          map,
          regionInfoWindow,
          () => visitedRegionCodeSetRef.current,
          onCreateVisit,
        )

        if (!isMounted) {
          return
        }

        window.requestAnimationFrame(updateMapSize)
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
      mapRef.current?.data.revertStyle()
      mapRef.current = null
    }
  }, [onCreateVisit])

  useEffect(() => {
    visitedRegionCodeSetRef.current = visitedRegionCodeSet

    if (!mapRef.current) {
      return
    }

    applySigunguLayerStyle(mapRef.current, visitedRegionCodeSet)
  }, [visitedRegionCodeSet])

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
                Naver Cloud 설정과 행정구역 GeoJSON 파일을 확인해주세요.
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
