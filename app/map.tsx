'use client'

import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { useCallback, useState } from "react";
import Screenshoter from './screenshoter';

const containerStyle = {
  width: '600px',
  height: '400px'
};

export default function Map() {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "###"
  })

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [pov, setPov] = useState<google.maps.StreetViewPov | null>(null);
  const [zoom, setZoom] = useState<number>(80);
  const [center, setCenter] = useState<google.maps.LatLngLiteral | null>({
    lat: -3.745,
    lng: -38.523
  });

  const onLoad = useCallback((map: google.maps.Map) => {
    // This is just an example of getting and using the map instance!!! don't just blindly copy!
    // const bounds = new window.google.maps.LatLngBounds(center);
    // map.fitBounds(bounds);

    const panorama = new google.maps.StreetViewPanorama(
      document.getElementById("pano") as HTMLElement,
      {
        position: center,
        pov: {
          heading: 34,
          pitch: 10,
        },
      }
    );

    panorama.addListener("pov_changed", () => {
      setZoom(panorama.getZoom());
      setPov(panorama.getPov());
    });

    panorama.addListener("position_changed", () => {
      const pos = panorama.getPosition();
      setCenter(pos?.toJSON() ?? null);
    });
  
    map.setStreetView(panorama);

    new google.maps.Marker({
      position: center,
      map: panorama,
    });

    setMap(map)
  }, [center]);

  const onUnmount = useCallback((map: google.maps.Map) => {
    setMap(null);
  }, []);

  return isLoaded ? (
    <div>
      <div id="map-container">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center ?? undefined}
          zoom={15}
          onLoad={onLoad}
          onUnmount={onUnmount}
          >
          { /* Child components, such as markers, info windows, etc. */ }
          <></>
        </GoogleMap>

        <div id="pano" style={containerStyle}></div>
      </div>
      <p>Pov: {pov?.heading} : {pov?.pitch} : {zoom}</p><p>Center: {center?.lat} : {center?.lng};</p>
      {pov && center && <Screenshoter pov={pov} center={center} fov={180 / Math.pow(2, zoom)} />}
    </div>
  ) : <></>;
}
  