import React, { useState, useEffect, useMemo } from "react";

// --- Pre-loaded Default Data ---
const DEFAULT_FREE_SPACE = "yelling at petters";

const DEFAULT_ITEMS = [
  '"SCREW YOU"',
  'slayer brings a tail',
  "Doesn't notice a tail for 30min +",
  'Says "I can\'t lie" with little reason for it',
  '"Are you serious/are you joking?"',
  'Mic peaks from yelling',
  'Poor form on push ups',
  'Asks a question and says "be honest"',
  'Gets mad about the same question being asked more than once',
  '"Rats"',
  'Messkey slander',
  'Gets mad at a LO train',
  'Yells at david',
  'Solo bw win',
  'Checks for tails when there are none',
  'audible desk slamming',
  'completely misses tails when walking by them',
  'Manchild mention',
  'Chat crash cause of judas spam',
  'ELBOOOWWW',
  'Labors someone',
  '"REAL" FOOTBALL mention',
  'Mentioning katsu\'s sleep schedule',
  'MEHMEHMEH',
  'Bluestone / failing to get a good first word that comes to mind',
  'DEL -- POGGG',
  'Refusing to make an animal noise',
  '!garlicbread mention',
  'Stimming Messkeyyyy',
  'WHY ARE WE TWERKING',
  'YOU\'RE THE WORST',
  'Heck yeah!',
  'W A T',
  'Tells someone to “get outta here”',
  'Denies dating Slayer',
  'Slayer, Elsa, Kang old jokes',
  'Messkey HO OHHHH laugh',

  '"What is that" to a gif/emote',
  'Furry denial',
  'LOcationphobia (NY..LU..etc)',

].join("\n");

// --- Yoshi Egg Color Palette (Classic Yoshi's Island colors) ---
const YOSHI_PALETTE = [
  { name: "Green", hex: "#4ade80", bg: "bg-emerald-500", border: "border-emerald-600", text: "text-emerald-950", lightBg: "bg-emerald-100" },
  { name: "Pink", hex: "#f472b6", bg: "bg-pink-400", border: "border-pink-600", text: "text-pink-950", lightBg: "bg-pink-100" },
  { name: "Light Blue", hex: "#38bdf8", bg: "bg-sky-400", border: "border-sky-600", text: "text-sky-950", lightBg: "bg-sky-100" },
  { name: "Yellow", hex: "#facc15", bg: "bg-amber-300", border: "border-amber-500", text: "text-amber-950", lightBg: "bg-amber-100" },
  { name: "Red", hex: "#f87171", bg: "bg-rose-500", border: "border-rose-700", text: "text-rose-950", lightBg: "bg-rose-100" },
  { name: "Purple", hex: "#c084fc", bg: "bg-purple-400", border: "border-purple-600", text: "text-purple-950", lightBg: "bg-purple-100" },
];

// --- Custom Inline SVG: Spotted Yoshi Egg ---
function YoshiEggIcon({ spotColor = "#22c55e", className = "w-8 h-8" }) {
  return (
    <svg viewBox="0 0 64 76" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Egg Base */}
      <path
        d="M32 4C16 4 6 28 6 47C6 63.5 17.5 72 32 72C46.5 72 58 63.5 58 47C58 28 48 4 32 4Z"
        fill="#FFFFFF"
        stroke="#14532d"
        strokeWidth="4.5"
      />
      {/* Classic Yoshi Egg Spots */}
      <circle cx="22" cy="26" r="7.5" fill={spotColor} />
      <circle cx="43" cy="36" r="9.5" fill={spotColor} />
      <circle cx="23" cy="53" r="10.5" fill={spotColor} />
      <circle cx="44" cy="58" r="5.5" fill={spotColor} />
      <circle cx="33" cy="14" r="4.5" fill={spotColor} />
      {/* Outline Overlay */}
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
    <svg viewBox="0 0 64 64" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Petals */}
      <circle cx="32" cy="11" r="10" fill="#FFFFFF" stroke="#854d0e" strokeWidth="3.5" />
      <circle cx="32" cy="53" r="10" fill="#FFFFFF" stroke="#854d0e" strokeWidth="3.5" />
      <circle cx="11" cy="32" r="10" fill="#FFFFFF" stroke="#854d0e" strokeWidth="3.5" />
      <circle cx="53" cy="32" r="10" fill="#FFFFFF" stroke="#854d0e" strokeWidth="3.5" />
      <circle cx="17" cy="17" r="10" fill="#FFFFFF" stroke="#854d0e" strokeWidth="3.5" />
      <circle cx="47" cy="17" r="10" fill="#FFFFFF" stroke="#854d0e" strokeWidth="3.5" />
      <circle cx="17" cy="47" r="10" fill="#FFFFFF" stroke="#854d0e" strokeWidth="3.5" />
      <circle cx="47" cy="47" r="10" fill="#FFFFFF" stroke="#854d0e" strokeWidth="3.5" />
      {/* Yellow Center Face */}
      <circle cx="32" cy="32" r="15" fill="#facc15" stroke="#854d0e" strokeWidth="3.5" />
      {/* Eyes */}
      <ellipse cx="27" cy="29" rx="2" ry="4" fill="#422006" />
      <ellipse cx="37" cy="29" rx="2" ry="4" fill="#422006" />
      {/* Smile */}
      <path d="M25 36 Q32 42 39 36" stroke="#422006" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}

// --- UTF-8 Safe Base64 URL Encoding / Decoding ---
function encodePayload(obj) {
  try {
    const json = JSON.stringify(obj);
    const bytes = new TextEncoder().encode(json);
    let binary = "";
    bytes.forEach((b) => (binary += String.fromCharCode(b)));
    return btoa(binary);
  } catch (e) {
    console.error("Failed to encode URL payload", e);
    return "";
  }
}

function decodePayload(encoded) {
  try {
    const binary = atob(encoded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const json = new TextDecoder().decode(bytes);
    return JSON.parse(json);
  } catch (e) {
    console.error("Failed to decode URL payload", e);
    return null;
  }
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

function seededShuffle(array, seedStr) {
  const rng = hashString(seedStr || "default-seed");
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function randomSeed() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function App() {
  // Game configuration state
  const [title, setTitle] = useState("Yoshi's Stream Bingo");
  const [freeSpaceText, setFreeSpaceText] = useState(DEFAULT_FREE_SPACE);
  const [useFreeSpace, setUseFreeSpace] = useState(true);
  const [gridSize, setGridSize] = useState(5);
  const [allowDuplicatesIfShort, setAllowDuplicatesIfShort] = useState(true);
  const [rawList, setRawList] = useState(DEFAULT_ITEMS);
  const [yoshiColorIdx, setYoshiColorIdx] = useState(0); // Green Yoshi default

  // Player-specific state
  const [seed, setSeed] = useState(() => {
    return localStorage.getItem("bingo_player_seed") || randomSeed();
  });
  const [markedIndices, setMarkedIndices] = useState([]);
  const [activeTab, setActiveTab] = useState("play");
  const [copiedLink, setCopiedLink] = useState(false);

  const currentYoshi = YOSHI_PALETTE[yoshiColorIdx] || YOSHI_PALETTE[0];

  // Load config from URL hash if shared link was opened
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith("#config=")) {
      const encoded = hash.replace("#config=", "");
      const decoded = decodePayload(encoded);
      if (decoded) {
        if (decoded.title) setTitle(decoded.title);
        if (decoded.freeSpaceText !== undefined) setFreeSpaceText(decoded.freeSpaceText);
        if (decoded.useFreeSpace !== undefined) setUseFreeSpace(decoded.useFreeSpace);
        if (decoded.gridSize) setGridSize(decoded.gridSize);
        if (decoded.rawList) setRawList(decoded.rawList);
      }
    }
  }, []);

  // Parse cleaned lines
  const items = useMemo(() => {
    return rawList
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  }, [rawList]);

  const totalSquares = gridSize * gridSize;
  const centerIndex = gridSize % 2 === 1 ? Math.floor(totalSquares / 2) : 0;
  const neededItems = useFreeSpace ? totalSquares - 1 : totalSquares;

  // Build deterministic storage key
  const storageKey = useMemo(() => {
    return `bingo_marked_${seed}_${gridSize}_${useFreeSpace}_${freeSpaceText}_${items.length}`;
  }, [seed, gridSize, useFreeSpace, freeSpaceText, items.length]);

  // Load marked squares from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setMarkedIndices(JSON.parse(saved));
        return;
      } catch (e) {
        // Fallback below
      }
    }
    setMarkedIndices(useFreeSpace ? [centerIndex] : []);
  }, [storageKey, useFreeSpace, centerIndex]);

  // Save marked squares & seed to localStorage
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(markedIndices));
  }, [markedIndices, storageKey]);

  useEffect(() => {
    localStorage.setItem("bingo_player_seed", seed);
  }, [seed]);

  // Generate the shuffled board for this player's seed
  const boardSquares = useMemo(() => {
    if (items.length === 0) return [];

    let pool = seededShuffle(items, seed);

    let salt = 1;
    while (pool.length < neededItems) {
      if (allowDuplicatesIfShort) {
        const extra = seededShuffle(items, `${seed}-dup-${salt}`);
        pool = [...pool, ...extra];
      } else {
        pool.push(`Bonus Egg #${pool.length + 1}`);
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
          text: freeSpaceText || "FREE SPACE",
          isFree: true,
        });
      } else {
        finalBoard.push({
          index: i,
          text: selected[itemIdx++],
          isFree: false,
        });
      }
    }
    return finalBoard;
  }, [items, seed, neededItems, totalSquares, useFreeSpace, centerIndex, freeSpaceText, allowDuplicatesIfShort]);

  // Calculate winning lines (rows, cols, diagonals)
  const winningSquareSet = useMemo(() => {
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
      if (line.every((idx) => markedIndices.includes(idx))) {
        bingoCount++;
        line.forEach((idx) => winners.add(idx));
      }
    }
    return { winners, bingoCount };
  }, [markedIndices, gridSize]);

  // Handlers
  const toggleSquare = (idx) => {
    setMarkedIndices((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const handleRerollCard = () => {
    const newSeed = randomSeed();
    setSeed(newSeed);
    setMarkedIndices(useFreeSpace ? [centerIndex] : []);
  };

  const handleClearMarks = () => {
    setMarkedIndices(useFreeSpace ? [centerIndex] : []);
  };

  const handleShareLink = () => {
    const payload = {
      title,
      freeSpaceText,
      useFreeSpace,
      gridSize,
      rawList,
    };
    const encoded = encodePayload(payload);
    const url = `${window.location.origin}${window.location.pathname}#config=${encoded}`;
    window.history.replaceState(null, "", `#config=${encoded}`);
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div
      className="min-h-screen text-emerald-950 p-3 sm:p-6 md:p-8 font-sans relative overflow-x-hidden"
      style={{
        background: "linear-gradient(180deg, #7dd3fc 0%, #bae6fd 45%, #86efac 85%, #4ade80 100%)",
      }}
    >
      {/* Decorative Background Yoshi Eggs */}
      <div className="pointer-events-none fixed -bottom-10 -left-10 opacity-20 rotate-[-15deg]">
        <YoshiEggIcon spotColor="#22c55e" className="w-48 h-56" />
      </div>
      <div className="pointer-events-none fixed -bottom-8 -right-8 opacity-20 rotate-[18deg]">
        <YoshiEggIcon spotColor="#f472b6" className="w-44 h-52" />
      </div>

      <div className="max-w-3xl mx-auto space-y-5 relative z-10">
        {/* Yoshi's Island Wooden Signpost / Egg Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#fefce8] border-4 border-emerald-800 p-4 rounded-3xl shadow-[0_8px_0_0_#14532d]">
          <div className="flex items-center gap-3">
            <div className="shrink-0 drop-shadow">
              <YoshiEggIcon spotColor={currentYoshi.hex} className="w-11 h-13" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-emerald-800 drop-shadow-sm">
                {title || "Yoshi's Stream Bingo"}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-emerald-700 mt-0.5">
                <span className="bg-emerald-200/80 border border-emerald-500 px-2 py-0.5 rounded-full">
                  Egg Seed: <span className="font-mono text-emerald-950">{seed}</span>
                </span>
                <span>• {items.length} Prompts</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab("play")}
              className={`px-4 py-2 rounded-2xl text-sm font-extrabold border-2 border-emerald-900 transition-all ${
                activeTab === "play"
                  ? "bg-lime-400 text-emerald-950 shadow-[0_4px_0_0_#14532d] -translate-y-0.5"
                  : "bg-white text-emerald-800 hover:bg-emerald-50"
              }`}
            >
              🥚 Play Card
            </button>
            <button
              onClick={() => setActiveTab("setup")}
              className={`px-4 py-2 rounded-2xl text-sm font-extrabold border-2 border-emerald-900 transition-all ${
                activeTab === "setup"
                  ? "bg-lime-400 text-emerald-950 shadow-[0_4px_0_0_#14532d] -translate-y-0.5"
                  : "bg-white text-emerald-800 hover:bg-emerald-50"
              }`}
            >
              ⚙️ Prompts ({items.length})
            </button>
            <button
              onClick={handleShareLink}
              className="px-4 py-2 rounded-2xl text-sm font-extrabold bg-rose-500 hover:bg-rose-400 text-white border-2 border-rose-900 shadow-[0_4px_0_0_#881337] active:translate-y-0.5 transition-all"
            >
              {copiedLink ? "✓ Link Copied!" : "🍎 Share Link"}
            </button>
          </div>
        </header>

        {/* Yoshi Color Picker Bar */}
        {activeTab === "play" && (
          <div className="flex items-center justify-between flex-wrap gap-2 bg-white/85 backdrop-blur border-2 border-emerald-800 px-4 py-2.5 rounded-2xl shadow-sm">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-900">
              Choose Your Yoshi Egg Color:
            </span>
            <div className="flex items-center gap-2">
              {YOSHI_PALETTE.map((yoshi, idx) => (
                <button
                  key={yoshi.name}
                  onClick={() => setYoshiColorIdx(idx)}
                  title={`${yoshi.name} Yoshi`}
                  className={`w-7 h-7 rounded-full border-2 transition-transform ${
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
          <div className="bg-amber-300 border-4 border-amber-800 rounded-3xl p-4 text-center shadow-[0_6px_0_0_#78350f] flex items-center justify-center gap-3 animate-bounce">
            <SmileyFlowerIcon className="w-9 h-9 shrink-0" />
            <span className="text-xl sm:text-2xl font-black tracking-wide text-amber-950 uppercase">
              WAHOO! YOSHI BINGO! ({winningSquareSet.bingoCount}{" "}
              {winningSquareSet.bingoCount === 1 ? "Line" : "Lines"}!)
            </span>
            <SmileyFlowerIcon className="w-9 h-9 shrink-0" />
          </div>
        )}

        {/* PLAY VIEW */}
        {activeTab === "play" && (
          <div className="space-y-4">
            {/* BINGO Header Letters */}
            {gridSize === 5 && (
              <div className="grid grid-cols-5 gap-2 sm:gap-3 px-3 sm:px-4">
                {["Y", "O", "S", "H", "I"].map((letter, i) => (
                  <div
                    key={letter}
                    className="text-center font-black text-xl sm:text-2xl py-1 rounded-2xl border-3 border-emerald-900 text-white shadow-[0_4px_0_0_#14532d]"
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
              className="grid gap-2 sm:gap-3 bg-[#f0fdf4] p-3 sm:p-4 rounded-3xl border-4 border-emerald-900 shadow-[0_10px_0_0_#14532d]"
              style={{
                gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
              }}
            >
              {boardSquares.map((sq) => {
                const isMarked = markedIndices.includes(sq.index);
                const isWinningSquare = winningSquareSet.winners.has(sq.index);

                return (
                  <button
                    key={sq.index}
                    onClick={() => toggleSquare(sq.index)}
                    className={`relative aspect-square p-1.5 sm:p-2.5 rounded-2xl border-3 text-center flex flex-col items-center justify-center transition-all duration-150 select-none break-words overflow-hidden ${
                      isWinningSquare
                        ? "bg-amber-200 border-amber-700 text-amber-950 shadow-[0_4px_0_0_#b45309] scale-[1.02]"
                        : isMarked
                        ? `${currentYoshi.lightBg} border-emerald-800 text-emerald-950 shadow-inner translate-y-0.5`
                        : "bg-white border-emerald-800/80 text-emerald-950 shadow-[0_5px_0_0_#166534] hover:-translate-y-0.5 hover:bg-lime-50 active:translate-y-0.5"
                    }`}
                  >
                    {/* Faint Spotted Egg Watermark when marked */}
                    {isMarked && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-25 pointer-events-none">
                        <YoshiEggIcon spotColor={currentYoshi.hex} className="w-16 h-20 sm:w-20 sm:h-24" />
                      </div>
                    )}

                    {/* Free Space Header Badge */}
                    {sq.isFree && (
                      <span className="relative z-10 text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500 text-white border border-rose-900 mb-1 shadow-sm">
                        ★ FREE EGG ★
                      </span>
                    )}

                    {/* Prompt Text */}
                    <span className="relative z-10 text-[11px] sm:text-xs md:text-sm font-extrabold leading-tight line-clamp-4">
                      {sq.text}
                    </span>

                    {/* Corner Stamp Badge when Marked */}
                    {isMarked && (
                      <div className="absolute top-1 right-1 z-20">
                        {isWinningSquare ? (
                          <SmileyFlowerIcon className="w-5 h-5 sm:w-6 sm:h-6 drop-shadow" />
                        ) : (
                          <YoshiEggIcon spotColor={currentYoshi.hex} className="w-4 h-5 sm:w-5 sm:h-6 drop-shadow" />
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Bottom Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#fefce8] border-4 border-emerald-900 p-4 rounded-3xl shadow-[0_6px_0_0_#14532d]">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleRerollCard}
                  className="px-4 py-2 rounded-2xl text-xs sm:text-sm font-extrabold bg-lime-400 hover:bg-lime-300 text-emerald-950 border-2 border-emerald-900 shadow-[0_3px_0_0_#14532d] active:translate-y-0.5 transition"
                >
                  🥚 Hatch New Card
                </button>
                <button
                  onClick={handleClearMarks}
                  className="px-4 py-2 rounded-2xl text-xs sm:text-sm font-extrabold bg-white hover:bg-emerald-50 text-emerald-900 border-2 border-emerald-900 shadow-[0_3px_0_0_#14532d] active:translate-y-0.5 transition"
                >
                  ↺ Reset Eggs
                </button>
              </div>

              <div className="text-xs sm:text-sm font-extrabold text-emerald-900 bg-lime-200 border-2 border-emerald-800 px-3 py-1 rounded-full">
                Eggs Collected: <span>{markedIndices.length}</span> / {totalSquares}
              </div>
            </div>
          </div>
        )}

        {/* SETUP VIEW */}
        {activeTab === "setup" && (
          <div className="bg-[#fefce8] border-4 border-emerald-900 rounded-3xl p-5 space-y-5 shadow-[0_8px_0_0_#14532d]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-emerald-800 mb-1.5">
                  Board Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border-2 border-emerald-800 text-emerald-950 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
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
                  className="w-full px-3.5 py-2 rounded-xl bg-white border-2 border-emerald-800 text-emerald-950 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 disabled:opacity-50"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-1">
              <label className="flex items-center gap-2 text-sm font-bold text-emerald-900 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useFreeSpace}
                  onChange={(e) => setUseFreeSpace(e.target.checked)}
                  className="w-4 h-4 rounded border-emerald-800 text-emerald-600 focus:ring-lime-400"
                />
                Include Center Free Space
              </label>

              <label className="flex items-center gap-2 text-sm font-bold text-emerald-900 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowDuplicatesIfShort}
                  onChange={(e) => setAllowDuplicatesIfShort(e.target.checked)}
                  className="w-4 h-4 rounded border-emerald-800 text-emerald-600 focus:ring-lime-400"
                />
                Repeat random items if fewer than {neededItems} lines
              </label>

              <div className="flex items-center gap-2 text-sm font-bold text-emerald-900">
                <span>Grid Size:</span>
                <select
                  value={gridSize}
                  onChange={(e) => setGridSize(Number(e.target.value))}
                  className="bg-white border-2 border-emerald-800 rounded-xl px-2.5 py-1 text-sm font-bold text-emerald-950"
                >
                  <option value={5}>5x5 (Needs {useFreeSpace ? 24 : 25})</option>
                  <option value={4}>4x4 (Needs {useFreeSpace ? 15 : 16})</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-emerald-800">
                  Bingo Prompts (1 per line)
                </label>
                <span
                  className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${
                    items.length < neededItems
                      ? "bg-amber-200 text-amber-900 border border-amber-600"
                      : "bg-lime-200 text-emerald-900 border border-emerald-600"
                  }`}
                >
                  {items.length} / {neededItems} unique prompts
                </span>
              </div>
              <textarea
                rows={12}
                value={rawList}
                onChange={(e) => setRawList(e.target.value)}
                placeholder="Enter one bingo prompt per line..."
                className="w-full p-3.5 rounded-2xl bg-white border-2 border-emerald-800 text-emerald-950 text-sm font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-lime-400"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setRawList(DEFAULT_ITEMS);
                  setFreeSpaceText(DEFAULT_FREE_SPACE);
                }}
                className="px-4 py-2 rounded-2xl text-sm font-extrabold bg-white hover:bg-emerald-50 text-emerald-900 border-2 border-emerald-900 transition"
              >
                Reset Default List
              </button>
              <button
                onClick={() => setActiveTab("play")}
                className="px-5 py-2 rounded-2xl text-sm font-extrabold bg-lime-400 hover:bg-lime-300 text-emerald-950 border-2 border-emerald-900 shadow-[0_4px_0_0_#14532d] transition"
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