import { useEffect, useRef, useState } from 'react';
import { AttributionControl, GPUInitializationError, Map as MapLibreMap, Marker, NavigationControl, setWorkerUrl } from 'maplibre-gl';
import type { GeoJSONSource } from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Coordinates } from '../app/gameState';
import { distanceKm } from '../game/distance';
import { geodesicCoordinates } from '../game/geodesic';
import { mapProvider } from '../lib/mapProvider';

setWorkerUrl(workerUrl);

type GlobeProps = {
  guess: Coordinates | null;
  answer: Coordinates | null;
  locked: boolean;
  onGuess: (guess: Coordinates | null) => void;
};

type MapStatus = 'loading' | 'ready' | 'error';

function worldZoom(container: HTMLElement): number {
  const shortSide = Math.min(container.clientWidth, container.clientHeight);
  return Math.max(0.6, Math.min(2, 1.2 + Math.log2(Math.max(shortSide, 1) / 400)));
}

export function Globe({ guess, answer, locked, onGuess }: GlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const answerMarkerRef = useRef<Marker | null>(null);
  const lockedRef = useRef(locked);
  const onGuessRef = useRef(onGuess);
  const [status, setStatus] = useState<MapStatus>('loading');
  const [attempt, setAttempt] = useState(0);

  lockedRef.current = locked;
  onGuessRef.current = onGuess;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let map: MapLibreMap | null = null;
    let ready = false;
    let disposed = false;
    let loadTimer: ReturnType<typeof setTimeout> | undefined;
    let resizeObserver: ResizeObserver | null = null;
    let previousWorldZoom = worldZoom(container);
    let resizeFrame = 0;

    const fail = () => {
      if (disposed) return;
      clearTimeout(loadTimer);
      setStatus('error');
      if (!lockedRef.current) onGuessRef.current(null);
    };

    setStatus('loading');
    try {
      map = new MapLibreMap({
        container,
        style: mapProvider.styleUrl,
        center: [12, 18],
        zoom: worldZoom(container),
        minZoom: 0.6,
        maxZoom: 8,
        clickTolerance: 8,
        dragRotate: false,
        touchPitch: false,
        attributionControl: false,
      });
      mapRef.current = map;
      resizeObserver = new ResizeObserver(() => {
        if (!map || !ready || lockedRef.current) return;
        const nextWorldZoom = worldZoom(container);
        if (nextWorldZoom === previousWorldZoom) return;
        map.resize();
        previousWorldZoom = nextWorldZoom;
        cancelAnimationFrame(resizeFrame);
        resizeFrame = requestAnimationFrame(() => {
          if (map && !disposed && !lockedRef.current) map.setZoom(nextWorldZoom);
        });
      });
      resizeObserver.observe(container);

      map.addControl(new NavigationControl({ showCompass: false }), 'top-right');
      map.addControl(new AttributionControl({ compact: false }), 'bottom-right');
      map.on('style.load', () => {
        if (disposed || !map) return;
        map.setProjection({ type: 'globe' });
        // Place names would turn the future photo puzzle into a label hunt.
        for (const layer of map.getStyle().layers) {
          if (layer.type === 'symbol') map.setLayoutProperty(layer.id, 'visibility', 'none');
        }
      });
      map.on('load', () => {
        if (disposed) return;
        ready = true;
        map?.resize();
        map?.setZoom(worldZoom(container));
        previousWorldZoom = worldZoom(container);
        clearTimeout(loadTimer);
        setStatus('ready');
      });
      map.on('error', (event) => {
        if (event.error instanceof GPUInitializationError || !ready) fail();
      });
      map.on('webglcontextlost', fail);
      map.on('click', (event) => {
        if (!ready || lockedRef.current) return;
        if (!Number.isFinite(event.lngLat.lat) || !Number.isFinite(event.lngLat.lng)) return;
        onGuessRef.current({ lat: event.lngLat.lat, lng: event.lngLat.lng });
      });
      loadTimer = setTimeout(() => { if (!ready) fail(); }, 20000);
    } catch {
      fail();
    }

    return () => {
      disposed = true;
      clearTimeout(loadTimer);
      cancelAnimationFrame(resizeFrame);
      resizeObserver?.disconnect();
      markerRef.current?.remove();
      markerRef.current = null;
      answerMarkerRef.current?.remove();
      answerMarkerRef.current = null;
      map?.remove();
      if (mapRef.current === map) mapRef.current = null;
    };
  }, [attempt]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || status !== 'ready') return;
    if (!guess) {
      markerRef.current?.remove();
      markerRef.current = null;
      return;
    }
    if (!markerRef.current) {
      const element = document.createElement('div');
      element.className = 'guess-marker';
      element.setAttribute('aria-hidden', 'true');
      markerRef.current = new Marker({ element, anchor: 'bottom' }).setLngLat([guess.lng, guess.lat]).addTo(map);
    } else {
      markerRef.current.setLngLat([guess.lng, guess.lat]);
    }
  }, [guess, status]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || status !== 'ready' || !guess || !answer) return;

    const points = geodesicCoordinates(guess, answer);
    const route = {
      type: 'Feature' as const,
      properties: {},
      geometry: { type: 'LineString' as const, coordinates: points },
    };

    if (!map.getSource('answer-route')) {
      map.addSource('answer-route', { type: 'geojson', data: route });
      map.addLayer({
        id: 'answer-route-line',
        type: 'line',
        source: 'answer-route',
        paint: { 'line-color': getComputedStyle(map.getContainer()).getPropertyValue('--accent').trim() || '#c43d25',
          'line-width': 3, 'line-opacity': 0.9, 'line-dasharray': [1.5, 1.2] },
        layout: { 'line-cap': 'round', 'line-join': 'round' },
      });
    } else {
      (map.getSource('answer-route') as GeoJSONSource).setData(route);
    }

    if (!answerMarkerRef.current) {
      const element = document.createElement('div');
      element.className = 'answer-marker';
      element.setAttribute('aria-hidden', 'true');
      answerMarkerRef.current = new Marker({ element, anchor: 'bottom' }).setLngLat([answer.lng, answer.lat]).addTo(map);
    }

    // A globe cannot use flat-map bounds for widely separated points: on a
    // narrow screen that can zoom past both markers. Center the great-circle
    // midpoint and choose a zoom from the angular distance instead.
    const midpoint = points[Math.floor(points.length / 2)];
    const separation = distanceKm(guess, answer) / 111.195;
    let firstCameraMove = true;
    let lastSize = '';
    const positionCamera = () => {
      if (mapRef.current !== map) return;
      const size = `${map.getContainer().clientWidth}x${map.getContainer().clientHeight}`;
      if (size === lastSize) return;
      lastSize = size;
      map.resize();
      const zoom = Math.max(0.6, Math.min(4.6,
        worldZoom(map.getContainer()) + 0.45 * Math.log2(110 / Math.max(separation, 1))));
      const camera = { center: midpoint, zoom, pitch: 0, bearing: 0 };
      if (firstCameraMove && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        map.easeTo({ ...camera, duration: 650 });
      } else {
        map.jumpTo(camera);
      }
      firstCameraMove = false;
    };
    const resizeObserver = new ResizeObserver(positionCamera);
    resizeObserver.observe(map.getContainer());
    const frame = requestAnimationFrame(positionCamera);
    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [answer, guess, status]);

  return (
    <div className="globe-stage">
      <div
        ref={containerRef}
        className="map-canvas"
        aria-label={locked
          ? 'Globe showing your guess, the answer, and the route between them.'
          : 'Interactive globe. Drag to turn, zoom with wheel or pinch, click or tap to guess. Press Enter or Space to pin the map center.'}
        onKeyDown={(event) => {
          if (locked || status !== 'ready' || !mapRef.current || (event.key !== 'Enter' && event.key !== ' ')) return;
          event.preventDefault();
          const center = mapRef.current.getCenter();
          onGuess({ lat: center.lat, lng: center.lng });
        }}
      />
      {status === 'loading' && (
        <div className="map-message" role="status">
          <span className="loading-orbit" aria-hidden="true" />
          <strong>Bringing the globe into view</strong>
          <span>Just a moment…</span>
        </div>
      )}
      {status === 'error' && (
        <div className="map-message map-error" role="alert">
          <strong>The globe couldn't start.</strong>
          <span>Check your connection or WebGL support, then try again.</span>
          <button type="button" onClick={() => setAttempt((value) => value + 1)}>Retry globe</button>
        </div>
      )}
    </div>
  );
}
