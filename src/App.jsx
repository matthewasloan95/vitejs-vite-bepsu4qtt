import React, { useState, useEffect, useMemo } from 'react';

// --- Pre-loaded Default Data ---
const DEFAULT_FREE_SPACE = 'yelling at petters';

const DEFAULT_ITEMS = [
  '"SCREW YOU"',
  'slayer brings a tail',
  'Says to vinvin/ankoku/blanket "what is that"',
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
].join('\n');

// --- UTF-8 Safe Base64 URL Encoding / Decoding ---
function encodePayload(obj) {
  try {
    const json = JSON.stringify(obj);
    const bytes = new TextEncoder().encode(json);
    let binary = '';
    bytes.forEach((b) => (binary += String.fromCharCode(b)));
    return btoa(binary);
  } catch (e) {
    console.error('Failed to encode URL payload', e);
    return '';
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
    console.error('Failed to decode URL payload', e);
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
  const rng = hashString(seedStr || 'default-seed');
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
  const [title, setTitle] = useState('Stream Bingo');
  const [freeSpaceText, setFreeSpaceText] = useState(DEFAULT_FREE_SPACE);
  const [useFreeSpace, setUseFreeSpace] = useState(true);
  const [gridSize, setGridSize] = useState(5); // 5x5 or 4x4
  const [allowDuplicatesIfShort, setAllowDuplicatesIfShort] = useState(true);
  const [rawList, setRawList] = useState(DEFAULT_ITEMS);

  // Player-specific state
  const [seed, setSeed] = useState(() => {
    return localStorage.getItem('bingo_player_seed') || randomSeed();
  });
  const [markedIndices, setMarkedIndices] = useState([]);
  const [activeTab, setActiveTab] = useState('play'); // "play" | "setup"
  const [copiedLink, setCopiedLink] = useState(false);

  // Load config from URL hash if shared link was opened
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#config=')) {
      const encoded = hash.replace('#config=', '');
      const decoded = decodePayload(encoded);
      if (decoded) {
        if (decoded.title) setTitle(decoded.title);
        if (decoded.freeSpaceText !== undefined)
          setFreeSpaceText(decoded.freeSpaceText);
        if (decoded.useFreeSpace !== undefined)
          setUseFreeSpace(decoded.useFreeSpace);
        if (decoded.gridSize) setGridSize(decoded.gridSize);
        if (decoded.rawList) setRawList(decoded.rawList);
      }
    }
  }, []);

  // Parse cleaned lines
  const items = useMemo(() => {
    return rawList
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  }, [rawList]);

  const totalSquares = gridSize * gridSize;
  const centerIndex = gridSize % 2 === 1 ? Math.floor(totalSquares / 2) : 0;
  const neededItems = useFreeSpace ? totalSquares - 1 : totalSquares;

  // Build a deterministic storage key so marked squares persist per board/seed
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
    localStorage.setItem('bingo_player_seed', seed);
  }, [seed]);

  // Generate the shuffled board for this player's seed
  const boardSquares = useMemo(() => {
    if (items.length === 0) return [];

    let pool = seededShuffle(items, seed);

    // If user has fewer than 24 items (e.g., 18 items), fill the remaining spots
    let salt = 1;
    while (pool.length < neededItems) {
      if (allowDuplicatesIfShort) {
        const extra = seededShuffle(items, `${seed}-dup-${salt}`);
        pool = [...pool, ...extra];
      } else {
        pool.push(`Bonus Space #${pool.length + 1}`);
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
          text: freeSpaceText || 'FREE SPACE',
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

  // Calculate winning lines (rows, cols, diagonals)
  const winningSquareSet = useMemo(() => {
    const lines = [];
    // Rows
    for (let r = 0; r < gridSize; r++) {
      const row = [];
      for (let c = 0; c < gridSize; c++) row.push(r * gridSize + c);
      lines.push(row);
    }
    // Columns
    for (let c = 0; c < gridSize; c++) {
      const col = [];
      for (let r = 0; r < gridSize; r++) col.push(r * gridSize + c);
      lines.push(col);
    }
    // Diagonals
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
    window.history.replaceState(null, '', `#config=${encoded}`);
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header Bar */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-lg">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              {title || 'Bingo Party'}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Card Seed:{' '}
              <span className="font-mono text-indigo-300">{seed}</span> •{' '}
              {items.length} Prompts Loaded
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('play')}
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                activeTab === 'play'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Play Card
            </button>
            <button
              onClick={() => setActiveTab('setup')}
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                activeTab === 'setup'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Edit Prompts ({items.length})
            </button>
            <button
              onClick={handleShareLink}
              className="px-3.5 py-2 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-md shadow-emerald-600/20"
            >
              {copiedLink ? '✓ Link Copied!' : 'Share Game Link'}
            </button>
          </div>
        </header>

        {/* BINGO Banner */}
        {winningSquareSet.bingoCount > 0 && activeTab === 'play' && (
          <div className="bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 border border-amber-400/50 rounded-2xl p-4 text-center animate-pulse">
            <span className="text-xl font-black tracking-wider text-amber-300 uppercase">
              🎉 BINGO! ({winningSquareSet.bingoCount}{' '}
              {winningSquareSet.bingoCount === 1 ? 'Line' : 'Lines'} Completed)
              🎉
            </span>
          </div>
        )}

        {/* PLAY VIEW */}
        {activeTab === 'play' && (
          <div className="space-y-4">
            {/* Grid */}
            <div
              className="grid gap-2 sm:gap-3 bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-800 shadow-2xl"
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
                    className={`relative aspect-square p-1.5 sm:p-2.5 rounded-xl border text-center flex flex-col items-center justify-center transition-all duration-150 select-none break-words overflow-hidden ${
                      isWinningSquare
                        ? 'bg-amber-500/25 border-amber-400 text-amber-100 shadow-lg shadow-amber-500/20 scale-[1.01]'
                        : isMarked
                        ? 'bg-indigo-600/30 border-indigo-400 text-white shadow-inner'
                        : 'bg-slate-800/70 border-slate-700/80 text-slate-200 hover:bg-slate-800 hover:border-slate-600'
                    }`}
                  >
                    {sq.isFree && (
                      <span className="text-[10px] font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded bg-indigo-500/30 text-indigo-300 mb-1">
                        FREE SPACE
                      </span>
                    )}
                    <span className="text-[11px] sm:text-xs md:text-sm font-medium leading-tight line-clamp-4">
                      {sq.text}
                    </span>

                    {isMarked && (
                      <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-indigo-400 shadow" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Bottom Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRerollCard}
                  className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                >
                  🎲 New Random Card
                </button>
                <button
                  onClick={handleClearMarks}
                  className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                >
                  ↺ Clear Marks
                </button>
              </div>

              <div className="text-xs text-slate-400">
                Marked:{' '}
                <strong className="text-slate-200">
                  {markedIndices.length}
                </strong>{' '}
                / {totalSquares}
              </div>
            </div>
          </div>
        )}

        {/* SETUP VIEW */}
        {activeTab === 'setup' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5 shadow-xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Board Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Free Space Prompt (Center Square)
                </label>
                <input
                  type="text"
                  value={freeSpaceText}
                  onChange={(e) => setFreeSpaceText(e.target.value)}
                  disabled={!useFreeSpace}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-1">
              <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useFreeSpace}
                  onChange={(e) => setUseFreeSpace(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500"
                />
                Include Center Free Space
              </label>

              <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowDuplicatesIfShort}
                  onChange={(e) => setAllowDuplicatesIfShort(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500"
                />
                Repeat random items if list has fewer than {neededItems} lines
              </label>

              <div className="flex items-center gap-2 text-sm text-slate-300">
                <span>Grid Size:</span>
                <select
                  value={gridSize}
                  onChange={(e) => setGridSize(Number(e.target.value))}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-sm text-slate-100"
                >
                  <option value={5}>
                    5x5 (Needs {useFreeSpace ? 24 : 25})
                  </option>
                  <option value={4}>
                    4x4 (Needs {useFreeSpace ? 15 : 16})
                  </option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Bingo Prompts (1 per line)
                </label>
                <span
                  className={`text-xs font-medium ${
                    items.length < neededItems
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {items.length} / {neededItems} needed for unique {gridSize}x
                  {gridSize}
                </span>
              </div>
              <textarea
                rows={12}
                value={rawList}
                onChange={(e) => setRawList(e.target.value)}
                placeholder="Enter one bingo prompt per line..."
                className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm font-mono focus:outline-none focus:border-indigo-500"
              />
              {items.length < neededItems && (
                <p className="text-xs text-amber-400/90 mt-1.5">
                  Note: You currently have {items.length} prompts (a 5x5 grid
                  with a Free Space has 24 squares).{' '}
                  {allowDuplicatesIfShort
                    ? `The remaining ${
                        neededItems - items.length
                      } squares are automatically filled by repeating random prompts from your list.`
                    : 'Either add 6 more lines or switch the Grid Size to 4x4!'}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setRawList(DEFAULT_ITEMS);
                  setFreeSpaceText(DEFAULT_FREE_SPACE);
                }}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              >
                Reset to Default List
              </button>
              <button
                onClick={() => setActiveTab('play')}
                className="px-5 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition"
              >
                Save & View Card
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
