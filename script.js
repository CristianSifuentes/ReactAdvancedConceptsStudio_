import * as React from "https://esm.sh/react@19";
import { createRoot } from "https://esm.sh/react-dom@19/client";
import htm from "https://esm.sh/htm@3.1.1";

const html = htm.bind(React.createElement);

const {
  StrictMode,
  Suspense,
  lazy,
  memo,
  startTransition,
  useCallback,
  useDeferredValue,
  useEffect,
  useId,
  useMemo,
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
  useTransition
} = React;

const formatNumber = new Intl.NumberFormat("es-ES");
const formatClock = new Intl.DateTimeFormat("es-ES", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit"
});

const code = (...lines) => lines.join("\n");

const CONCEPTS = [
  {
    id: "render",
    title: "Renderizado",
    accent: "cyan",
    badge: "Fundamento",
    summary:
      "React transforma JSX (o llamadas a createElement) en elementos React y luego en DOM real durante el render inicial.",
    interview:
      "Explica la diferencia entre JSX, React Element y DOM real en la fase de render.",
    points: [
      "Babel transpila JSX a React.createElement(...)",
      "El objetivo inmediato del render es producir React Elements",
      "El DOM real solo se toca al final del commit"
    ]
  },
  {
    id: "rerender",
    title: "Re-render",
    accent: "amber",
    badge: "Ciclo de vida",
    summary:
      "Un componente se vuelve a ejecutar cuando cambia su estado, sus props o cuando el padre re-renderiza (salvo optimizaciones).",
    interview:
      "¿Cuándo se re-renderiza un hijo y cuándo React.memo evita ese trabajo?",
    points: [
      "Cambios de state disparan nuevas ejecuciones",
      "Cambios de props propagan render al hijo",
      "React.memo evita render por padre si props son estables"
    ]
  },
  {
    id: "virtual-dom",
    title: "DOM Virtual",
    accent: "mint",
    badge: "Modelo mental",
    summary:
      "El Virtual DOM es una representación ligera en memoria; React compara versiones para minimizar cambios caros en el DOM real.",
    interview:
      "¿Por qué el DOM real es costoso y cómo ayuda el VDOM a reducir operaciones?",
    points: [
      "El VDOM es un árbol de objetos JavaScript",
      "React genera un nuevo árbol tras cambios de state/props",
      "Solo se parchean diferencias relevantes"
    ]
  },
  {
    id: "reconciliation",
    title: "Reconciliación",
    accent: "rose",
    badge: "Algoritmo",
    summary:
      "El diff de React detecta cambios comparando tipo de nodo y keys para decidir si reutilizar, actualizar o reemplazar nodos.",
    interview:
      "¿Qué pasa si cambias h1 por p? ¿Y si usas índices como key en listas?",
    points: [
      "Tipos distintos => React desmonta y recrea",
      "Mismo tipo => actualiza props y texto",
      "Lists + keys estables => identidad correcta y diff eficiente"
    ]
  },
  {
    id: "performance",
    title: "Performance",
    accent: "violet",
    badge: "Optimización",
    summary:
      "Memoización, transiciones y render diferido permiten interfaces fluidas incluso con cálculos y listas pesadas.",
    interview:
      "¿Cuándo usar useMemo/useCallback/useDeferredValue/useTransition y qué problema resuelve cada uno?",
    points: [
      "useMemo cachea cálculos costosos",
      "useCallback estabiliza referencias de funciones",
      "Transitions y deferred values priorizan UX"
    ]
  }
];

const CREATE_ELEMENT_EXAMPLES = [
  {
    id: "simple",
    title: "JSX simple",
    description: "Ejemplo mínimo del artículo: una etiqueta con texto.",
    jsx: code("const jsx = <h1>Hola, React!</h1>;"),
    createElement: code(
      'const element = React.createElement("h1", null, "Hola, React!");'
    ),
    factory() {
      return React.createElement("h1", null, "Hola, React!");
    }
  },
  {
    id: "nested",
    title: "Árbol anidado",
    description:
      "React recibe hijos como argumentos adicionales y construye un árbol de elementos.",
    jsx: code(
      "<div>",
      "  <h1>Hola</h1>",
      "  <p>Bienvenido a React</p>",
      "</div>"
    ),
    createElement: code(
      "const element = React.createElement(",
      '  "div",',
      "  null,",
      '  React.createElement("h1", null, "Hola"),',
      '  React.createElement("p", null, "Bienvenido a React")',
      ");"
    ),
    factory() {
      return React.createElement(
        "div",
        null,
        React.createElement("h1", null, "Hola"),
        React.createElement("p", null, "Bienvenido a React")
      );
    }
  },
  {
    id: "component",
    title: "Componente + props",
    description:
      "Cuando el type es una función/componente, React lo trata como nodo compuesto.",
    jsx: code('const jsx = <UserCard name="Shivam" age={22} />;'),
    createElement: code(
      "const element = React.createElement(UserCard, {",
      '  name: "Shivam",',
      "  age: 22",
      "});"
    ),
    factory() {
      function UserCard(props) {
        return React.createElement(
          "div",
          { className: "user-card-preview" },
          React.createElement("h2", null, props.name),
          React.createElement("p", null, `Edad: ${props.age}`)
        );
      }

      return React.createElement(UserCard, { name: "Shivam", age: 22 });
    }
  },
  {
    id: "complex",
    title: "Caso complejo",
    description:
      "Versión condensada del ejemplo completo del blog con botón y componente hijo.",
    jsx: code(
      "function App() {",
      "  return (",
      '    <div className="container">', 
      "      <h1>Bienvenido a React</h1>",
      '      <UserCard name="Shivam" age={22} />',
      '      <button onClick={() => alert("¡Botón pulsado!")}>',
      "        Haz clic en mí",
      "      </button>",
      "    </div>",
      "  );",
      "}"
    ),
    createElement: code(
      "function App() {",
      "  return React.createElement(",
      '    "div",',
      '    { className: "container" },',
      '    React.createElement("h1", null, "Bienvenido a React"),',
      '    React.createElement(UserCard, { name: "Shivam", age: 22 }),',
      "    React.createElement(",
      '      "button",',
      '      { onClick: () => alert("¡Botón pulsado!") },',
      '      "Haz clic en mí"',
      "    )",
      "  );",
      "}"
    ),
    factory() {
      function UserCard(props) {
        return React.createElement(
          "div",
          { className: "user-card-preview" },
          React.createElement("h2", null, props.name),
          React.createElement("p", null, `Edad: ${props.age}`)
        );
      }

      return React.createElement(
        "div",
        { className: "container" },
        React.createElement("h1", null, "Bienvenido a React"),
        React.createElement(UserCard, { name: "Shivam", age: 22 }),
        React.createElement(
          "button",
          { onClick: () => {} },
          "Haz clic en mí"
        )
      );
    }
  }
];

const PIPELINE_STEPS = [
  {
    step: "01",
    title: "JSX / createElement",
    body: "Escribes JSX o llamas a React.createElement manualmente. Ambos caminos producen React Elements."
  },
  {
    step: "02",
    title: "Render phase",
    body: "React ejecuta componentes y crea un árbol virtual (objetos JS) sin tocar aún el DOM real."
  },
  {
    step: "03",
    title: "Diff / Reconciliación",
    body: "Compara el nuevo árbol con el anterior: tipo, props y keys para detectar cambios mínimos."
  },
  {
    step: "04",
    title: "Commit",
    body: "Aplica el parche al DOM real, ejecuta efectos y actualiza lo visible en pantalla."
  }
];

const ROW_PERSONAS = ["A", "B", "C", "D", "E", "F", "G", "H"];
const ROW_COLORS = ["#63d3ff", "#ffbe6b", "#70f0bf", "#ff7a90", "#ad9bff", "#7ff5dc"];

const IDENTITY_START_ITEMS = [
  { id: 101, title: "Render inicial", kind: "render" },
  { id: 102, title: "Cambio de estado", kind: "rerender" },
  { id: 103, title: "DOM virtual", kind: "virtual-dom" },
  { id: 104, title: "Keys estables", kind: "reconciliation" },
  { id: 105, title: "Memoización", kind: "performance" }
];

const NEW_IDENTITY_LABELS = [
  "Batching automático",
  "StrictMode dev",
  "startTransition",
  "useDeferredValue",
  "React.memo",
  "Diff por tipo",
  "Fiber scheduling",
  "Suspense boundary"
];

const SEARCH_DATASET = buildSearchDataset();

function buildSearchDataset() {
  const entries = [];
  let id = 1;

  CONCEPTS.forEach((concept, index) => {
    entries.push({
      id: id++,
      title: concept.title,
      summary: concept.summary,
      facet: concept.id,
      level: ["Base", "Media", "Alta", "Alta", "Alta"][index],
      targetConcept: concept.id,
      tags: concept.points.join(" "),
      searchText: `${concept.title} ${concept.summary} ${concept.points.join(" ")} ${concept.interview}`.toLowerCase(),
      baseRank: 10 - index
    });
  });

  const vocab = [
    ["render", "commit", "jsx", "babel", "createElement"],
    ["memo", "callback", "props", "referencia", "hijo"],
    ["virtual", "dom", "diff", "arbol", "fiber"],
    ["key", "lista", "reconciliation", "identity", "mount"],
    ["transition", "deferred", "scheduler", "latencia", "search"]
  ];

  for (let i = 0; i < 1800; i += 1) {
    const concept = CONCEPTS[i % CONCEPTS.length];
    const group = vocab[i % vocab.length];
    const level = i % 5 === 0 ? "Alta" : i % 3 === 0 ? "Media" : "Base";
    const lesson = `Lab ${String(i + 1).padStart(4, "0")} · ${concept.title}`;
    const tagLine = `${group.join(" ")} ${concept.points[i % concept.points.length]}`;
    const summary =
      i % 7 === 0
        ? `Simulación de ${concept.title.toLowerCase()} enfocada en entrevistas frontend y optimización de UI.`
        : `Práctica guiada para entender ${concept.title.toLowerCase()} con escenarios de CSS Grid, Flex y React moderno.`;

    entries.push({
      id: id++,
      title: lesson,
      summary,
      facet: concept.id,
      level,
      targetConcept: null,
      tags: tagLine,
      searchText: `${lesson} ${summary} ${tagLine}`.toLowerCase(),
      baseRank: (i % 11) + 1
    });
  }

  return entries;
}

function nowMs() {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}

function scoreSearchEntry(entry, normalizedQuery) {
  if (!normalizedQuery) return entry.baseRank;

  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
  if (!tokens.length) return entry.baseRank;

  let score = 0;
  let hits = 0;

  for (const token of tokens) {
    const index = entry.searchText.indexOf(token);
    if (index >= 0) {
      hits += 1;
      score += 20;
      score += Math.max(0, 20 - Math.floor(index / 12));
    }
  }

  if (!hits) return 0;

  const bonusSource = entry.tags.toLowerCase();
  for (let i = 0; i < Math.min(18, bonusSource.length); i += 1) {
    score += bonusSource.charCodeAt(i) % 3;
  }

  if (entry.targetConcept) score += 15;
  if (entry.level === "Alta") score += 6;

  return score;
}

function filterSearchDataset(data, query, facet) {
  const started = nowMs();
  const normalizedQuery = query.trim().toLowerCase();
  const scored = [];

  for (let i = 0; i < data.length; i += 1) {
    const entry = data[i];
    if (facet !== "all" && entry.facet !== facet) continue;

    const score = scoreSearchEntry(entry, normalizedQuery);
    if (normalizedQuery && score === 0) continue;

    scored.push({ ...entry, score });
  }

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.title.length !== b.title.length) return a.title.length - b.title.length;
    return a.id - b.id;
  });

  const elapsed = Math.max(0.1, nowMs() - started);

  return {
    elapsed,
    total: scored.length,
    items: scored.slice(0, 24)
  };
}

function shuffleArray(items) {
  const next = items.slice();
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function identityReducer(state, action) {
  switch (action.type) {
    case "prepend": {
      const label = NEW_IDENTITY_LABELS[state.nextId % NEW_IDENTITY_LABELS.length];
      const concept = CONCEPTS[state.nextId % CONCEPTS.length];
      const newItem = {
        id: state.nextId,
        title: `${label} #${state.nextId}`,
        kind: concept.id
      };

      return {
        ...state,
        nextId: state.nextId + 1,
        lastAction: "prepend",
        items: [newItem, ...state.items]
      };
    }
    case "shuffle":
      return { ...state, lastAction: "shuffle", items: shuffleArray(state.items) };
    case "remove-middle": {
      if (state.items.length <= 1) return state;
      const middleIndex = Math.floor(state.items.length / 2);
      return {
        ...state,
        lastAction: "remove-middle",
        items: state.items.filter((_, index) => index !== middleIndex)
      };
    }
    case "reset":
      return {
        items: IDENTITY_START_ITEMS,
        nextId: 200,
        lastAction: "reset"
      };
    default:
      return state;
  }
}

const IDENTITY_INITIAL_STATE = {
  items: IDENTITY_START_ITEMS,
  nextId: 200,
  lastAction: "reset"
};

function estimateReconciliation(action, size) {
  const count = Math.max(1, size);

  switch (action) {
    case "prepend":
      return {
        keyed: "1 inserción y reutilización del resto por key",
        index: `${count} reasignaciones visuales (las filas cambian de identidad)`
      };
    case "shuffle":
      return {
        keyed: "React puede mover/reusar nodos con identidad correcta",
        index: "La UI puede mezclar estado local entre filas al cambiar posiciones"
      };
    case "remove-middle":
      return {
        keyed: "1 remoción y preservación del estado local en nodos restantes",
        index: `~${Math.max(1, count - 1)} filas posteriores pueden heredar estado incorrecto`
      };
    default:
      return {
        keyed: "Estado inicial: identidad consistente por key",
        index: "Comparación lista para demostrar problemas de keys por índice"
      };
  }
}

function serializeReactNode(node, depth = 0) {
  if (depth > 5) return "[Depth limit]";
  if (node == null) return node;
  if (typeof node === "string" || typeof node === "number" || typeof node === "boolean") {
    return node;
  }
  if (Array.isArray(node)) {
    return node.map((child) => serializeReactNode(child, depth + 1));
  }
  if (typeof node === "function") {
    return `[Function ${node.name || "anonymous"}]`;
  }

  if (React.isValidElement(node)) {
    const type =
      typeof node.type === "string"
        ? node.type
        : node.type === React.Fragment
          ? "React.Fragment"
          : node.type.displayName || node.type.name || "AnonymousComponent";

    const props = {};
    const rawProps = node.props || {};

    Object.keys(rawProps).forEach((key) => {
      const value = rawProps[key];
      if (typeof value === "function") {
        props[key] = `[Function ${value.name || "anonymous"}]`;
        return;
      }
      props[key] = serializeReactNode(value, depth + 1);
    });

    return {
      type,
      props,
      key: node.key ?? null,
      ref: null
    };
  }

  if (typeof node === "object") {
    const out = {};
    Object.keys(node)
      .slice(0, 10)
      .forEach((key) => {
        out[key] = serializeReactNode(node[key], depth + 1);
      });
    return out;
  }

  return String(node);
}

function cx(...values) {
  return values.filter(Boolean).join(" ");
}

function pushFeedReducer(state, action) {
  if (action.type !== "log") return state;
  const item = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    time: formatClock.format(new Date()),
    tone: action.tone || "info",
    text: action.text
  };
  return [item, ...state].slice(0, 12);
}

function createViewportStore() {
  const serverSnapshot = { width: 0, height: 0, breakpoint: "ssr", reducedMotion: false };
  let cachedSnapshot = serverSnapshot;

  function readSnapshot() {
    if (typeof window === "undefined") return serverSnapshot;

    const width = window.innerWidth;
    return {
      width,
      height: window.innerHeight,
      breakpoint: width < 720 ? "móvil" : width < 1120 ? "tablet" : "desktop",
      reducedMotion:
        typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
    };
  }

  function getSnapshot() {
    const next = readSnapshot();
    if (
      cachedSnapshot &&
      cachedSnapshot.width === next.width &&
      cachedSnapshot.height === next.height &&
      cachedSnapshot.breakpoint === next.breakpoint &&
      cachedSnapshot.reducedMotion === next.reducedMotion
    ) {
      return cachedSnapshot;
    }
    cachedSnapshot = next;
    return cachedSnapshot;
  }

  return {
    subscribe(listener) {
      if (typeof window === "undefined") return () => {};

      const handleResize = () => listener();
      window.addEventListener("resize", handleResize);

      let media = null;
      let handleMedia = null;

      if (typeof window.matchMedia === "function") {
        media = window.matchMedia("(prefers-reduced-motion: reduce)");
        handleMedia = () => listener();
        if (media.addEventListener) media.addEventListener("change", handleMedia);
        else if (media.addListener) media.addListener(handleMedia);
      }

      return () => {
        window.removeEventListener("resize", handleResize);
        if (media && handleMedia) {
          if (media.removeEventListener) media.removeEventListener("change", handleMedia);
          else if (media.removeListener) media.removeListener(handleMedia);
        }
      };
    },
    getSnapshot,
    getServerSnapshot() {
      return serverSnapshot;
    }
  };
}

function createClockStore() {
  const serverSnapshot = new Date(0);
  let current = new Date();

  return {
    subscribe(listener) {
      const id = setInterval(() => {
        current = new Date();
        listener();
      }, 1000);
      return () => clearInterval(id);
    },
    getSnapshot() {
      return current;
    },
    getServerSnapshot() {
      return serverSnapshot;
    }
  };
}


const viewportStore = createViewportStore();
const clockStore = createClockStore();

function useViewport() {
  return useSyncExternalStore(
    viewportStore.subscribe,
    viewportStore.getSnapshot,
    viewportStore.getServerSnapshot
  );
}

function useClock() {
  return useSyncExternalStore(
    clockStore.subscribe,
    clockStore.getSnapshot,
    clockStore.getServerSnapshot
  );
}

function useRenderCount() {
  const renders = useRef(0);
  renders.current += 1;
  return renders.current;
}

const HAS_USE_EFFECT_EVENT = typeof React.useEffectEvent === "function";

function useEffectEventCompat(callback) {
  const fallbackRef = useRef(callback);
  fallbackRef.current = callback;
  const fallbackStable = useCallback((...args) => fallbackRef.current(...args), []);

  if (!HAS_USE_EFFECT_EVENT) {
    return fallbackStable;
  }

  return React.useEffectEvent(callback);
}

function isTypingTarget(target) {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
}

function useConceptHotkeys(onSelectByIndex, onJumpToLabs) {
  const handleKey = useEffectEventCompat((event) => {
    if (isTypingTarget(event.target)) return;

    if (event.key === "g" || event.key === "G") {
      event.preventDefault();
      onJumpToLabs();
      return;
    }

    const numeric = Number(event.key);
    if (!Number.isInteger(numeric) || numeric < 1 || numeric > CONCEPTS.length) return;

    event.preventDefault();
    onSelectByIndex(numeric - 1);
  });

  useEffect(() => {
    function onKeyDown(event) {
      handleKey(event);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleKey]);
}

function scrollToSection(id, reducedMotion) {
  const target = document.getElementById(id);
  if (!target) return;
  target.scrollIntoView({
    behavior: reducedMotion ? "auto" : "smooth",
    block: "start"
  });
}

function App() {
  const viewport = useViewport();
  const appRenders = useRenderCount();
  const [selectedConceptId, setSelectedConceptId] = useState(CONCEPTS[0].id);
  const [themeIndex, setThemeIndex] = useState(0);
  const [feed, dispatchFeed] = useReducer(pushFeedReducer, [
    {
      id: "seed-1",
      time: formatClock.format(new Date()),
      tone: "info",
      text: "App inicializada: panel interactivo listo."
    }
  ]);
  const [isConceptPending, startConceptTransition] = useTransition();

  const selectedConcept = useMemo(
    () => CONCEPTS.find((item) => item.id === selectedConceptId) || CONCEPTS[0],
    [selectedConceptId]
  );

  const themes = ["theme-teal", "theme-copper", "theme-lime"];
  const themeClass = themes[themeIndex] || themes[0];

  const report = useCallback((text, tone = "info") => {
    dispatchFeed({ type: "log", text, tone });
  }, []);

  const handleSelectConcept = useCallback((conceptId) => {
    startConceptTransition(() => {
      setSelectedConceptId(conceptId);
    });
  }, []);

  const handleSelectConceptByIndex = useCallback(
    (index) => {
      const concept = CONCEPTS[index];
      if (!concept) return;
      handleSelectConcept(concept.id);
    },
    [handleSelectConcept]
  );

  const jumpToLabs = useCallback(() => {
    scrollToSection("labs", viewport.reducedMotion);
  }, [viewport.reducedMotion]);

  const jumpToTranslator = useCallback(() => {
    scrollToSection("create-element-lab", viewport.reducedMotion);
  }, [viewport.reducedMotion]);

  const cycleTheme = useCallback(() => {
    startTransition(() => {
      setThemeIndex((index) => (index + 1) % themes.length);
    });
  }, [themes.length]);

  useConceptHotkeys(handleSelectConceptByIndex, jumpToLabs);

  useEffect(() => {
    report(`Concepto activo: ${selectedConcept.title}`, "accent");
  }, [selectedConcept.id, selectedConcept.title, report]);

  useEffect(() => {
    report(
      `Viewport: ${viewport.breakpoint} (${Math.round(viewport.width)}x${Math.round(viewport.height)})`,
      "muted"
    );
  }, [viewport.breakpoint, viewport.width, viewport.height, report]);

  useEffect(() => {
    const modeName = themeClass.replace("theme-", "");
    report(`Tema visual cambiado: ${modeName}`, "accent");
  }, [themeClass, report]);

  return html`
    <div className=${cx("app", themeClass)}>
      <${Hero}
        selectedConcept=${selectedConcept}
        viewport=${viewport}
        appRenders=${appRenders}
        onJumpToLabs=${jumpToLabs}
        onJumpToTranslator=${jumpToTranslator}
        onCycleTheme=${cycleTheme}
        isConceptPending=${isConceptPending}
      />

      <div className="workspace">
        <${NavRail}
          concepts=${CONCEPTS}
          selectedConceptId=${selectedConceptId}
          onSelectConcept=${handleSelectConcept}
          isConceptPending=${isConceptPending}
        />

        <main className="main-column" id="main-content">
          <section className="overview-grid" id="overview">
            <${ConceptDeck}
              concepts=${CONCEPTS}
              selectedConceptId=${selectedConceptId}
              onSelectConcept=${handleSelectConcept}
            />
            <${PipelineBoard} selectedConcept=${selectedConcept} />
          </section>

          <${CreateElementLab}
            selectedConcept=${selectedConcept}
            onReport=${report}
          />

          <section className="labs-grid" id="labs" aria-label="Laboratorios interactivos">
            <${RerenderLab} onReport=${report} />
            <${ReconciliationLab} onReport=${report} />
          </section>

          <${PerformanceLab}
            onSelectConcept=${handleSelectConcept}
            onReport=${report}
          />
        </main>

        <${StatusRail}
          selectedConcept=${selectedConcept}
          viewport=${viewport}
          isConceptPending=${isConceptPending}
          feed=${feed}
          onReport=${report}
        />
      </div>
    </div>
  `;
}

function Hero({
  selectedConcept,
  viewport,
  appRenders,
  onJumpToLabs,
  onJumpToTranslator,
  onCycleTheme,
  isConceptPending
}) {
  return html`
    <header className="panel-card hero" role="banner">
      <div className="hero-copy">
        <p className="eyebrow">ReactJS 2026 · Advanced Concepts Studio</p>
        <h1>
          Dominando React avanzado con demos reales de
          <span className="gradient-text"> render, reconciliación y performance</span>
        </h1>
        <p className="hero-lede">
          App educativa construida en archivos <code>.html</code>, <code>.js</code> y
          <code>.css</code>, con arquitectura frontend modular, diseño responsive (CSS Grid +
          Flexbox) y hooks modernos de React.
        </p>
        <div className="hero-actions">
          <button className="btn btn-primary" onClick=${onJumpToLabs}>
            Abrir laboratorios
          </button>
          <button className="btn btn-ghost" onClick=${onJumpToTranslator}>
            Ver createElement Lab
          </button>
          <button className="btn btn-ghost" onClick=${onCycleTheme}>
            Cambiar tema
          </button>
        </div>
        <div className="hero-tags" aria-label="Tecnologías usadas">
          <span className="chip">React.memo</span>
          <span className="chip">useTransition</span>
          <span className="chip">useDeferredValue</span>
          <span className="chip">useSyncExternalStore</span>
          <span className="chip">Suspense + lazy</span>
          <span className="chip">CSS Grid / Flex</span>
        </div>
      </div>

      <div className="hero-metrics">
        <div className="metric-card">
          <p>Concepto activo</p>
          <strong>${selectedConcept.title}</strong>
          <span>${selectedConcept.badge}</span>
        </div>
        <div className="metric-card">
          <p>Viewport</p>
          <strong>${viewport.breakpoint}</strong>
          <span>${Math.round(viewport.width)} × ${Math.round(viewport.height)}</span>
        </div>
        <div className="metric-card">
          <p>Render app</p>
          <strong>#${appRenders}</strong>
          <span>${viewport.reducedMotion ? "Reduced motion: sí" : "Reduced motion: no"}</span>
        </div>
        <div className="metric-card ${isConceptPending ? "is-pending" : ""}">
          <p>Transición UI</p>
          <strong>${isConceptPending ? "Pendiente" : "Idle"}</strong>
          <span>Selección de conceptos con useTransition</span>
        </div>
      </div>
    </header>
  `;
}

function NavRail({ concepts, selectedConceptId, onSelectConcept, isConceptPending }) {
  return html`
    <aside className="rail nav-rail" aria-label="Navegación de conceptos">
      <section className="panel-card rail-card">
        <div className="rail-head">
          <p className="eyebrow small">Mapa del artículo</p>
          <h2>Conceptos clave</h2>
          <p>
            Usa <code>1-5</code> para cambiar concepto y <code>G</code> para saltar a
            laboratorios.
          </p>
        </div>

        <div className="concept-nav-list" role="list">
          ${concepts.map((concept, index) => {
            const isActive = concept.id === selectedConceptId;
            return html`
              <button
                key=${concept.id}
                className=${cx("concept-nav-item", isActive && "is-active")}
                onClick=${() => onSelectConcept(concept.id)}
                aria-pressed=${isActive}
              >
                <span className="index-pill">${index + 1}</span>
                <span className="concept-nav-copy">
                  <strong>${concept.title}</strong>
                  <small>${concept.badge}</small>
                </span>
                <span className=${cx("dot", `tone-${concept.accent}`)}></span>
              </button>
            `;
          })}
        </div>
      </section>

      <section className="panel-card rail-card compact">
        <h3>Resumen de enfoque</h3>
        <ul className="rail-list">
          <li>Explicación conceptual + demo interactiva</li>
          <li>Observabilidad de render y diff visual</li>
          <li>UI responsive con Grid/Flex y accesibilidad base</li>
        </ul>
        <div className="status-row">
          <span className="chip soft">
            ${isConceptPending ? "Cambiando concepto..." : "Navegación lista"}
          </span>
        </div>
      </section>
    </aside>
  `;
}

function ConceptDeck({ concepts, selectedConceptId, onSelectConcept }) {
  return html`
    <section className="panel-card concept-deck" aria-labelledby="concept-deck-title">
      <div className="section-head">
        <div>
          <p className="eyebrow small">Resumen experto</p>
          <h2 id="concept-deck-title">Qué debes dominar para entrevistas y diseño de UI</h2>
        </div>
        <p className="section-note">
          Cada tarjeta resume el concepto, el razonamiento técnico y la pregunta típica de
          entrevista.
        </p>
      </div>

      <div className="concept-grid">
        ${concepts.map((concept) => {
          const active = concept.id === selectedConceptId;
          return html`
            <article
              key=${concept.id}
              className=${cx("concept-card", active && "is-active", `tone-${concept.accent}`)}
            >
              <div className="concept-card-head">
                <span className="badge">${concept.badge}</span>
                <button className="mini-btn" onClick=${() => onSelectConcept(concept.id)}>
                  ${active ? "Activo" : "Abrir"}
                </button>
              </div>
              <h3>${concept.title}</h3>
              <p>${concept.summary}</p>
              <ul>
                ${concept.points.map((point) => html`<li key=${point}>${point}</li>`)}
              </ul>
              <div className="concept-question">
                <span>Pregunta entrevista</span>
                <p>${concept.interview}</p>
              </div>
            </article>
          `;
        })}
      </div>
    </section>
  `;
}

function PipelineBoard({ selectedConcept }) {
  return html`
    <section className="panel-card pipeline-board" aria-labelledby="pipeline-title">
      <div className="section-head">
        <div>
          <p className="eyebrow small">Pipeline React</p>
          <h2 id="pipeline-title">Del JSX al DOM real</h2>
        </div>
      </div>

      <div className="pipeline-list">
        ${PIPELINE_STEPS.map(
          (step) => html`
            <article key=${step.step} className="pipeline-step">
              <div className="pipeline-marker">${step.step}</div>
              <div className="pipeline-copy">
                <h3>${step.title}</h3>
                <p>${step.body}</p>
              </div>
            </article>
          `
        )}
      </div>

      <div className="pipeline-highlight">
        <p className="eyebrow small">Conexión con el concepto activo</p>
        <h3>${selectedConcept.title}</h3>
        <p>${selectedConcept.summary}</p>
      </div>
    </section>
  `;
}

function CreateElementLab({ selectedConcept, onReport }) {
  const [exampleId, setExampleId] = useState(CREATE_ELEMENT_EXAMPLES[0].id);
  const [focusPane, setFocusPane] = useState("all");
  const tabsId = useId();

  const selectedExample = useMemo(
    () => CREATE_ELEMENT_EXAMPLES.find((item) => item.id === exampleId) || CREATE_ELEMENT_EXAMPLES[0],
    [exampleId]
  );

  const elementPreview = useMemo(() => {
    const element = selectedExample.factory();
    return JSON.stringify(serializeReactNode(element), null, 2);
  }, [selectedExample]);

  useEffect(() => {
    onReport(`CreateElement Lab: ejemplo "${selectedExample.title}" seleccionado`, "muted");
  }, [selectedExample.id, selectedExample.title, onReport]);

  return html`
    <section
      className="panel-card create-lab"
      id="create-element-lab"
      aria-labelledby="create-element-title"
    >
      <div className="section-head">
        <div>
          <p className="eyebrow small">Laboratorio 1</p>
          <h2 id="create-element-title">JSX → React.createElement → React Element</h2>
        </div>
        <p className="section-note">
          Basado en el artículo: selecciona un ejemplo y observa cómo cambia la salida del objeto
          React Element.
        </p>
      </div>

      <div className="toolbar-group" role="tablist" aria-label="Ejemplos" id=${tabsId}>
        ${CREATE_ELEMENT_EXAMPLES.map((example) => html`
          <button
            key=${example.id}
            role="tab"
            aria-selected=${example.id === exampleId}
            className=${cx("seg-btn", example.id === exampleId && "is-active")}
            onClick=${() => setExampleId(example.id)}
          >
            ${example.title}
          </button>
        `)}
      </div>

      <div className="toolbar-group compact" role="group" aria-label="Foco de panel">
        ${["all", "jsx", "create", "object"].map((pane) => html`
          <button
            key=${pane}
            className=${cx("seg-btn", "mini", focusPane === pane && "is-active")}
            onClick=${() => setFocusPane(pane)}
            aria-pressed=${focusPane === pane}
          >
            ${pane === "all" ? "Ver todo" : pane}
          </button>
        `)}
      </div>

      <div className="lab-context">
        <p>${selectedExample.description}</p>
        <span className="chip soft">Relacionado con: ${selectedConcept.title}</span>
      </div>

      <div className=${cx("code-grid", focusPane !== "all" && "is-focused")}>
        ${(focusPane === "all" || focusPane === "jsx") &&
        html`
          <article className="code-pane">
            <div className="pane-head">
              <span className="pane-label">JSX</span>
              <span className="pane-meta">Fuente</span>
            </div>
            <pre><code>${selectedExample.jsx}</code></pre>
          </article>
        `}

        ${(focusPane === "all" || focusPane === "create") &&
        html`
          <article className="code-pane">
            <div className="pane-head">
              <span className="pane-label">React.createElement()</span>
              <span className="pane-meta">Salida de Babel (conceptual)</span>
            </div>
            <pre><code>${selectedExample.createElement}</code></pre>
          </article>
        `}

        ${(focusPane === "all" || focusPane === "object") &&
        html`
          <article className="code-pane object-pane">
            <div className="pane-head">
              <span className="pane-label">React Element (serializado)</span>
              <span className="pane-meta">Objeto JS</span>
            </div>
            <pre><code>${elementPreview}</code></pre>
          </article>
        `}
      </div>
    </section>
  `;
}

function ProbeCard({ title, description, children, tone }) {
  return html`
    <article className=${cx("probe-card", tone && `tone-${tone}`)}>
      <div className="probe-headline">
        <h4>${title}</h4>
        <p>${description}</p>
      </div>
      <div className="probe-body">${children}</div>
    </article>
  `;
}

function PlainPassiveChild() {
  const renders = useRenderCount();
  return html`
    <div className="probe-mini">
      <div className="probe-mini-row">
        <span>Sin memo</span>
        <span className="chip soft">render #${renders}</span>
      </div>
      <p>Se renderiza cada vez que el padre se renderiza, aunque sus props no cambien.</p>
    </div>
  `;
}

const MemoPassiveChild = memo(function MemoPassiveChild() {
  const renders = useRenderCount();
  return html`
    <div className="probe-mini">
      <div className="probe-mini-row">
        <span>React.memo</span>
        <span className="chip soft">render #${renders}</span>
      </div>
      <p>Se salta el render si el padre cambia pero las props permanecen iguales.</p>
    </div>
  `;
});

function PlainCounterChild({ count }) {
  const renders = useRenderCount();
  return html`
    <div className="probe-mini">
      <div className="probe-mini-row">
        <span>Hijo (props count)</span>
        <span className="chip soft">render #${renders}</span>
      </div>
      <p>
        count = <strong>${count}</strong> · Cambia cuando la prop cambia.
      </p>
    </div>
  `;
}

const MemoCounterChild = memo(function MemoCounterChild({ count }) {
  const renders = useRenderCount();
  return html`
    <div className="probe-mini">
      <div className="probe-mini-row">
        <span>Memo + count</span>
        <span className="chip soft">render #${renders}</span>
      </div>
      <p>
        count = <strong>${count}</strong> · Se re-renderiza cuando cambia la prop.
      </p>
    </div>
  `;
});

const CallbackChild = memo(function CallbackChild({ onPing, modeLabel }) {
  const renders = useRenderCount();
  return html`
    <div className="probe-mini">
      <div className="probe-mini-row">
        <span>Función como prop</span>
        <span className="chip soft">render #${renders}</span>
      </div>
      <p>Modo callback: <strong>${modeLabel}</strong></p>
      <button className="mini-btn" onClick=${onPing}>Invocar callback</button>
    </div>
  `;
});

function logListReducer(state, action) {
  if (action.type !== "push") return state;
  const next = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    text: action.text
  };
  return [next, ...state].slice(0, 8);
}

function RerenderLab({ onReport }) {
  const [count, setCount] = useState(0);
  const [draft, setDraft] = useState("");
  const [callbackMode, setCallbackMode] = useState("stable");
  const [pings, setPings] = useState(0);
  const [logs, dispatchLogs] = useReducer(logListReducer, []);
  const parentRenders = useRenderCount();

  const pushLog = useCallback((text) => {
    dispatchLogs({ type: "push", text });
  }, []);

  const stablePing = useCallback(() => {
    setPings((value) => value + 1);
    pushLog("Callback memoizado (useCallback) ejecutado");
    onReport("Rerender Lab: callback estable ejecutado", "accent");
  }, [pushLog, onReport]);

  const unstablePing = () => {
    setPings((value) => value + 1);
    pushLog("Callback no memoizado ejecutado");
    onReport("Rerender Lab: callback no memoizado ejecutado", "muted");
  };

  const callbackHandler = callbackMode === "stable" ? stablePing : unstablePing;

  return html`
    <section className="panel-card rerender-lab" aria-labelledby="rerender-title">
      <div className="section-head">
        <div>
          <p className="eyebrow small">Laboratorio 2</p>
          <h2 id="rerender-title">Re-render simulator: state, props, padre y memo</h2>
        </div>
        <div className="inline-stats">
          <span className="chip soft">Parent render #${parentRenders}</span>
          <span className="chip soft">Pings: ${pings}</span>
        </div>
      </div>

      <div className="control-row">
        <button
          className="btn btn-primary"
          onClick=${() => {
            setCount((value) => value + 1);
            pushLog("count cambió => re-render del padre + hijos con props afectadas");
            onReport("Rerender Lab: incremento de count", "accent");
          }}
        >
          Incrementar count
        </button>
        <button
          className="btn btn-ghost"
          onClick=${() => {
            setDraft("");
            pushLog("texto limpiado (state no relacionado)");
          }}
        >
          Limpiar texto
        </button>
        <button
          className="btn btn-ghost"
          onClick=${() => {
            setCallbackMode((mode) => (mode === "stable" ? "unstable" : "stable"));
            pushLog(
              callbackMode === "stable"
                ? "Cambiaste a callback NO memoizado"
                : "Cambiaste a callback memoizado (useCallback)"
            );
          }}
        >
          Callback: ${callbackMode === "stable" ? "estable" : "inestable"}
        </button>
      </div>

      <label className="field">
        <span>State no relacionado (escribe aquí)</span>
        <input
          value=${draft}
          onInput=${(event) => {
            setDraft(event.target.value);
            pushLog("texto actualizado => padre se re-renderiza");
          }}
          placeholder="Prueba re-render por state no relacionado"
        />
      </label>

      <div className="probe-grid">
        <${ProbeCard}
          title="Condición 1 y 2"
          description="Cambios de state/props vuelven a renderizar. React.memo no evita cambios reales."
          tone="amber"
        >
          <div className="probe-stack">
            <${PlainCounterChild} count=${count} />
            <${MemoCounterChild} count=${count} />
          </div>
        </${ProbeCard}>

        <${ProbeCard}
          title="Condición 3"
          description="El padre re-renderiza. Sin memo, el hijo vuelve a renderizar aunque no cambien props."
          tone="cyan"
        >
          <div className="probe-stack">
            <${PlainPassiveChild} />
            <${MemoPassiveChild} />
          </div>
        </${ProbeCard}>

        <${ProbeCard}
          title="useCallback + React.memo"
          description="La referencia de función estable evita renders innecesarios en hijos memoizados."
          tone="mint"
        >
          <div className="probe-stack">
            <${CallbackChild}
              onPing=${callbackHandler}
              modeLabel=${callbackMode === "stable" ? "useCallback" : "nueva función por render"}
            />
          </div>
        </${ProbeCard}>
      </div>

      <div className="lab-footnote">
        <p>
          Nota: en <code>StrictMode</code> y entorno de desarrollo, React puede invocar renders
          adicionales para detectar efectos secundarios.
        </p>
      </div>

      <div className="event-list" aria-live="polite">
        ${logs.length
          ? logs.map((log) => html`<p key=${log.id}>${log.text}</p>`)
          : html`<p>Interacciona con el panel para ver eventos de re-render.</p>`}
      </div>
    </section>
  `;
}

function StateIdentityRow({ item, position, strategy }) {
  const renders = useRenderCount();
  const [persona] = useState(() => ROW_PERSONAS[Math.floor(Math.random() * ROW_PERSONAS.length)]);
  const [tone] = useState(() => ROW_COLORS[Math.floor(Math.random() * ROW_COLORS.length)]);
  const mountToken = useRef(Math.random().toString(36).slice(2, 6).toUpperCase());

  return html`
    <li className="identity-row" style=${{ "--row-accent": tone }}>
      <div className="identity-row-main">
        <span className="index-pill">${position + 1}</span>
        <div className="identity-copy">
          <strong>${item.title}</strong>
          <small>
            key: ${strategy === "keyed" ? item.id : position} · estado local = ${persona}
          </small>
        </div>
      </div>
      <div className="identity-row-meta">
        <span className="chip soft">mount ${mountToken.current}</span>
        <span className="chip soft">r#${renders}</span>
      </div>
    </li>
  `;
}

function IdentityListPreview({ items, strategy, title, subtitle }) {
  return html`
    <article className="identity-column">
      <div className="identity-head">
        <h4>${title}</h4>
        <p>${subtitle}</p>
      </div>
      <ol className="identity-list">
        ${items.map((item, position) => html`
          <${StateIdentityRow}
            key=${strategy === "keyed" ? item.id : position}
            item=${item}
            position=${position}
            strategy=${strategy}
          />
        `)}
      </ol>
    </article>
  `;
}

function ReconciliationLab({ onReport }) {
  const [state, dispatch] = useReducer(identityReducer, IDENTITY_INITIAL_STATE);
  const [showHints, setShowHints] = useState(true);
  const hint = useMemo(
    () => estimateReconciliation(state.lastAction, state.items.length),
    [state.lastAction, state.items.length]
  );

  const runAction = useCallback(
    (type) => {
      startTransition(() => {
        dispatch({ type });
      });
      onReport(`Reconciliación: acción "${type}" aplicada`, "accent");
    },
    [onReport]
  );

  return html`
    <section className="panel-card reconciliation-lab" aria-labelledby="reconciliation-title">
      <div className="section-head">
        <div>
          <p className="eyebrow small">Laboratorio 3</p>
          <h2 id="reconciliation-title">Reconciliación visual: keys estables vs índices</h2>
        </div>
        <span className="chip soft">Acción actual: ${state.lastAction}</span>
      </div>

      <div className="control-row">
        <button className="btn btn-primary" onClick=${() => runAction("prepend")}>
          Insertar al inicio
        </button>
        <button className="btn btn-ghost" onClick=${() => runAction("shuffle")}>
          Mezclar lista
        </button>
        <button className="btn btn-ghost" onClick=${() => runAction("remove-middle")}>
          Remover centro
        </button>
        <button className="btn btn-ghost" onClick=${() => runAction("reset")}>
          Reset
        </button>
        <button
          className="btn btn-ghost"
          onClick=${() => setShowHints((value) => !value)}
          aria-pressed=${showHints}
        >
          ${showHints ? "Ocultar tips" : "Mostrar tips"}
        </button>
      </div>

      ${showHints &&
      html`
        <div className="compare-hints">
          <div className="hint-card">
            <h4>Con keys estables</h4>
            <p>${hint.keyed}</p>
          </div>
          <div className="hint-card">
            <h4>Con índice como key</h4>
            <p>${hint.index}</p>
          </div>
        </div>
      `}

      <div className="identity-compare">
        <${IdentityListPreview}
          items=${state.items}
          strategy="keyed"
          title="Lista con key={item.id}"
          subtitle="Identidad preservada correctamente"
        />
        <${IdentityListPreview}
          items=${state.items}
          strategy="indexed"
          title="Lista con key={index}"
          subtitle="Puede mezclar estado local al mover filas"
        />
      </div>
    </section>
  `;
}

function labelForFacet(facet) {
  if (facet === "all") return "Todos";
  const concept = CONCEPTS.find((item) => item.id === facet);
  return concept ? concept.title : facet;
}

function toneForFacet(facet) {
  const concept = CONCEPTS.find((item) => item.id === facet);
  return concept ? concept.accent : "cyan";
}

function PerformanceLab({ onSelectConcept, onReport }) {
  const searchId = useId();
  const [facet, setFacet] = useState("all");
  const [inputValue, setInputValue] = useState("");
  const [query, setQuery] = useState("");
  const [isPending, startFilterTransition] = useTransition();
  const deferredQuery = useDeferredValue(query);

  const resultModel = useMemo(
    () => filterSearchDataset(SEARCH_DATASET, deferredQuery, facet),
    [deferredQuery, facet]
  );

  const deferredLag = deferredQuery !== query;

  const handleFacetChange = useCallback(
    (nextFacet) => {
      setFacet(nextFacet);
      onReport(`Performance Lab: filtro por concepto "${nextFacet}"`, "muted");
    },
    [onReport]
  );

  return html`
    <section className="panel-card performance-lab" aria-labelledby="performance-title">
      <div className="section-head">
        <div>
          <p className="eyebrow small">Laboratorio 4</p>
          <h2 id="performance-title">Performance studio: memoización + transiciones + deferred UI</h2>
        </div>
        <div className="inline-stats">
          <span className="chip soft">Resultados: ${formatNumber.format(resultModel.total)}</span>
          <span className="chip soft">${resultModel.elapsed.toFixed(1)} ms</span>
          <span className=${cx("chip soft", isPending && "is-pending")}>
            ${isPending ? "Calculando..." : "Fluido"}
          </span>
        </div>
      </div>

      <div className="search-layout">
        <div className="search-controls">
          <label className="field" htmlFor=${searchId}>
            <span>Buscar en dataset grande (useTransition + useDeferredValue)</span>
            <input
              id=${searchId}
              value=${inputValue}
              onInput=${(event) => {
                const next = event.target.value;
                setInputValue(next);
                startFilterTransition(() => {
                  setQuery(next);
                });
              }}
              placeholder="Ej: keys, virtual dom, memo, transition..."
            />
          </label>

          <div className="toolbar-group compact" role="group" aria-label="Filtro por concepto">
            ${[
              { id: "all", label: "Todos" },
              ...CONCEPTS.map((concept) => ({ id: concept.id, label: concept.title }))
            ].map((item) => html`
              <button
                key=${item.id}
                className=${cx("seg-btn", "mini", facet === item.id && "is-active")}
                onClick=${() => handleFacetChange(item.id)}
                aria-pressed=${facet === item.id}
              >
                ${item.label}
              </button>
            `)}
          </div>

          <div className="perf-notes">
            <p>
              <strong>query urgente:</strong> <code>${query || "∅"}</code>
            </p>
            <p>
              <strong>query diferida:</strong> <code>${deferredQuery || "∅"}</code>
              ${deferredLag ? html`<span className="chip soft">desfasada para mantener fluidez</span>` : ""}
            </p>
            <p>
              <strong>Hook usados:</strong> <code>useMemo</code>, <code>useTransition</code>,
              <code>useDeferredValue</code>, <code>useId</code>.
            </p>
          </div>
        </div>

        <div className="results-panel" aria-busy=${isPending}>
          <div className="results-grid">
            ${resultModel.items.map((item) => html`
              <article key=${item.id} className="result-card">
                <div className="result-head">
                  <span className=${cx("badge", `tone-${toneForFacet(item.facet)}`)}>
                    ${labelForFacet(item.facet)}
                  </span>
                  <span className="chip soft">score ${item.score}</span>
                </div>
                <h3>${item.title}</h3>
                <p>${item.summary}</p>
                <div className="result-foot">
                  <span className="chip soft">Nivel ${item.level}</span>
                  ${item.targetConcept
                    ? html`
                        <button
                          className="mini-btn"
                          onClick=${() => {
                            onSelectConcept(item.targetConcept);
                            onReport(
                              `Performance Lab: navegación rápida a ${labelForFacet(item.targetConcept)}`,
                              "accent"
                            );
                          }}
                        >
                          Ir al concepto
                        </button>
                      `
                    : html`<span className="chip soft">Dataset sintético</span>`}
                </div>
              </article>
            `)}
          </div>
        </div>
      </div>
    </section>
  `;
}

function StatusRail({ selectedConcept, viewport, isConceptPending, feed, onReport }) {
  const clock = useClock();

  return html`
    <aside className="rail status-rail" aria-label="Panel de estado y arquitectura">
      <section className="panel-card rail-card">
        <div className="rail-head">
          <p className="eyebrow small">Observabilidad</p>
          <h2>Estado en vivo</h2>
        </div>
        <div className="status-grid">
          <div className="status-tile">
            <span>Hora</span>
            <strong>${formatClock.format(clock)}</strong>
          </div>
          <div className="status-tile">
            <span>Viewport</span>
            <strong>${viewport.breakpoint}</strong>
          </div>
          <div className="status-tile">
            <span>Concepto</span>
            <strong>${selectedConcept.title}</strong>
          </div>
          <div className="status-tile">
            <span>Transition</span>
            <strong>${isConceptPending ? "pending" : "idle"}</strong>
          </div>
        </div>
      </section>

      <${StabilitySandbox} onReport=${onReport} />

      <${Suspense}
        fallback=${html`
          <section className="panel-card rail-card">
            <div className="rail-head">
              <p className="eyebrow small">Carga diferida</p>
              <h2>Checklist (lazy)</h2>
            </div>
            <p className="skeleton-line">Cargando panel con React.lazy + Suspense...</p>
            <p className="skeleton-line short"></p>
          </section>
        `}
      >
        <${LazyChecklistPanel} selectedConcept=${selectedConcept} />
      </${Suspense}>

      <section className="panel-card rail-card">
        <div className="rail-head">
          <p className="eyebrow small">Atajos</p>
          <h2>Keyboard UX</h2>
        </div>
        <ul className="rail-list">
          <li><code>1-5</code> cambia concepto activo</li>
          <li><code>G</code> navega al bloque de laboratorios</li>
          <li>Focus visible + botones semánticos</li>
        </ul>
      </section>

      <section className="panel-card rail-card">
        <div className="rail-head">
          <p className="eyebrow small">Activity feed</p>
          <h2>Eventos recientes</h2>
        </div>
        <div className="feed-list" aria-live="polite">
          ${feed.map((item) => html`
            <div key=${item.id} className=${cx("feed-item", `tone-${item.tone}`)}>
              <span className="feed-time">${item.time}</span>
              <p>${item.text}</p>
            </div>
          `)}
        </div>
      </section>
    </aside>
  `;
}

class DemoErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
    this.handleReset = this.handleReset.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error) {
    if (typeof this.props.onReport === "function") {
      this.props.onReport(`ErrorBoundary capturó: ${error.message}`, "warn");
    }
  }

  handleReset() {
    this.setState({ error: null });
  }

  render() {
    if (this.state.error) {
      return html`
        <div className="boundary-error">
          <p className="eyebrow small">Error capturado</p>
          <h3>UI recuperable</h3>
          <p>${this.state.error.message}</p>
          <button className="btn btn-ghost" onClick=${this.handleReset}>
            Reset boundary
          </button>
        </div>
      `;
    }

    return this.props.children;
  }
}

function CrashySnippet({ explode }) {
  if (explode) {
    throw new Error("Fallo de demo activado para probar ErrorBoundary");
  }

  return html`
    <div className="boundary-ok">
      <p>Componente estable. Cambia el estado para provocar un fallo controlado.</p>
      <pre><code>${code("function Widget() {", "  return <Panel />;", "}")}</code></pre>
    </div>
  `;
}

function StabilitySandbox({ onReport }) {
  const [explode, setExplode] = useState(false);
  const [instanceKey, setInstanceKey] = useState(0);

  return html`
    <section className="panel-card rail-card">
      <div className="rail-head">
        <p className="eyebrow small">Arquitectura defensiva</p>
        <h2>Error Boundary demo</h2>
        <p>Un fallo en un widget no debería tumbar toda la interfaz.</p>
      </div>

      <div className="control-row compact">
        <button
          className="btn btn-primary"
          onClick=${() => {
            setExplode(true);
            onReport("Se activó un error controlado en el sandbox", "warn");
          }}
        >
          Provocar error
        </button>
        <button
          className="btn btn-ghost"
          onClick=${() => {
            setExplode(false);
            setInstanceKey((value) => value + 1);
            onReport("Sandbox reiniciado manualmente", "muted");
          }}
        >
          Reiniciar sandbox
        </button>
      </div>

      <div className="boundary-shell">
        <${DemoErrorBoundary} key=${instanceKey} onReport=${onReport}>
          <${CrashySnippet} explode=${explode} />
        </${DemoErrorBoundary}>
      </div>
    </section>
  `;
}

function ChecklistPanel({ selectedConcept }) {
  const checklist = [
    "Diferenciar render vs commit y explicar dónde vive el VDOM",
    "Describir cuándo React.memo sí ayuda y cuándo no",
    "Argumentar por qué key=index rompe identidad en listas mutables",
    "Elegir entre useMemo, useCallback, useDeferredValue y useTransition",
    "Hablar de StrictMode dev y dobles renders sin confundir producción"
  ];

  return html`
    <section className="panel-card rail-card">
      <div className="rail-head">
        <p className="eyebrow small">Carga diferida</p>
        <h2>Checklist de entrevista (lazy)</h2>
        <p>
          Este panel se carga con <code>React.lazy</code> + <code>Suspense</code>.
        </p>
      </div>
      <div className="checklist">
        ${checklist.map((item, index) => html`
          <div key=${item} className="check-item">
            <span className="index-pill">${index + 1}</span>
            <p>${item}</p>
          </div>
        `)}
      </div>
      <div className="status-row">
        <span className="chip soft">Repasa ahora: ${selectedConcept.title}</span>
      </div>
    </section>
  `;
}

const LazyChecklistPanel = lazy(
  () =>
    new Promise((resolve) => {
      setTimeout(() => resolve({ default: ChecklistPanel }), 600);
    })
);

function mountApp() {
  const rootElement = document.getElementById("root");
  if (!rootElement) return;

  const root = createRoot(rootElement);
  root.render(html`<${StrictMode}><${App} /></${StrictMode}>`);
}

mountApp();
