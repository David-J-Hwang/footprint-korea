export type NaverLatLng = object

export type NaverSize = object

export type NaverMap = {
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
