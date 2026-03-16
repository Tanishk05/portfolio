const canvas = document.getElementById("bg-canvas");
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

function initSmoothScroll() {
  if (prefersReducedMotion || typeof Lenis === "undefined") {
    return null;
  }

  const lenis = new Lenis({
    duration: 1.1,
    smoothWheel: true,
    wheelMultiplier: 0.9,
    touchMultiplier: 1.5,
  });

  function raf(time) {
    lenis.raf(time);
    window.requestAnimationFrame(raf);
  }

  window.requestAnimationFrame(raf);

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      const href = anchor.getAttribute("href");
      if (!href || href === "#") {
        return;
      }

      const target = document.querySelector(href);
      if (!target) {
        return;
      }

      event.preventDefault();
      lenis.scrollTo(target, {
        offset: -72,
        duration: 1.05,
      });
    });
  });

  return lenis;
}

function initBackToTop(lenis) {
  const backToTopButton = document.getElementById("backToTop");
  if (!backToTopButton) {
    return;
  }

  const setVisibility = (yPosition) => {
    backToTopButton.classList.toggle("show", yPosition > 420);
  };

  if (lenis) {
    lenis.on("scroll", ({ animatedScroll }) => {
      setVisibility(animatedScroll);
    });
  } else {
    window.addEventListener(
      "scroll",
      () => {
        setVisibility(window.scrollY || window.pageYOffset || 0);
      },
      { passive: true },
    );
  }

  backToTopButton.addEventListener("click", () => {
    if (lenis) {
      lenis.scrollTo(0, { duration: 1.2 });
      return;
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
}

function initMobileMenu() {
  const menuButton = document.getElementById("mobileMenuButton");
  const mobileMenu = document.getElementById("mobileMenu");
  if (!menuButton || !mobileMenu) {
    return;
  }

  const closeMenu = () => {
    mobileMenu.hidden = true;
    menuButton.setAttribute("aria-expanded", "false");
  };

  const openMenu = () => {
    mobileMenu.hidden = false;
    menuButton.setAttribute("aria-expanded", "true");
  };

  menuButton.addEventListener("click", () => {
    const isExpanded = menuButton.getAttribute("aria-expanded") === "true";
    if (isExpanded) {
      closeMenu();
      return;
    }

    openMenu();
  });

  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      closeMenu();
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });

  document.addEventListener("click", (event) => {
    if (mobileMenu.hidden) {
      return;
    }

    if (
      mobileMenu.contains(event.target) ||
      menuButton.contains(event.target)
    ) {
      return;
    }

    closeMenu();
  });
}

function initThreeBackground() {
  if (!canvas || typeof THREE === "undefined") {
    return;
  }

  const isMobile = window.matchMedia("(max-width: 767px)").matches;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x08111b, 0.06);
  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );
  camera.position.z = 6;

  const ambient = new THREE.AmbientLight(0x9ceeff, 0.95);
  scene.add(ambient);

  const point = new THREE.PointLight(0x74f2ce, 1.8, 120);
  point.position.set(2.5, 2.8, 6);
  scene.add(point);

  const fillLight = new THREE.PointLight(0x6dd6ff, 1.05, 80);
  fillLight.position.set(-2.4, -1.6, 3.5);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0xb3f7ff, 0.75);
  rimLight.position.set(-2, 1.6, 2.8);
  scene.add(rimLight);

  const heroGroup = new THREE.Group();
  scene.add(heroGroup);

  const knotGeometry = new THREE.TorusKnotGeometry(1.6, 0.36, 180, 28);
  const knotMaterial = new THREE.MeshStandardMaterial({
    color: 0x8be8ff,
    roughness: 0.2,
    metalness: 0.64,
    emissive: 0x1f8fb6,
    emissiveIntensity: 0.44,
    wireframe: false,
  });
  const knot = new THREE.Mesh(knotGeometry, knotMaterial);
  knot.scale.setScalar(isMobile ? 0.78 : 1.04);
  knot.position.set(isMobile ? 1.05 : 1.5, isMobile ? -0.42 : 0.06, -1.3);
  heroGroup.add(knot);

  const ringGeometry = new THREE.TorusGeometry(2.9, 0.03, 16, 120);
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: 0x78f1ff,
    transparent: true,
    opacity: 0.62,
    blending: THREE.AdditiveBlending,
  });
  const ring = new THREE.Mesh(ringGeometry, ringMaterial);
  ring.scale.setScalar(isMobile ? 0.82 : 0.95);
  ring.position.set(isMobile ? 0.55 : 1.05, isMobile ? 0.2 : 0.42, -2.5);
  ring.rotation.x = Math.PI * 0.45;
  ring.rotation.y = Math.PI * 0.16;
  heroGroup.add(ring);

  const orbGeometry = new THREE.IcosahedronGeometry(0.58, 1);
  const orbMaterial = new THREE.MeshStandardMaterial({
    color: 0x96ffe8,
    transparent: true,
    opacity: 0.78,
    roughness: 0.28,
    metalness: 0.24,
    emissive: 0x2db89e,
    emissiveIntensity: 0.26,
  });
  const orb = new THREE.Mesh(orbGeometry, orbMaterial);
  orb.position.set(isMobile ? -0.2 : 0.15, isMobile ? 0.5 : 0.72, -1.7);
  heroGroup.add(orb);

  const particleCount = 650;
  const particlesGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i += 1) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * 24;
    positions[i3 + 1] = (Math.random() - 0.5) * 14;
    positions[i3 + 2] = (Math.random() - 0.5) * 20;
  }

  particlesGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3),
  );
  const particlesMaterial = new THREE.PointsMaterial({
    color: 0xc7f9ff,
    size: 0.024,
    transparent: true,
    opacity: 0.55,
    blending: THREE.AdditiveBlending,
  });
  const particles = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(particles);

  function setRendererSize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.9));
    renderer.setSize(width, height);

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  setRendererSize();

  const pointer = { x: 0, y: 0 };
  window.addEventListener("pointermove", (event) => {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  });

  window.addEventListener("resize", setRendererSize);

  let frameId = 0;

  function animate() {
    const t = performance.now() * 0.001;

    if (!prefersReducedMotion) {
      knot.rotation.x += 0.0036;
      knot.rotation.y += 0.006;
      ring.rotation.z += 0.0018;
      orb.rotation.y -= 0.0042;
      orb.rotation.x += 0.0014;

      const targetX =
        (isMobile ? 1.05 : 1.5) + pointer.x * (isMobile ? 0.35 : 0.58);
      const targetY =
        (isMobile ? -0.42 : 0.06) + pointer.y * (isMobile ? 0.2 : 0.35);
      knot.position.x += (targetX - knot.position.x) * 0.02;
      knot.position.y += (targetY - knot.position.y) * 0.02;

      const scrollFactor = Math.min(
        (window.scrollY || 0) / window.innerHeight,
        1.2,
      );
      heroGroup.rotation.y += 0.0007;
      heroGroup.position.y = Math.sin(t * 0.55) * 0.1 - scrollFactor * 0.65;
      heroGroup.position.x = 0.08 + Math.sin(t * 0.35) * 0.06;

      camera.position.x += (pointer.x * 0.18 - camera.position.x) * 0.015;
      camera.position.y += (-pointer.y * 0.12 - camera.position.y) * 0.015;
      camera.lookAt(0, 0, -1.7);

      knotMaterial.emissiveIntensity = 0.28 + Math.sin(t * 1.6) * 0.08;
      orbMaterial.emissiveIntensity = 0.2 + Math.sin(t * 1.9 + 1.1) * 0.07;
      ringMaterial.opacity = 0.48 + Math.sin(t * 1.4 + 0.9) * 0.15;

      point.intensity = 1.5 + Math.sin(t * 1.25 + 0.6) * 0.18;
      fillLight.intensity = 0.9 + Math.sin(t * 1.1 + 2.1) * 0.12;

      particles.rotation.y += 0.0009;
      particles.rotation.x += 0.0004;
    }

    renderer.render(scene, camera);
    frameId = window.requestAnimationFrame(animate);
  }

  animate();

  window.addEventListener("beforeunload", () => {
    window.cancelAnimationFrame(frameId);
    particlesGeometry.dispose();
    particlesMaterial.dispose();
    knotGeometry.dispose();
    knotMaterial.dispose();
    ringGeometry.dispose();
    ringMaterial.dispose();
    orbGeometry.dispose();
    orbMaterial.dispose();
    renderer.dispose();
  });
}

function initRevealAnimations() {
  const revealNodes = document.querySelectorAll(".reveal");

  if (prefersReducedMotion) {
    revealNodes.forEach((node) => node.classList.add("show"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry, idx) => {
        if (!entry.isIntersecting) {
          return;
        }

        const delay = idx * 45;
        window.setTimeout(() => {
          entry.target.classList.add("show");
        }, delay);

        obs.unobserve(entry.target);
      });
    },
    {
      root: null,
      threshold: 0.15,
      rootMargin: "0px 0px -40px 0px",
    },
  );

  revealNodes.forEach((node) => observer.observe(node));

  if (typeof gsap !== "undefined") {
    gsap.from("header", {
      y: -50,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
    });
  }
}

const lenis = initSmoothScroll();
initBackToTop(lenis);
initMobileMenu();
initThreeBackground();
initRevealAnimations();
