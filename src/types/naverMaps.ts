export type NaverLatLng = object

export type NaverPoint = object

export type NaverSize = object

export type GeoJsonFeatureCollection = {
  features: Array<Record<string, unknown>>
  type: 'FeatureCollection'
  [key: string]: unknown
}

export type NaverMapDataFeature = {
  getProperty: (propertyName: string) => unknown
}

export type NaverMapDataPointerEvent = {
  coord: NaverLatLng
  feature: NaverMapDataFeature
}

export type NaverMapDataStyleOptions = {
  clickable?: boolean
  fillColor?: string
  fillOpacity?: number
  strokeColor?: string
  strokeOpacity?: number
  strokeWeight?: number
}

export type NaverMapDataLayer = {
  addGeoJson: (
    geoJson: GeoJsonFeatureCollection,
  ) => NaverMapDataFeature[]
  addListener: (
    eventName: string,
    listener: (event: NaverMapDataPointerEvent) => void,
  ) => unknown
  overrideStyle: (
    feature: NaverMapDataFeature,
    style: NaverMapDataStyleOptions,
  ) => void
  revertStyle: (feature?: NaverMapDataFeature) => void
  setStyle: (
    style:
      | NaverMapDataStyleOptions
      | ((feature: NaverMapDataFeature) => NaverMapDataStyleOptions),
  ) => void
}

export type NaverMap = {
  data: NaverMapDataLayer
  setSize: (size: NaverSize) => void
}

export type NaverInfoWindowOptions = {
  anchorColor?: string
  anchorSize?: NaverSize
  backgroundColor?: string
  borderColor?: string
  borderWidth?: number
  content?: string | HTMLElement
  maxWidth?: number
  pixelOffset?: NaverPoint
}

export type NaverInfoWindow = {
  close: () => void
  open: (map: NaverMap, anchor?: NaverLatLng) => void
  setContent: (content: string | HTMLElement) => void
}

export type NaverMapOptions = {
  center?: NaverLatLng
  mapDataControl?: boolean
  scaleControl?: boolean
  zoom?: number
  zoomControl?: boolean
  zoomControlOptions?: {
    position?: number
  }
}

export type NaverMaps = {
  maps: {
    InfoWindow: new (options?: NaverInfoWindowOptions) => NaverInfoWindow
    LatLng: new (lat: number, lng: number) => NaverLatLng
    Map: new (
      mapDiv: string | HTMLElement,
      mapOptions?: NaverMapOptions,
    ) => NaverMap
    Point: new (x: number, y: number) => NaverPoint
    Size: new (width: number, height: number) => NaverSize
    Event: {
      addListener: (
        target: unknown,
        eventName: string,
        listener: (...args: unknown[]) => void,
      ) => unknown
      trigger: (target: NaverMap, eventName: string) => void
    }
    Position: {
      TOP_RIGHT: number
    }
  }
}
