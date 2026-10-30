'use client';

import { useEffect, useRef, useState } from 'react';
import type { Object3D, Material, Texture, WebGLRenderer, Mesh } from 'three';

/** The supplied glTF model is rendered locally; there are no remote scene assets. */
export default function HeroGlobe() {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'unavailable'>('loading');

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    let disposed = false;
    let renderer: WebGLRenderer | undefined;
    let model: Object3D | undefined;
    let stopAnimation: (() => void) | undefined;
    let frame = 0;
    let visible = true;
    let pageVisible = !document.hidden;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    // GLTFLoader materials can share maps, so release each GPU resource only once.
    function disposeModel(object: Object3D) {
      const materials = new Set<Material>();
      const textures = new Set<Texture>();
      object.traverse(node => {
        const mesh = node as Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        if (!mesh.material) return;
        for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
          materials.add(material);
          for (const value of Object.values(material)) {
            if (value && typeof value === 'object' && 'isTexture' in value) textures.add(value as Texture);
          }
        }
      });
      textures.forEach(texture => {
        texture.dispose();
        const source = texture.source?.data;
        if (typeof ImageBitmap !== 'undefined' && source instanceof ImageBitmap) source.close();
      });
      materials.forEach(material => material.dispose());
    }

    async function setup() {
      try {
        const [THREE, { GLTFLoader }] = await Promise.all([
          import('three'),
          import('three/addons/loaders/GLTFLoader.js'),
        ]);
        if (disposed) return;

        renderer = new THREE.WebGLRenderer({ canvas: canvas!, alpha: true, antialias: true, powerPreference: 'low-power' });
        renderer.setClearColor(0x000000, 0);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.45;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(42, 1, 0.05, 50);
        const globe = new THREE.Group();
        scene.add(globe);
        scene.add(new THREE.AmbientLight(0xc1d9ff, 1.7));
        const sunlight = new THREE.DirectionalLight(0xe5f3ff, 3.4);
        sunlight.position.set(-3, 3, 5);
        scene.add(sunlight);
        const rim = new THREE.DirectionalLight(0x80d8bd, 2.2);
        rim.position.set(4, 0, -2);
        scene.add(rim);

        let baseDistance = 3.15;
        let scrollProgress = 0;
        let easedProgress = 0;
        let previousTime = 0;
        let pendingRender = true;

        const updateScroll = () => {
          const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
          const pageProgress = THREE.MathUtils.clamp(window.scrollY / maxScroll, 0, 1);
          // Ease into the close-up early enough to see it while the hero sticks.
          scrollProgress = Math.sqrt(pageProgress);
          host!.style.setProperty('--globe-scroll', scrollProgress.toFixed(4));
          host!.dataset.scrollProgress = scrollProgress.toFixed(4);
          pendingRender = true;
          schedule();
        };
        const resize = () => {
          if (!renderer) return;
          const width = Math.max(1, host!.clientWidth);
          const height = Math.max(1, host!.clientHeight);
          renderer.setSize(width, height, false);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          const halfFov = THREE.MathUtils.degToRad(camera.fov / 2);
          const limitingHalfFov = Math.atan(Math.tan(halfFov) * Math.min(1, camera.aspect));
          baseDistance = (1 / Math.sin(limitingHalfFov)) * 1.1;
          pendingRender = true;
          updateScroll();
        };
        const render = (time: number) => {
          frame = 0;
          if (disposed || !renderer || !visible || !pageVisible) return;
          const delta = previousTime ? Math.min((time - previousTime) / 1000, 0.05) : 0;
          previousTime = time;
          const easing = reducedMotion.matches ? 1 : 1 - Math.exp(-delta * 5);
          easedProgress += (scrollProgress - easedProgress) * easing;
          // A conservative close-up keeps the provided mesh clear of the camera.
          camera.position.set(0, 0.04, baseDistance * (1 - 0.4 * easedProgress));
          camera.lookAt(0, 0, 0);
          if (model && !reducedMotion.matches) globe.rotation.y += delta * 0.045;
          const zoom = (1 / (1 - 0.4 * easedProgress)).toFixed(3);
          canvas!.dataset.zoom = zoom;
          host!.dataset.zoom = zoom;
          host!.dataset.rotation = globe.rotation.y.toFixed(4);
          renderer.render(scene, camera);
          pendingRender = Math.abs(scrollProgress - easedProgress) > 0.0001;
          if (!reducedMotion.matches || pendingRender) schedule();
        };
        function schedule() {
          if (!frame && !disposed && visible && pageVisible) frame = requestAnimationFrame(render);
        }
        const onMotionChange = () => { pendingRender = true; previousTime = 0; schedule(); };
        const onVisibilityChange = () => {
          pageVisible = !document.hidden;
          previousTime = 0;
          if (pageVisible) schedule();
          else { cancelAnimationFrame(frame); frame = 0; }
        };
        const onContextLost = (event: Event) => {
          event.preventDefault();
          visible = false;
          cancelAnimationFrame(frame);
          frame = 0;
          if (!disposed) setState('unavailable');
        };
        const observer = new IntersectionObserver(([entry]) => {
          visible = entry.isIntersecting;
          previousTime = 0;
          if (visible) { pendingRender = true; schedule(); }
          else { cancelAnimationFrame(frame); frame = 0; }
        }, { rootMargin: '100px' });
        const resizeObserver = new ResizeObserver(resize);
        observer.observe(host!);
        resizeObserver.observe(host!);
        window.addEventListener('scroll', updateScroll, { passive: true });
        window.addEventListener('resize', resize, { passive: true });
        document.addEventListener('visibilitychange', onVisibilityChange);
        reducedMotion.addEventListener('change', onMotionChange);
        canvas!.addEventListener('webglcontextlost', onContextLost);
        stopAnimation = () => {
          cancelAnimationFrame(frame);
          frame = 0;
          observer.disconnect();
          resizeObserver.disconnect();
          window.removeEventListener('scroll', updateScroll);
          window.removeEventListener('resize', resize);
          document.removeEventListener('visibilitychange', onVisibilityChange);
          reducedMotion.removeEventListener('change', onMotionChange);
          canvas!.removeEventListener('webglcontextlost', onContextLost);
        };
        resize();

        const gltf = await new GLTFLoader().loadAsync('/art/globe.glb');
        if (disposed) { disposeModel(gltf.scene); return; }
        model = gltf.scene;
        model.updateMatrixWorld(true);
        const bounds = new THREE.Box3().setFromObject(model);
        const center = bounds.getCenter(new THREE.Vector3());
        const size = bounds.getSize(new THREE.Vector3());
        const radius = Math.max(size.x, size.y, size.z) / 2;
        // Respect the asset's authored node transforms, then normalize its visible size.
        const normalized = new THREE.Group();
        normalized.add(model);
        model.position.sub(center);
        normalized.scale.setScalar(1 / Math.max(radius, 0.0001));
        globe.add(normalized);
        globe.rotation.set(-0.12, -1.9, 0.04);
        setState('ready');
        pendingRender = true;
        schedule();
      } catch {
        if (!disposed) {
          setState('unavailable');
          stopAnimation?.();
        }
      }
    }
    void setup();
    return () => {
      disposed = true;
      stopAnimation?.();
      cancelAnimationFrame(frame);
      if (model) disposeModel(model);
      renderer?.dispose();
      renderer?.forceContextLoss();
    };
  }, []);

  return (
    <div ref={hostRef} className="hero-globe-stage" data-globe-state={state} style={{ pointerEvents: 'none' }} role="img" aria-label="A slowly rotating three-dimensional globe that grows closer as you scroll. Motion adapts to your reduced-motion preference.">
      <canvas ref={canvasRef} className="hero-globe-model" aria-hidden="true" style={{ width: '100%', height: '100%', display: 'block', opacity: state === 'ready' ? 1 : 0, transition: 'opacity 600ms ease' }} />
      {state !== 'ready' && <div className="globe-loading" aria-hidden="true"><span className="globe-loading-orb" /><span>{state === 'loading' ? 'Opening the world…' : 'The world is waiting.'}</span></div>}
    </div>
  );
}
