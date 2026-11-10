import React, { useState, useEffect, useMemo } from "react";

// --- Storage Keys ---
const CONFIG_STORAGE_KEY = "bingo_saved_config_v2";
const SEED_STORAGE_KEY = "bingo_player_seed";
const FREE_SPACE_ID = "__FREE_SPACE__";

// --- Pre-loaded Default Data ---
const DEFAULT_TITLE = "Yoshi's Stream Bingo";
const DEFAULT_FREE_SPACE = "yelling at petters";

const DEFAULT_ITEMS = [
  '"SCREW YOU"',
  "Slayer brings a tail",
  "Doesn't notice a tail for 30min +",
  'Says "I can\'t lie" with little reason for it',
  '"Are you serious/are you joking?"',
  "Mic peaks from yelling",
  "Poor form on push ups",
  'Asks a question and says "be honest"',
  '"Rats"',
  "Messkey slander",
  "Gets mad at a LO train",
  '"GET BANNED"',
  "Solo bw win",
  "Checks for tails when there are none",
  "Audible desk slamming",
  "Completely misses tails when walking by them",
  "Manchild mention",
  "Chat breaks",
  "ELBOOOWWW",
  "Labors someone",
  '"REAL" FOOTBALL mention',
  "Mentioning Katsu's sleep schedule",
  "MEHMEHMEH",
  "Bluestone / failing to get a good first word that comes to mind",
  "DEL -- POGGG",
  "Refusing to make an animal noise",
  "!garlicbread mention",
  "Stimming Messkeyyyy",
  "WHY ARE WE TWERKING",
  "YOU'RE THE WORST",
  "Heck yeah!",
  "W A T",
  "Tells someone to “get outta here”",
  "Denies dating Slayer",
  "Slayer, Elsa, Kang old jokes",
  "Messkey HO OHHHH laugh",
  '"What is that" to a gif/emote',
  "Furry denial",
  "LOcationphobia (NY..LU..etc)",
  "Celebrates a retired T3",
].join("\n");

const DEFAULT_ITEMS_LIST = DEFAULT_ITEMS.split("\n")
  .map((line) => line.trim())
  .filter((line) => line.length > 0);

// --- Yoshi Egg Color Palette (Classic Yoshi's Island colors) ---
const YOSHI_PALETTE = [
  {
    name: "Green",
    hex: "#4ade80",
    bg: "bg-emerald-500",
    border: "border-emerald-600",
    text: "text-emerald-950",
    lightBg: "bg-emerald-100",
  },
  {
    name: "Pink",
    hex: "#f472b6",
    bg: "bg-pink-400",
    border: "border-pink-600",
    text: "text-pink-950",
    lightBg: "bg-pink-100",
  },
  {
    name: "Light Blue",
    hex: "#38bdf8",
    bg: "bg-sky-400",
    border: "border-sky-600",
    text: "text-sky-950",
    lightBg: "bg-sky-100",
  },
  {
    name: "Yellow",
    hex: "#facc15",
    bg: "bg-amber-300",
    border: "border-amber-500",
    text: "text-amber-950",
    lightBg: "bg-amber-100",
  },
  {
    name: "Red",
    hex: "#f87171",
    bg: "bg-rose-500",
    border: "border-rose-700",
    text: "text-rose-950",
    lightBg: "bg-rose-100",
  },
  {
    name: "Purple",
    hex: "#c084fc",
    bg: "bg-purple-400",
    border: "border-purple-600",
    text: "text-purple-950",
    lightBg: "bg-purple-100",
  },
];

// --- Custom Inline SVG: Spotted Yoshi Egg ---
function YoshiEggIcon({ spotColor = "#22c55e", className = "w-8 h-8" }) {
  return (
    <svg
      viewBox="0 0 64 76"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M32 4C16 4 6 28 6 47C6 63.5 17.5 72 32 72C46.5 72 58 63.5 58 47C58 28 48 4 32 4Z"
        fill="#FFFFFF"
        stroke="#14532d"
        strokeWidth="4.5"
      />
      <circle cx="22" cy="26" r="7.5" fill={spotColor} />
      <circle cx="43" cy="36" r="9.5" fill={spotColor} />
      <circle cx="23" cy="53" r="10.5" fill={spotColor} />
      <circle cx="44" cy="58" r="5.5" fill={spotColor} />
      <circle cx="33" cy="14" r="4.5" fill={spotColor} />
      <path
        d="M32 4C16 4 6 28 6 47C6 63.5 17.5 72 32 72C46.5 72 58 63.5 58 47C58 28 48 4 32 4Z"
        stroke="#14532d"
        strokeWidth="4.5"
      />
    </svg>
  );
}

// --- Custom Inline SVG: Yoshi Smiley Flower (For BINGO lines!) ---
function SmileyFlowerIcon({ className = "w-7 h-7" }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="32" cy="11" r="10" fill="#FFFFFF" stroke="#854d0e" strokeWidth="3.5" />
      <circle cx="32" cy="53" r="10" fill="#FFFFFF" stroke="#854d0e" strokeWidth="3.5" />
      <circle cx="11" cy="32" r="10" fill="#FFFFFF" stroke="#854d0e" strokeWidth="3.5" />
      <circle cx="53" cy="32" r="10" fill="#FFFFFF" stroke="#854d0e" strokeWidth="3.5" />
      <circle cx="17" cy="17" r="10" fill="#FFFFFF" stroke="#854d0e" strokeWidth="3.5" />
      <circle cx="47" cy="17" r="10" fill="#FFFFFF" stroke="#854d0e" strokeWidth="3.5" />
      <circle cx="17" cy="47" r="10" fill="#FFFFFF" stroke="#854d0e" strokeWidth="3.5" />
      <circle cx="47" cy="47" r="10" fill="#FFFFFF" stroke="#854d0e" strokeWidth="3.5" />
      <circle cx="32" cy="32" r="15" fill="#facc15" stroke="#854d0e" strokeWidth="3.5" />
      <ellipse cx="27" cy="29" rx="2" ry="4" fill="#422006" />
      <ellipse cx="37" cy="29" rx="2" ry="4" fill="#422006" />
      <path
        d="M25 36 Q32 42 39 36"
        stroke="#422006"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

// --- Ultra-Short URL-safe Base64 Encoding / Decoding ---
function encodeCompact(obj) {
  if (!obj || Object.keys(obj).length === 0) return "";
  try {
    const json = JSON.stringify(obj);
    const bytes = new TextEncoder().encode(json);
    let binary = "";
    bytes.forEach((b) => (binary += String.fromCharCode(b)));
    return btoa(binary)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  } catch (e) {
    console.error("Failed to encode compact payload", e);
    return "";
  }
}

function decodeCompact(str) {
  if (!str) return null;
  try {
    let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) base64 += "=";
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const json = new TextDecoder().decode(bytes);
    return JSON.parse(json);
  } catch (e) {
    console.error("Failed to decode compact payload", e);
    return null;
  }
}

// Backward-compatible decode for old long #config= hashes
function decodeLegacyPayload(encoded) {
  try {
    const binary = atob(encoded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const json = new TextDecoder().decode(bytes);
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}

// --- Delta Compression: only store the difference against DEFAULT_ITEMS ---
function compressConfig({
  title,
  freeSpaceText,
  useFreeSpace,
  gridSize,
  allowDuplicatesIfShort,
  rawList,
}) {
  const compact = {};

  if (title && title !== DEFAULT_TITLE) compact.t = title;
  if (freeSpaceText !== undefined && freeSpaceText !== DEFAULT_FREE_SPACE)
    compact.fs = freeSpaceText;
  if (useFreeSpace === false) compact.nf = 1;
  if (gridSize && gridSize !== 5) compact.g = gridSize;
  if (allowDuplicatesIfShort === false) compact.nd = 1;

  const currentItems = rawList
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const currentSet = new Set(currentItems);
  const defaultSet = new Set(DEFAULT_ITEMS_LIST);

  // Default items removed by the user (stored as simple index numbers: [0, 4, 12])
  const removedIndices = [];
  DEFAULT_ITEMS_LIST.forEach((item, index) => {
    if (!currentSet.has(item)) {
      removedIndices.push(index);
    }
  });

  // Custom items added by the user
  const addedItems = currentItems.filter((item) => !defaultSet.has(item));

  const isCompletelyCustom =
    currentItems.length > 0 &&
    currentItems.every((item) => !defaultSet.has(item));

  if (isCompletelyCustom) {
    compact.items = currentItems;
  } else {
    if (removedIndices.length > 0) compact.rm = removedIndices;
    if (addedItems.length > 0) compact.add = addedItems;
  }

  return compact;
}

function decompressConfig(compact) {
  if (!compact) return null;

  const title = compact.t !== undefined ? compact.t : DEFAULT_TITLE;
  const freeSpaceText =
    compact.fs !== undefined ? compact.fs : DEFAULT_FREE_SPACE;
  const useFreeSpace = compact.nf !== 1;
  const gridSize = compact.g !== undefined ? compact.g : 5;
  const allowDuplicatesIfShort = compact.nd !== 1;

  let items = [...DEFAULT_ITEMS_LIST];

  if (Array.isArray(compact.items)) {
    items = compact.items;
  } else {
    if (Array.isArray(compact.rm) && compact.rm.length > 0) {
      const rmSet = new Set(compact.rm);
      items = items.filter((_, idx) => !rmSet.has(idx));
    }
    if (Array.isArray(compact.add) && compact.add.length > 0) {
      items = [...items, ...compact.add];
    }
  }

  return {
    title,
    freeSpaceText,
    useFreeSpace,
    gridSize,
    allowDuplicatesIfShort,
    rawList: items.join("\n"),
  };
}

// --- Deterministic Seeded PRNG (Mulberry32) ---
function hashString(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

// Stable per-item hash sort
function seededSelectPool(array, seedStr) {
  const effectiveSeed = seedStr || "default-seed";
  return [...array]
    .map((item, idx) => ({
      item,
      weight: hashString(`${effectiveSeed}::${item}::${idx}`)(),
    }))
    .sort((a, b) => a.weight - b.weight)
    .map((entry) => entry.item);
}

function randomSeed() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Parse URL config (handles new #c= and legacy #config=)
function parseUrlConfig() {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash;
  if (!hash) return null;

  if (hash.startsWith("#c=")) {
    const raw = hash.replace("#c=", "");
    if (!raw) return decompressConfig({});
    const compact = decodeCompact(raw);
    return compact ? decompressConfig(compact) : null;
  }

  if (hash.startsWith("#config=")) {
    const legacy = decodeLegacyPayload(hash.replace("#config=", ""));
    if (legacy) {
      return {
        title: legacy.title ?? DEFAULT_TITLE,
        freeSpaceText: legacy.freeSpaceText ?? DEFAULT_FREE_SPACE,
        useFreeSpace: legacy.useFreeSpace ?? true,
        gridSize: legacy.gridSize ?? 5,
        allowDuplicatesIfShort: legacy.allowDuplicatesIfShort ?? true,
        rawList: legacy.rawList ?? DEFAULT_ITEMS,
      };
    }
  }

  return null;
}

function getInitialConfig() {
  const fromUrl = parseUrlConfig();
  if (fromUrl) return fromUrl;

  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);

        // Check if code defaults changed in a fresh GitHub deploy
        const codeItemsChanged = parsed.defaultSnapshot !== DEFAULT_ITEMS;
        const codeFreeSpaceChanged =
          parsed.defaultFreeSnapshot !== DEFAULT_FREE_SPACE;

        return {
          title: parsed.title ?? DEFAULT_TITLE,
          freeSpaceText: codeFreeSpaceChanged
            ? DEFAULT_FREE_SPACE
            : (parsed.freeSpaceText ?? DEFAULT_FREE_SPACE),
          useFreeSpace: parsed.useFreeSpace ?? true,
          gridSize: parsed.gridSize ?? 5,
          allowDuplicatesIfShort: parsed.allowDuplicatesIfShort ?? true,
          rawList: codeItemsChanged
            ? DEFAULT_ITEMS
            : (parsed.rawList ?? DEFAULT_ITEMS),
        };
      } catch (e) {}
    }
  }

  return {
    title: DEFAULT_TITLE,
    freeSpaceText: DEFAULT_FREE_SPACE,
    useFreeSpace: true,
    gridSize: 5,
    allowDuplicatesIfShort: true,
    rawList: DEFAULT_ITEMS,
  };
}

export default function App() {
  const initialConfig = useMemo(() => getInitialConfig(), []);

  // Game configuration state
  const [title, setTitle] = useState(initialConfig.title);
  const [freeSpaceText, setFreeSpaceText] = useState(initialConfig.freeSpaceText);
  const [useFreeSpace, setUseFreeSpace] = useState(initialConfig.useFreeSpace);
  const [gridSize, setGridSize] = useState(initialConfig.gridSize);
  const [allowDuplicatesIfShort, setAllowDuplicatesIfShort] = useState(
    initialConfig.allowDuplicatesIfShort
  );
  const [rawList, setRawList] = useState(initialConfig.rawList);
  const [yoshiColorIdx, setYoshiColorIdx] = useState(0);

  // Setup UI state
  const [setupMode, setSetupMode] = useState("visual");
  const [newPromptText, setNewPromptText] = useState("");

  // Player-specific state
  const [seed, setSeed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(SEED_STORAGE_KEY) || randomSeed();
    }
    return randomSeed();
  });

  const [markedIds, setMarkedIds] = useState([FREE_SPACE_ID]);
  const [lastSelectedSquare, setLastSelectedSquare] = useState(null);
  const [activeTab, setActiveTab] = useState("play");
  const [copiedLink, setCopiedLink] = useState(false);

  const currentYoshi = YOSHI_PALETTE[yoshiColorIdx] || YOSHI_PALETTE[0];

  // Persist to localStorage and sync active URL hash
  useEffect(() => {
    const storagePayload = {
      title,
      freeSpaceText,
      useFreeSpace,
      gridSize,
      allowDuplicatesIfShort,
      rawList,
      defaultSnapshot: DEFAULT_ITEMS,
      defaultFreeSnapshot: DEFAULT_FREE_SPACE,
    };
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(storagePayload));

    // If page currently has a config hash, keep it updated with the short format
    if (
      window.location.hash.startsWith("#c=") ||
      window.location.hash.startsWith("#config=")
    ) {
      const compact = compressConfig({
        title,
        freeSpaceText,
        useFreeSpace,
        gridSize,
        allowDuplicatesIfShort,
        rawList,
      });
      const encoded = encodeCompact(compact);
      const newHash = encoded ? `#c=${encoded}` : "";
      window.history.replaceState(null, "", newHash || window.location.pathname);
    }
  }, [title, freeSpaceText, useFreeSpace, gridSize, allowDuplicatesIfShort, rawList]);

  // Clean and deduplicate lines
  const items = useMemo(() => {
    const lines = rawList
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    return Array.from(new Set(lines));
  }, [rawList]);

  const totalSquares = gridSize * gridSize;
  const centerIndex = gridSize % 2 === 1 ? Math.floor(totalSquares / 2) : 0;
  const neededItems = useFreeSpace ? totalSquares - 1 : totalSquares;

  const storageKey = useMemo(() => {
    return `bingo_marked_v2_${seed}_${gridSize}`;
  }, [seed, gridSize]);

  // Load marks
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setMarkedIds(parsed);
          return;
        }
      } catch (e) {}
    }
    setMarkedIds(useFreeSpace ? [FREE_SPACE_ID] : []);
  }, [storageKey, useFreeSpace]);

  // Ensure Free Space remains marked
  useEffect(() => {
    if (useFreeSpace) {
      setMarkedIds((prev) =>
        prev.includes(FREE_SPACE_ID) ? prev : [...prev, FREE_SPACE_ID]
      );
    }
  }, [useFreeSpace]);

  // Save marks & seed
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(markedIds));
  }, [markedIds, storageKey]);

  useEffect(() => {
    localStorage.setItem(SEED_STORAGE_KEY, seed);
  }, [seed]);

  // Board generation
  const boardSquares = useMemo(() => {
    if (items.length === 0) return [];

    let pool = seededSelectPool(items, seed).map((text) => ({
      id: text,
      text,
    }));

    let salt = 1;
    while (pool.length < neededItems) {
      if (allowDuplicatesIfShort) {
        const extra = seededSelectPool(items, `${seed}-dup-${salt}`).map(
          (text) => ({
            id: `${text}__dup_${salt}`,
            text,
          })
        );
        pool = [...pool, ...extra];
      } else {
        const bonusNum = pool.length + 1;
        pool.push({
          id: `__bonus_${bonusNum}`,
          text: `Bonus Egg #${bonusNum}`,
        });
      }
      salt++;
    }

    const selected = pool.slice(0, neededItems);
    const finalBoard = [];
    let itemIdx = 0;

    for (let i = 0; i < totalSquares; i++) {
      if (useFreeSpace && i === centerIndex) {
        finalBoard.push({
          index: i,
          id: FREE_SPACE_ID,
          text: freeSpaceText || "FREE SPACE",
          isFree: true,
        });
      } else {
        const chosen = selected[itemIdx++];
        finalBoard.push({
          index: i,
          id: chosen.id,
          text: chosen.text,
          isFree: false,
        });
      }
    }
    return finalBoard;
  }, [
    items,
    seed,
    neededItems,
    totalSquares,
    useFreeSpace,
    centerIndex,
    freeSpaceText,
    allowDuplicatesIfShort,
  ]);

  const activeBoardTextSet = useMemo(() => {
    return new Set(boardSquares.filter((sq) => !sq.isFree).map((sq) => sq.text));
  }, [boardSquares]);

  // Win condition checker
  const winningSquareSet = useMemo(() => {
    if (boardSquares.length < totalSquares) {
      return { winners: new Set(), bingoCount: 0 };
    }

    const lines = [];
    for (let r = 0; r < gridSize; r++) {
      const row = [];
      for (let c = 0; c < gridSize; c++) row.push(r * gridSize + c);
      lines.push(row);
    }
    for (let c = 0; c < gridSize; c++) {
      const col = [];
      for (let r = 0; r < gridSize; r++) col.push(r * gridSize + c);
      lines.push(col);
    }
    const diag1 = [];
    const diag2 = [];
    for (let i = 0; i < gridSize; i++) {
      diag1.push(i * gridSize + i);
      diag2.push(i * gridSize + (gridSize - 1 - i));
    }
    lines.push(diag1, diag2);

    const winners = new Set();
    let bingoCount = 0;

    for (const line of lines) {
      if (
        line.every((idx) => {
          const sq = boardSquares[idx];
          return sq && markedIds.includes(sq.id);
        })
      ) {
        bingoCount++;
        line.forEach((idx) => winners.add(idx));
      }
    }
    return { winners, bingoCount };
  }, [boardSquares, markedIds, gridSize, totalSquares]);

  const markedBoardCount = useMemo(() => {
    return boardSquares.filter((sq) => markedIds.includes(sq.id)).length;
  }, [boardSquares, markedIds]);

  // Handlers
  const toggleSquare = (sq) => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(12);
    }
    setLastSelectedSquare(sq);
    setMarkedIds((prev) =>
      prev.includes(sq.id) ? prev.filter((id) => id !== sq.id) : [...prev, sq.id]
    );
  };

  const handleRerollCard = () => {
    const newSeed = randomSeed();
    setSeed(newSeed);
    setMarkedIds(useFreeSpace ? [FREE_SPACE_ID] : []);
    setLastSelectedSquare(null);
  };

  const handleClearMarks = () => {
    setMarkedIds(useFreeSpace ? [FREE_SPACE_ID] : []);
    setLastSelectedSquare(null);
  };

  const handleRemoveSinglePrompt = (promptToRemove) => {
    const updated = items.filter((item) => item !== promptToRemove);
    setRawList(updated.join("\n"));
    setMarkedIds((prev) => prev.filter((id) => id !== promptToRemove));
  };

  const handleAddSinglePrompt = (e) => {
    e.preventDefault();
    const trimmed = newPromptText.trim();
    if (!trimmed) return;
    if (!items.includes(trimmed)) {
      setRawList((prev) => (prev.trim() ? `${prev.trim()}\n${trimmed}` : trimmed));
    }
    setNewPromptText("");
  };

  const handleResetDefaults = () => {
    setRawList(DEFAULT_ITEMS);
    setFreeSpaceText(DEFAULT_FREE_SPACE);
    setTitle(DEFAULT_TITLE);
    if (
      window.location.hash.startsWith("#c=") ||
      window.location.hash.startsWith("#config=")
    ) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  };

  // Ultra-short Share Link handler
  const handleShareLink = () => {
    const compact = compressConfig({
      title,
      freeSpaceText,
      useFreeSpace,
      gridSize,
      allowDuplicatesIfShort,
      rawList,
    });
    const encoded = encodeCompact(compact);
    const hash = encoded ? `#c=${encoded}` : "";
    const url = `${window.location.origin}${window.location.pathname}${hash}`;

    window.history.replaceState(null, "", hash || window.location.pathname);
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div
      className="min-h-screen text-emerald-950 p-2 sm:p-6 md:p-8 font-sans relative overflow-x-hidden pb-8"
      style={{
        background:
          "linear-gradient(180deg, #7dd3fc 0%, #bae6fd 45%, #86efac 85%, #4ade80 100%)",
      }}
    >
      {/* Decorative Background Yoshi Eggs */}
      <div className="pointer-events-none fixed -bottom-10 -left-10 opacity-20 rotate-[-15deg]">
        <YoshiEggIcon spotColor="#22c55e" className="w-36 h-44 sm:w-48 sm:h-56" />
      </div>
      <div className="pointer-events-none fixed -bottom-8 -right-8 opacity-20 rotate-[18deg]">
        <YoshiEggIcon spotColor="#f472b6" className="w-32 h-40 sm:w-44 sm:h-52" />
      </div>

      <div className="max-w-3xl mx-auto space-y-3 sm:space-y-5 relative z-10">
        {/* Yoshi's Island Wooden Signpost / Egg Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-[#fefce8] border-4 border-emerald-800 p-3 sm:p-4 rounded-3xl shadow-[0_6px_0_0_#14532d] sm:shadow-[0_8px_0_0_#14532d]">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="shrink-0 drop-shadow">
              <YoshiEggIcon
                spotColor={currentYoshi.hex}
                className="w-9 h-11 sm:w-11 sm:h-13"
              />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-3xl font-black tracking-tight text-emerald-800 drop-shadow-sm truncate">
                {title || DEFAULT_TITLE}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs font-bold text-emerald-700 mt-0.5">
                <span className="bg-emerald-200/80 border border-emerald-500 px-2 py-0.5 rounded-full">
                  Seed: <span className="font-mono text-emerald-950">{seed}</span>
                </span>
                <span>{items.length} Prompts</span>
              </div>
            </div>
          </div>

          {/* Mobile-friendly 3-column action bar */}
          <div className="grid grid-cols-3 sm:flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab("play")}
              className={`px-2.5 sm:px-4 py-2 rounded-2xl text-xs sm:text-sm font-extrabold border-2 border-emerald-900 transition-all touch-manipulation ${
                activeTab === "play"
                  ? "bg-lime-400 text-emerald-950 shadow-[0_3px_0_0_#14532d] -translate-y-0.5"
                  : "bg-white text-emerald-800 hover:bg-emerald-50"
              }`}
            >
              🥚 Play
            </button>
            <button
              onClick={() => setActiveTab("setup")}
              className={`px-2.5 sm:px-4 py-2 rounded-2xl text-xs sm:text-sm font-extrabold border-2 border-emerald-900 transition-all touch-manipulation ${
                activeTab === "setup"
                  ? "bg-lime-400 text-emerald-950 shadow-[0_3px_0_0_#14532d] -translate-y-0.5"
                  : "bg-white text-emerald-800 hover:bg-emerald-50"
              }`}
            >
              ⚙️ Setup ({items.length})
            </button>
            <button
              onClick={handleShareLink}
              className="px-2.5 sm:px-4 py-2 rounded-2xl text-xs sm:text-sm font-extrabold bg-rose-500 hover:bg-rose-400 text-white border-2 border-rose-900 shadow-[0_3px_0_0_#881337] active:translate-y-0.5 transition-all touch-manipulation"
            >
              {copiedLink ? "✓ Copied!" : "🍎 Share"}
            </button>
          </div>
        </header>

        {/* Yoshi Color Picker Bar */}
        {activeTab === "play" && (
          <div className="flex items-center justify-between flex-wrap gap-2 bg-white/85 backdrop-blur border-2 border-emerald-800 px-3 sm:px-4 py-2 rounded-2xl shadow-sm">
            <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-emerald-900">
              Egg Color:
            </span>
            <div className="flex items-center gap-2 sm:gap-2.5">
              {YOSHI_PALETTE.map((yoshi, idx) => (
                <button
                  key={yoshi.name}
                  onClick={() => setYoshiColorIdx(idx)}
                  title={`${yoshi.name} Yoshi`}
                  aria-label={`${yoshi.name} Yoshi`}
                  className={`w-7 h-7 sm:w-7 sm:h-7 rounded-full border-2 transition-transform touch-manipulation ${
                    yoshiColorIdx === idx
                      ? "scale-125 border-emerald-950 ring-2 ring-white shadow"
                      : "border-emerald-800/60 opacity-80 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: yoshi.hex }}
                />
              ))}
            </div>
          </div>
        )}

        {/* BINGO Banner (Smiley Flower Theme!) */}
        {winningSquareSet.bingoCount > 0 && activeTab === "play" && (
          <div className="bg-amber-300 border-4 border-amber-800 rounded-3xl p-2.5 sm:p-4 text-center shadow-[0_5px_0_0_#78350f] flex items-center justify-center gap-2 sm:gap-3 animate-bounce">
            <SmileyFlowerIcon className="w-7 h-7 sm:w-9 sm:h-9 shrink-0" />
            <span className="text-base sm:text-2xl font-black tracking-wide text-amber-950 uppercase">
              WAHOO! YOSHI BINGO! ({winningSquareSet.bingoCount}{" "}
              {winningSquareSet.bingoCount === 1 ? "Line" : "Lines"}!)
            </span>
            <SmileyFlowerIcon className="w-7 h-7 sm:w-9 sm:h-9 shrink-0" />
          </div>
        )}

        {/* PLAY VIEW */}
        {activeTab === "play" && (
          <div className="space-y-2.5 sm:space-y-4">
            {/* BINGO Header Letters */}
            {gridSize === 5 && (
              <div className="grid grid-cols-5 gap-1 sm:gap-3 px-1.5 sm:px-4">
                {["Y", "O", "S", "H", "I"].map((letter, i) => (
                  <div
                    key={letter}
                    className="text-center font-black text-base sm:text-2xl py-0.5 sm:py-1 rounded-xl sm:rounded-2xl border-2 sm:border-3 border-emerald-900 text-white shadow-[0_3px_0_0_#14532d]"
                    style={{
                      backgroundColor: YOSHI_PALETTE[i % YOSHI_PALETTE.length].hex,
                      textShadow: "1px 2px 0px #14532d",
                    }}
                  >
                    {letter}
                  </div>
                ))}
              </div>
            )}

            {/* Main Grid */}
            <div
              className="grid gap-1 sm:gap-3 bg-[#f0fdf4] p-1.5 sm:p-4 rounded-2xl sm:rounded-3xl border-4 border-emerald-900 shadow-[0_8px_0_0_#14532d]"
              style={{
                gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
              }}
            >
              {boardSquares.map((sq) => {
                const isMarked = markedIds.includes(sq.id);
                const isWinningSquare = winningSquareSet.winners.has(sq.index);
                const isLongText = sq.text.length > 36;
                const isVeryLongText = sq.text.length > 52;

                return (
                  <button
                    key={sq.id}
                    onClick={() => toggleSquare(sq)}
                    title={sq.text}
                    className={`relative aspect-square p-1 sm:p-2.5 rounded-xl sm:rounded-2xl border-2 sm:border-3 text-center flex flex-col items-center justify-center transition-all duration-150 select-none break-words overflow-hidden touch-manipulation [-webkit-tap-highlight-color:transparent] ${
                      isWinningSquare
                        ? "bg-amber-200 border-amber-700 text-amber-950 shadow-[0_3px_0_0_#b45309] scale-[1.01]"
                        : isMarked
                        ? `${currentYoshi.lightBg} border-emerald-800 text-emerald-950 shadow-inner translate-y-0.5`
                        : "bg-white border-emerald-800/80 text-emerald-950 shadow-[0_3px_0_0_#166534] sm:shadow-[0_5px_0_0_#166534] hover:-translate-y-0.5 hover:bg-lime-50 active:translate-y-0.5"
                    }`}
                  >
                    {/* Faint Spotted Egg Watermark when marked */}
                    {isMarked && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-25 pointer-events-none">
                        <YoshiEggIcon
                          spotColor={currentYoshi.hex}
                          className="w-12 h-14 sm:w-20 sm:h-24"
                        />
                      </div>
                    )}

                    {/* Free Space Header Badge */}
                    {sq.isFree && (
                      <span className="relative z-10 text-[7px] sm:text-[10px] font-black uppercase tracking-tight sm:tracking-wider px-1 sm:px-2 py-0 sm:py-0.5 rounded-full bg-rose-500 text-white border border-rose-900 mb-0.5 sm:mb-1 shadow-sm leading-tight">
                        ★ FREE ★
                      </span>
                    )}

                    {/* Prompt Text */}
                    <span
                      className={`relative z-10 font-extrabold hyphens-auto line-clamp-4 sm:line-clamp-4 ${
                        isVeryLongText
                          ? "text-[8.5px] leading-[1.05] sm:text-xs sm:leading-tight"
                          : isLongText
                          ? "text-[9.5px] leading-[1.1] sm:text-xs sm:leading-tight"
                          : "text-[10.5px] leading-[1.15] sm:text-xs md:text-sm sm:leading-tight"
                      }`}
                    >
                      {sq.text}
                    </span>

                    {/* Corner Stamp Badge when Marked */}
                    {isMarked && (
                      <div className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 z-20">
                        {isWinningSquare ? (
                          <SmileyFlowerIcon className="w-3.5 h-3.5 sm:w-6 sm:h-6 drop-shadow" />
                        ) : (
                          <YoshiEggIcon
                            spotColor={currentYoshi.hex}
                            className="w-3 h-4 sm:w-5 sm:h-6 drop-shadow"
                          />
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Mobile Full-Text Prompt Reader Bar */}
            {lastSelectedSquare && (
              <div className="flex items-center justify-between gap-2 bg-white/90 backdrop-blur border-2 border-emerald-800 px-3 py-2 rounded-2xl text-xs font-bold text-emerald-950 shadow-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="shrink-0 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-200 border border-emerald-600">
                    {markedIds.includes(lastSelectedSquare.id)
                      ? "Marked"
                      : "Unmarked"}
                  </span>
                  <span className="break-words">{lastSelectedSquare.text}</span>
                </div>
                <button
                  onClick={() => setLastSelectedSquare(null)}
                  className="shrink-0 text-emerald-700 hover:text-emerald-950 px-1.5 text-sm font-black"
                  aria-label="Dismiss prompt preview"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Bottom Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 bg-[#fefce8] border-4 border-emerald-900 p-3 sm:p-4 rounded-3xl shadow-[0_6px_0_0_#14532d]">
              <div className="grid grid-cols-2 sm:flex items-center gap-2">
                <button
                  onClick={handleRerollCard}
                  className="px-3 sm:px-4 py-2.5 sm:py-2 rounded-2xl text-xs sm:text-sm font-extrabold bg-lime-400 hover:bg-lime-300 text-emerald-950 border-2 border-emerald-900 shadow-[0_3px_0_0_#14532d] active:translate-y-0.5 transition touch-manipulation"
                >
                  🥚 Hatch New Card
                </button>
                <button
                  onClick={handleClearMarks}
                  className="px-3 sm:px-4 py-2.5 sm:py-2 rounded-2xl text-xs sm:text-sm font-extrabold bg-white hover:bg-emerald-50 text-emerald-900 border-2 border-emerald-900 shadow-[0_3px_0_0_#14532d] active:translate-y-0.5 transition touch-manipulation"
                >
                  ↺ Reset Eggs
                </button>
              </div>

              <div className="text-center sm:text-right text-xs sm:text-sm font-extrabold text-emerald-900 bg-lime-200 border-2 border-emerald-800 px-3 py-1.5 sm:py-1 rounded-full">
                Eggs Collected: <span>{markedBoardCount}</span> / {totalSquares}
              </div>
            </div>
          </div>
        )}

        {/* SETUP VIEW */}
        {activeTab === "setup" && (
          <div className="bg-[#fefce8] border-4 border-emerald-900 rounded-3xl p-4 sm:p-5 space-y-4 sm:space-y-5 shadow-[0_8px_0_0_#14532d]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-emerald-800 mb-1.5">
                  Board Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border-2 border-emerald-800 text-emerald-950 font-bold text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-emerald-800 mb-1.5">
                  Center Free Space Text
                </label>
                <input
                  type="text"
                  value={freeSpaceText}
                  onChange={(e) => setFreeSpaceText(e.target.value)}
                  disabled={!useFreeSpace}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border-2 border-emerald-800 text-emerald-950 font-bold text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 disabled:opacity-50"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 sm:gap-6 pt-1">
              <label className="flex items-center gap-2.5 text-sm font-bold text-emerald-900 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useFreeSpace}
                  onChange={(e) => setUseFreeSpace(e.target.checked)}
                  className="w-5 h-5 sm:w-4 sm:h-4 rounded border-emerald-800 text-emerald-600 focus:ring-lime-400"
                />
                Include Center Free Space
              </label>

              <label className="flex items-center gap-2.5 text-sm font-bold text-emerald-900 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowDuplicatesIfShort}
                  onChange={(e) => setAllowDuplicatesIfShort(e.target.checked)}
                  className="w-5 h-5 sm:w-4 sm:h-4 rounded border-emerald-800 text-emerald-600 focus:ring-lime-400"
                />
                Repeat random items if fewer than {neededItems} lines
              </label>

              <div className="flex items-center gap-2 text-sm font-bold text-emerald-900">
                <span>Grid Size:</span>
                <select
                  value={gridSize}
                  onChange={(e) => setGridSize(Number(e.target.value))}
                  className="bg-white border-2 border-emerald-800 rounded-xl px-2.5 py-1.5 sm:py-1 text-base sm:text-sm font-bold text-emerald-950"
                >
                  <option value={5}>5x5 (Needs {useFreeSpace ? 24 : 25})</option>
                  <option value={4}>4x4 (Needs {useFreeSpace ? 15 : 16})</option>
                </select>
              </div>
            </div>

            {/* Prompt Editor Section */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <label className="block text-xs font-black uppercase tracking-wider text-emerald-800">
                    Bingo Prompts
                  </label>
                  <span
                    className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${
                      items.length < neededItems
                        ? "bg-amber-200 text-amber-900 border border-amber-600"
                        : "bg-lime-200 text-emerald-900 border border-emerald-600"
                    }`}
                  >
                    {items.length} / {neededItems} needed
                  </span>
                </div>

                {/* Mode Switcher */}
                <div className="inline-flex rounded-xl border-2 border-emerald-800 bg-white p-0.5 text-xs font-extrabold">
                  <button
                    type="button"
                    onClick={() => setSetupMode("visual")}
                    className={`px-2.5 py-1 rounded-lg transition ${
                      setupMode === "visual"
                        ? "bg-lime-400 text-emerald-950"
                        : "text-emerald-800 hover:bg-emerald-50"
                    }`}
                  >
                    Visual List
                  </button>
                  <button
                    type="button"
                    onClick={() => setSetupMode("raw")}
                    className={`px-2.5 py-1 rounded-lg transition ${
                      setupMode === "raw"
                        ? "bg-lime-400 text-emerald-950"
                        : "text-emerald-800 hover:bg-emerald-50"
                    }`}
                  >
                    Raw Text
                  </button>
                </div>
              </div>

              {setupMode === "visual" ? (
                <div className="space-y-2.5">
                  {/* Add New Prompt Bar */}
                  <form onSubmit={handleAddSinglePrompt} className="flex gap-2">
                    <input
                      type="text"
                      value={newPromptText}
                      onChange={(e) => setNewPromptText(e.target.value)}
                      placeholder="Add a new bingo tile..."
                      className="flex-1 px-3.5 py-2 rounded-xl bg-white border-2 border-emerald-800 text-emerald-950 font-bold text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold bg-emerald-700 hover:bg-emerald-600 text-white border-2 border-emerald-950 shrink-0 transition"
                    >
                      + Add Tile
                    </button>
                  </form>

                  {/* Scrollable Visual Tile List */}
                  <div className="max-h-72 overflow-y-auto rounded-2xl bg-white border-2 border-emerald-800 divide-y divide-emerald-100 p-1.5">
                    {items.length === 0 ? (
                      <div className="p-6 text-center text-sm font-bold text-emerald-700">
                        No prompts left! Add some above or reset the default list.
                      </div>
                    ) : (
                      items.map((prompt) => {
                        const isOnCurrentCard = activeBoardTextSet.has(prompt);
                        return (
                          <div
                            key={prompt}
                            className="flex items-center justify-between gap-2 px-2.5 py-2 hover:bg-emerald-50/70 rounded-xl transition"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-xs sm:text-sm font-bold text-emerald-950 break-words">
                                {prompt}
                              </span>
                              {isOnCurrentCard && (
                                <span className="shrink-0 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-lime-200 text-emerald-900 border border-emerald-600">
                                  On Card
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveSinglePrompt(prompt)}
                              title={`Remove "${prompt}"`}
                              className="shrink-0 px-2.5 py-1 rounded-lg text-xs font-black bg-rose-100 hover:bg-rose-500 text-rose-800 hover:text-white border border-rose-300 hover:border-rose-700 transition"
                            >
                              ✕ Remove
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              ) : (
                <textarea
                  rows={10}
                  value={rawList}
                  onChange={(e) => setRawList(e.target.value)}
                  placeholder="Enter one bingo prompt per line..."
                  className="w-full p-3.5 rounded-2xl bg-white border-2 border-emerald-800 text-emerald-950 text-base sm:text-sm font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-lime-400"
                />
              )}
            </div>

            <div className="grid grid-cols-1 sm:flex sm:justify-end gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={handleResetDefaults}
                className="px-4 py-2.5 sm:py-2 rounded-2xl text-sm font-extrabold bg-white hover:bg-emerald-50 text-emerald-900 border-2 border-emerald-900 transition"
              >
                Reset Default List
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("play")}
                className="px-5 py-2.5 sm:py-2 rounded-2xl text-sm font-extrabold bg-lime-400 hover:bg-lime-300 text-emerald-950 border-2 border-emerald-900 shadow-[0_4px_0_0_#14532d] transition"
              >
                Save & Return to Island
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}