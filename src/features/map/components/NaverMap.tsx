import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from 'react'
import { loadNaverMapsScript } from '../../../lib/naverMapsLoader'
import type {
  GeoJsonFeatureCollection,
  NaverInfoWindow,
  NaverLatLng,
  NaverMap as NaverMapInstance,
  NaverMarker,
} from '../../../types/naverMaps'
import {
  VISIT_CATEGORY_LABELS,
  type Visit,
} from '../../visits/visitTypes'

const SIGUNGU_GEOJSON_URL = `${import.meta.env.BASE_URL}geojson/TL_SCCO_SIG.json`
const REGION_CODE_URL = `${import.meta.env.BASE_URL}data/regionCode.json`

type RegionCodeMap = Record<string, string>
export type MapViewMode = 'regions' | 'points'

export type SelectedRegion = {
  code: string
  latitude?: number
  longitude?: number
  name: string
}

type VisitWithLocation = Visit & {
  latitude: number
  longitude: number
}

type VisitCluster = {
  centerLat: number
  centerLng: number
  visits: VisitWithLocation[]
}

type BuildingVisitCluster = VisitCluster & {
  totalLat: number
  totalLng: number
}

type NaverMapProps = {
  onCreateVisit?: (region: SelectedRegion) => void
  onOpenVisitDetail?: (visit: Visit) => void
  onSelectVisit?: (visit: Visit) => void
  onViewModeChange?: (viewMode: MapViewMode) => void
  selectedVisitId?: string | null
  visits?: Visit[]
  viewMode?: MapViewMode
}

function hasVisitLocation(visit: Visit): visit is VisitWithLocation {
  return (
    typeof visit.latitude === 'number' &&
    typeof visit.longitude === 'number' &&
    Number.isFinite(visit.latitude) &&
    Number.isFinite(visit.longitude)
  )
}

function getSigunguLayerStyle(
  featureRegionCode: unknown,
  visitedRegionCodeSet: Set<string>,
  mapViewMode: MapViewMode,
) {
  if (mapViewMode === 'points') {
    return {
      clickable: false,
      fillColor: '#10b981',
      fillOpacity: 0,
      strokeColor: '#10b981',
      strokeOpacity: 0,
      strokeWeight: 1,
    }
  }

  const isVisited = visitedRegionCodeSet.has(String(featureRegionCode))

  return {
    clickable: true,
    fillColor: isVisited ? '#16a34a' : '#10b981',
    fillOpacity: isVisited ? 0.46 : 0.06,
    strokeColor: isVisited ? '#22c55e' : '#34d399',
    strokeOpacity: isVisited ? 0.8 : 0.65,
    strokeWeight: isVisited ? 1.5 : 1,
  }
}

function applySigunguLayerStyle(
  map: NaverMapInstance,
  visitedRegionCodeSet: Set<string>,
  mapViewMode: MapViewMode,
) {
  map.data.setStyle((feature) =>
    getSigunguLayerStyle(
      feature.getProperty('SIG_CD'),
      visitedRegionCodeSet,
      mapViewMode,
    ),
  )
}

function degreesToRadians(degrees: number) {
  return (degrees * Math.PI) / 180
}

function getDistanceKilometers(
  firstVisit: VisitWithLocation,
  secondVisit: Pick<VisitWithLocation, 'latitude' | 'longitude'>,
) {
  const earthRadiusKilometers = 6371
  const latitudeDistance = degreesToRadians(
    secondVisit.latitude - firstVisit.latitude,
  )
  const longitudeDistance = degreesToRadians(
    secondVisit.longitude - firstVisit.longitude,
  )
  const firstLatitude = degreesToRadians(firstVisit.latitude)
  const secondLatitude = degreesToRadians(secondVisit.latitude)

  const haversine =
    Math.sin(latitudeDistance / 2) ** 2 +
    Math.cos(firstLatitude) *
      Math.cos(secondLatitude) *
      Math.sin(longitudeDistance / 2) ** 2

  return (
    2 *
    earthRadiusKilometers *
    Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
  )
}

function getClusterRadiusKilometers(zoom: number) {
  if (zoom <= 6) {
    return 130
  }

  if (zoom === 7) {
    return 90
  }

  if (zoom === 8) {
    return 55
  }

  if (zoom === 9) {
    return 32
  }

  if (zoom === 10) {
    return 9
  }

  if (zoom === 11) {
    return 5
  }

  if (zoom === 12) {
    return 5
  }

  if (zoom === 13) {
    return 2.5
  }

  return 1
}

function createVisitClusters(visits: Visit[], zoom: number) {
  const clusterRadiusKilometers = getClusterRadiusKilometers(zoom)
  const clusters: BuildingVisitCluster[] = []

  visits.filter(hasVisitLocation).forEach((visit) => {
    let nearestClusterIndex = -1
    let nearestDistance = Number.POSITIVE_INFINITY

    clusters.forEach((cluster, index) => {
      const distance = getDistanceKilometers(visit, {
        latitude: cluster.centerLat,
        longitude: cluster.centerLng,
      })

      if (distance <= clusterRadiusKilometers && distance < nearestDistance) {
        nearestClusterIndex = index
        nearestDistance = distance
      }
    })

    if (nearestClusterIndex < 0) {
      clusters.push({
        centerLat: visit.latitude,
        centerLng: visit.longitude,
        totalLat: visit.latitude,
        totalLng: visit.longitude,
        visits: [visit],
      })
      return
    }

    const nearestCluster = clusters[nearestClusterIndex]

    nearestCluster.visits.push(visit)
    nearestCluster.totalLat += visit.latitude
    nearestCluster.totalLng += visit.longitude
    nearestCluster.centerLat =
      nearestCluster.totalLat / nearestCluster.visits.length
    nearestCluster.centerLng =
      nearestCluster.totalLng / nearestCluster.visits.length
  })

  return clusters.map<VisitCluster>(({ centerLat, centerLng, visits }) => ({
    centerLat,
    centerLng,
    visits,
  }))
}

function clearVisitMarkers(markers: NaverMarker[]) {
  markers.forEach((marker) => {
    marker.setMap(null)
  })
}

function createClusterMarkerIcon(count: number) {
  if (!window.naver?.maps) {
    return undefined
  }

  const diameter = count >= 10 ? 46 : 42

  return {
    anchor: new window.naver.maps.Point(diameter / 2, diameter / 2),
    content: `
      <div
        aria-label="${count}개의 방문 위치"
        style="
          align-items: center;
          background: #047857;
          border: 3px solid rgba(255, 255, 255, 0.92);
          border-radius: 9999px;
          box-shadow: 0 10px 20px rgba(4, 120, 87, 0.26);
          color: #ffffff;
          cursor: pointer;
          display: flex;
          font-size: 14px;
          font-weight: 800;
          height: ${diameter}px;
          justify-content: center;
          line-height: 1;
          width: ${diameter}px;
        "
      >
        ${count}
      </div>
    `,
    size: new window.naver.maps.Size(diameter, diameter),
  }
}

function createVisitMarkerInfoWindowContent(
  visit: VisitWithLocation,
  onOpenVisitDetail?: (visit: Visit) => void,
) {
  const content = document.createElement('div')
  content.className = 'w-52 px-4 py-3 text-stone-900'

  const label = document.createElement('p')
  label.className = 'text-xs font-semibold text-emerald-700'
  label.textContent = '방문 위치'

  const title = document.createElement('p')
  title.className = 'mt-1 text-base font-bold text-stone-950'
  title.textContent = visit.title

  const meta = document.createElement('p')
  meta.className = 'mt-1 text-xs text-stone-500'
  meta.textContent = `${visit.region_name} · ${
    VISIT_CATEGORY_LABELS[visit.category]
  }`

  const button = document.createElement('button')
  button.className =
    'mt-3 h-9 w-full cursor-pointer rounded-md bg-emerald-700 px-3 text-sm font-semibold text-white transition hover:bg-emerald-800'
  button.textContent = '상세보기'
  button.type = 'button'
  button.addEventListener('click', () => {
    onOpenVisitDetail?.(visit)
  })

  content.append(label, title, meta, button)

  return content
}

function renderVisitMarkers(
  map: NaverMapInstance,
  visits: Visit[],
  visitInfoWindow: NaverInfoWindow,
  markersRef: MutableRefObject<NaverMarker[]>,
  selectedVisitId?: string | null,
  onOpenVisitDetail?: (visit: Visit) => void,
  onSelectVisit?: (visit: Visit) => void,
) {
  if (!window.naver?.maps) {
    return
  }

  const naverMaps = window.naver.maps

  clearVisitMarkers(markersRef.current)
  markersRef.current = []
  visitInfoWindow.close()

  const clusters = createVisitClusters(visits, map.getZoom())

  clusters.forEach((cluster) => {
    const position = new naverMaps.LatLng(
      cluster.centerLat,
      cluster.centerLng,
    )

    if (cluster.visits.length === 1) {
      const [visit] = cluster.visits
      const marker = new naverMaps.Marker({
        map,
        position,
        title: visit.title,
      })

      naverMaps.Event.addListener(marker, 'click', () => {
        onSelectVisit?.(visit)
        visitInfoWindow.setContent(
          createVisitMarkerInfoWindowContent(visit, onOpenVisitDetail),
        )
        visitInfoWindow.open(map, marker)
      })

      markersRef.current.push(marker)
      return
    }

    const marker = new naverMaps.Marker({
      icon: createClusterMarkerIcon(cluster.visits.length),
      map,
      position,
      title: `${cluster.visits.length}개의 방문 위치`,
      zIndex: 100 + cluster.visits.length,
    })

    naverMaps.Event.addListener(marker, 'click', () => {
      map.setCenter(position)
      map.setZoom(Math.min(map.getZoom() + 2, 16))
    })

    markersRef.current.push(marker)
  })

  const selectedVisit = visits.find((visit) => visit.id === selectedVisitId)

  if (!selectedVisit || !hasVisitLocation(selectedVisit)) {
    return
  }

  const selectedPosition = new naverMaps.LatLng(
    selectedVisit.latitude,
    selectedVisit.longitude,
  )

  visitInfoWindow.setContent(
    createVisitMarkerInfoWindowContent(selectedVisit, onOpenVisitDetail),
  )
  visitInfoWindow.open(map, selectedPosition)
}

function focusVisitOnMap(map: NaverMapInstance, visit: VisitWithLocation) {
  if (!window.naver?.maps) {
    return
  }

  map.setCenter(new window.naver.maps.LatLng(visit.latitude, visit.longitude))

  if (map.getZoom() < 13) {
    map.setZoom(13)
  }
}

function createRegionInfoWindowContent(
  regionName: string,
  regionCode: string,
  clickedLocation: NaverLatLng,
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
      latitude: clickedLocation.lat(),
      longitude: clickedLocation.lng(),
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
  getMapViewMode: () => MapViewMode,
  onMapBlankClick: () => void,
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
  applySigunguLayerStyle(
    map,
    getVisitedRegionCodeSet(),
    getMapViewMode(),
  )

  map.data.addListener('click', (event) => {
    if (getMapViewMode() !== 'regions') {
      return
    }

    isRegionClick = true

    const fallbackRegionName = String(
      event.feature.getProperty('SIG_KOR_NM') ?? '선택한 지역',
    )
    const regionCode = String(event.feature.getProperty('SIG_CD') ?? '-')
    const regionName = regionCodeMap[regionCode] ?? fallbackRegionName

    map.data.revertStyle()
    map.data.overrideStyle(event.feature, {
      fillColor: '#059669',
      fillOpacity: 0.18,
      strokeColor: '#065f46',
      strokeOpacity: 0.8,
      strokeWeight: 2,
    })

    regionInfoWindow.setContent(
      createRegionInfoWindowContent(
        regionName,
        regionCode,
        event.coord,
        onCreateVisit,
      ),
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
    onMapBlankClick()
  })
}

function getViewModeButtonClass(isActive: boolean) {
  return [
    'h-9 cursor-pointer px-3 text-sm font-semibold transition sm:px-4',
    isActive
      ? 'bg-emerald-700 text-white dark:bg-emerald-600'
      : 'bg-white text-stone-700 hover:bg-emerald-50 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800',
  ].join(' ')
}

function NaverMap({
  onCreateVisit,
  onOpenVisitDetail,
  onSelectVisit,
  onViewModeChange,
  selectedVisitId,
  visits = [],
  viewMode,
}: NaverMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapElementRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<NaverMapInstance | null>(null)
  const regionInfoWindowRef = useRef<NaverInfoWindow | null>(null)
  const visitInfoWindowRef = useRef<NaverInfoWindow | null>(null)
  const visitMarkersRef = useRef<NaverMarker[]>([])
  const [internalMapViewMode, setInternalMapViewMode] =
    useState<MapViewMode>('regions')
  const mapViewMode = viewMode ?? internalMapViewMode
  const mapViewModeRef = useRef<MapViewMode>(mapViewMode)
  const onOpenVisitDetailRef = useRef(onOpenVisitDetail)
  const onSelectVisitRef = useRef(onSelectVisit)
  const selectedVisitIdRef = useRef(selectedVisitId)
  const visitsRef = useRef(visits)
  const visitedRegionCodeSet = useMemo(
    () => new Set(visits.map((visit) => visit.region_code)),
    [visits],
  )
  const visitedRegionCodeSetRef = useRef(visitedRegionCodeSet)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>(
    'loading',
  )
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    onOpenVisitDetailRef.current = onOpenVisitDetail
    onSelectVisitRef.current = onSelectVisit
    selectedVisitIdRef.current = selectedVisitId
  }, [onOpenVisitDetail, onSelectVisit, selectedVisitId])

  const handleMapViewModeChange = useCallback((nextMode: MapViewMode) => {
    if (viewMode !== undefined) {
      onViewModeChange?.(nextMode)
      return
    }

    setInternalMapViewMode(nextMode)
  }, [onViewModeChange, viewMode])

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
        regionInfoWindowRef.current = regionInfoWindow

        const visitInfoWindow = new window.naver.maps.InfoWindow({
          anchorColor: '#ffffff',
          anchorSize: new window.naver.maps.Size(12, 10),
          backgroundColor: '#ffffff',
          borderColor: '#047857',
          borderWidth: 1,
          maxWidth: 240,
          pixelOffset: new window.naver.maps.Point(0, -6),
        })
        visitInfoWindowRef.current = visitInfoWindow

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

        window.naver.maps.Event.addListener(map, 'idle', () => {
          if (
            mapViewModeRef.current !== 'points' ||
            !visitInfoWindowRef.current
          ) {
            return
          }

          renderVisitMarkers(
            map,
            visitsRef.current,
            visitInfoWindowRef.current,
            visitMarkersRef,
            selectedVisitIdRef.current,
            onOpenVisitDetailRef.current,
            onSelectVisitRef.current,
          )
        })

        await addSigunguLayer(
          map,
          regionInfoWindow,
          () => visitedRegionCodeSetRef.current,
          () => mapViewModeRef.current,
          () => visitInfoWindow.close(),
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
      clearVisitMarkers(visitMarkersRef.current)
      visitMarkersRef.current = []
      regionInfoWindowRef.current?.close()
      visitInfoWindowRef.current?.close()
      mapRef.current?.data.revertStyle()
      mapRef.current = null
    }
  }, [onCreateVisit])

  useEffect(() => {
    visitedRegionCodeSetRef.current = visitedRegionCodeSet
    visitsRef.current = visits
    mapViewModeRef.current = mapViewMode

    if (!mapRef.current) {
      return
    }

    const map = mapRef.current
    map.data.revertStyle()
    applySigunguLayerStyle(map, visitedRegionCodeSet, mapViewMode)

    if (mapViewMode === 'regions') {
      visitInfoWindowRef.current?.close()
      clearVisitMarkers(visitMarkersRef.current)
      visitMarkersRef.current = []
      return
    }

    regionInfoWindowRef.current?.close()

    if (visitInfoWindowRef.current) {
      renderVisitMarkers(
        map,
        visits,
        visitInfoWindowRef.current,
        visitMarkersRef,
        selectedVisitId,
        onOpenVisitDetail,
        onSelectVisit,
      )
    }
  }, [
    mapViewMode,
    onOpenVisitDetail,
    onSelectVisit,
    selectedVisitId,
    visitedRegionCodeSet,
    visits,
  ])

  useEffect(() => {
    if (!selectedVisitId || !mapRef.current) {
      return
    }

    const selectedVisit = visits.find((visit) => visit.id === selectedVisitId)

    if (!selectedVisit || !hasVisitLocation(selectedVisit)) {
      return
    }

    focusVisitOnMap(mapRef.current, selectedVisit)
  }, [selectedVisitId, visits])

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
      className="relative h-[420px] overflow-hidden rounded-lg border border-stone-200 bg-stone-100 shadow-sm dark:border-stone-800 dark:bg-stone-900 lg:h-[calc(100vh-12rem)]"
      ref={containerRef}
    >
      <div className="absolute left-3 top-3 z-10 inline-flex overflow-hidden rounded-md border border-white/80 bg-white shadow-md dark:border-stone-700 dark:bg-stone-900">
        <button
          className={getViewModeButtonClass(mapViewMode === 'regions')}
          disabled={status !== 'ready'}
          onClick={() => handleMapViewModeChange('regions')}
          type="button"
        >
          행정구역
        </button>
        <button
          className={getViewModeButtonClass(mapViewMode === 'points')}
          disabled={status !== 'ready'}
          onClick={() => handleMapViewModeChange('points')}
          type="button"
        >
          상세위치
        </button>
      </div>

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
                Naver Cloud 설정과 행정구역 GeoJSON 파일을 확인해주세요.
              </p>
              {errorMessage ? (
                <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">{errorMessage}</p>
              ) : null}
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}

export default NaverMap
