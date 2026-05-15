export type NaverLatLng = object

export type NaverSize = object

export type GeoJsonFeatureCollection = {
  features: Array<Record<string, unknown>>
  type: 'FeatureCollection'
  [key: string]: unknown
}

export type NaverMapDataFeature = {
  getProperty: (propertyName: string) => unknown
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
    LatLng: new (lat: number, lng: number) => NaverLatLng
    Map: new (
      mapDiv: string | HTMLElement,
      mapOptions?: NaverMapOptions,
    ) => NaverMap
    Size: new (width: number, height: number) => NaverSize
    Event: {
      trigger: (target: NaverMap, eventName: string) => void
    }
    Position: {
      TOP_RIGHT: number
    }
  }
}
