import React, { useState, useEffect, useRef } from "react";

interface BoxData {
  toName: string;
  fromName: string;
  anniversaryTitle: string;
  anniversarySub: string;
  engagementDateStr: string;
  noteText: string;
  closingText: string;
  signOffName: string;
  hugTitle: string;
  hugDesc: string;
}

const HARDCODED_DATA: BoxData = {
  toName: "MINE",
  fromName: "DIYU",
  anniversaryTitle: "Happy 2 Years Together! 💍",
  anniversarySub: "August 6, 2024 — August 6, 2026 ❤️",
  engagementDateStr: "2024-08-06T00:00:00",
  noteText:
    "HEY! MY FOREVER EVER, LOVE OF MY LIFE. HAPPIEST BIRTHDAY MY MAN. YOU MEAN EVERYTHING TO ME, I CAN'T IMAGINE EVEN A SINGLE SECOND WITHOUT YOU. YOU HOLD ME LIKE SOMEONE HOLDING A SMALL BABY. YOU ARE MY HAPPY NOTIFICATION. HOPE YOUR EVERY SINGLE DAY IS FILLED WITH YOUR WISHES AND HAPPINESS.",
  closingText:
    "Here's to 2 incredible years of engagement, 730 days of pure happiness, and a lifetime of love ahead with you, my forever!",
  signOffName: "DIYU ❤️",
  hugTitle: "Infinite Warm Hug!",
  hugDesc: "You hold me like someone holding a small baby... Sending you infinite warm hugs today and always! ❤️",
};

const HARDCODED_REASONS: string[] = [
  "Your smile lights up my darkest days.",
  "The gentle way you hold me like a baby.",
  "You are my happy notification every single time.",
  "How you make every ordinary day feel like magic.",
  "Your golden heart that cares so deeply for everyone.",
  "How safe and loved I feel whenever I'm in your arms.",
  "Your contagious laugh that brightens the whole room.",
  "Because you are my soulmate and my best friend.",
  "How you always know how to make me feel special.",
  "Your warm hugs that melt away all my stress.",
  "Because 2 years with you feels like a dream come true.",
  "The way your eyes shine when you look at me.",
  "How you listen to me with so much patience and love.",
  "Because you are my home, my anchor, and my star.",
  "The cozy quiet moments we share doing nothing at all.",
  "How you encourage me to be the best version of myself.",
  "Your sweet surprise notes and loving gestures.",
  "Because I can't imagine even a single second without you.",
  "How you hold my hand through every journey.",
  "Your unconditional love and endless kindness.",
  "Because saying YES to you on August 6, 2024 was the best decision ever.",
  "The beautiful future we are building together day by day.",
  "How you make my heart skip a beat every time I see you.",
  "Because you are MINE forever and ever! ❤️",
];

const HARDCODED_COUPONS: string[] = [
  "☕ 1 Free Coffee & Deep Talk",
  "🍿 1 Movie Night Choice",
  "🤗 1 Unlimited Warm Hug",
  "🍽️ 1 Romantic Candlelight Dinner",
];

export default function EngagementAnniversaryApp() {
  const [screen, setScreen] = useState<number>(1);
  const [activeCard, setActiveCard] = useState<string | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(false);

  const [activeReasonIdx, setActiveReasonIdx] = useState<number>(0);
  const [unlockedReasons, setUnlockedReasons] = useState<Set<number>>(new Set([0]));
  const [couponsRedeemed, setCouponsRedeemed] = useState<Record<number, boolean>>({});

  // Live Timer State
  const [elapsed, setElapsed] = useState({ days: 730, hours: 0, minutes: 0, seconds: 0 });

  const audioCtxRef = useRef<AudioContext | null>(null);
  const synthIntervalRef = useRef<any>(null);

  // Calculate elapsed time from HARDCODED_DATA.engagementDateStr
  useEffect(() => {
    const timer = setInterval(() => {
      const engagementDate = new Date(HARDCODED_DATA.engagementDateStr).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, now - engagementDate);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setElapsed({ days, hours, minutes, seconds });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Ambient sound synth
  const toggleMusic = () => {
    if (isMusicPlaying) {
      if (synthIntervalRef.current) clearInterval(synthIntervalRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close();
      audioCtxRef.current = null;
      setIsMusicPlaying(false);
    } else {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        audioCtxRef.current = ctx;

        const notes = [261.63, 329.63, 392.0, 440.0, 523.25];
        let step = 0;

        const playNote = () => {
          if (!audioCtxRef.current) return;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.value = notes[step % notes.length];
          step++;

          gain.gain.setValueAtTime(0.04, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.8);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 1.8);
        };

        playNote();
        synthIntervalRef.current = setInterval(playNote, 1200);
        setIsMusicPlaying(true);
      } catch (err) {
        console.log("Audio not supported", err);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (synthIntervalRef.current) clearInterval(synthIntervalRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, []);

  const handleNextReason = () => {
    const next = (activeReasonIdx + 1) % HARDCODED_REASONS.length;
    setActiveReasonIdx(next);
    setUnlockedReasons((prev) => new Set(prev).add(next));
  };

  const handlePrevReason = () => {
    const prev = (activeReasonIdx - 1 + HARDCODED_REASONS.length) % HARDCODED_REASONS.length;
    setActiveReasonIdx(prev);
  };

  return (
    <div
      className="min-h-screen text-amber-50 font-sans select-none flex flex-col items-center justify-center p-3 sm:p-6 relative overflow-hidden"
      style={{
        backgroundColor: "#180a12",
        backgroundImage: `radial-gradient(ellipse at top, #3d1424 0%, #180a12 70%)`,
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      {/* Background Floating Rose Petal Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute text-pink-400/30 text-2xl animate-pulse"
            style={{
              top: `${(i * 18) % 100}%`,
              left: `${(i * 27) % 95}%`,
              transform: `scale(${0.6 + (i % 3) * 0.3}) rotate(${i * 30}deg)`,
              animationDuration: `${3 + (i % 4)}s`,
            }}
          >
            🌸
          </div>
        ))}
      </div>

      {/* Floating Ambient Music Toggle */}
      <div className="fixed top-4 right-4 z-40">
        <button
          onClick={toggleMusic}
          className="bg-rose-950/80 backdrop-blur border border-amber-400/40 text-amber-200 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold shadow-xl flex items-center gap-1.5 hover:bg-rose-900/90 transition"
        >
          <span>{isMusicPlaying ? "🔊" : "🔇"}</span>
          <span>{isMusicPlaying ? "Music ON" : "Music OFF"}</span>
        </button>
      </div>

      {/* Main App Container */}
      <div className="w-full max-w-md bg-[#230d1a]/90 backdrop-blur-md min-h-[660px] sm:min-h-[720px] rounded-3xl shadow-[0_0_50px_rgba(212,175,55,0.15)] border-2 border-amber-400/30 overflow-hidden flex flex-col relative z-10">
        
        {/* ---------------------------------------------------- */}
        {/* SCREEN 1: HERO UNBOXING ENVELOPE */}
        {/* ---------------------------------------------------- */}
        {screen === 1 && (
          <div className="flex-1 flex flex-col items-center justify-between p-6 text-center z-10 relative">
            <div className="mt-4 w-full">
              <span className="text-amber-400/90 text-xs tracking-widest uppercase font-mono font-bold bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                ✨ 2ND ENGAGEMENT ANNIVERSARY ✨
              </span>
              <h1 className="text-4xl sm:text-5xl font-bold text-amber-200 mt-3 font-serif leading-tight">
                {HARDCODED_DATA.anniversaryTitle}
              </h1>
              <p className="text-rose-200/90 text-lg mt-1 font-sans">
                {HARDCODED_DATA.anniversarySub}
              </p>
            </div>

            {/* Anniversary Wax Sealed Envelope */}
            <div className="my-6 relative w-full max-w-[300px]">
              <div
                onClick={() => setScreen(2)}
                className="cursor-pointer group relative transition-transform duration-500 hover:scale-105"
              >
                {/* Gold Ribbon Header */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-48 h-8 bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500 rounded-lg shadow-lg z-20 flex items-center justify-center border border-amber-200">
                  <span className="text-rose-950 font-bold text-xs tracking-widest uppercase">
                    💖 SPECIAL DELIVERY
                  </span>
                </div>

                {/* Envelope Body */}
                <div className="w-full h-64 bg-gradient-to-b from-[#3a1424] to-[#250d18] rounded-3xl shadow-2xl border-2 border-amber-400/40 p-5 flex flex-col justify-between items-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(#d4af37_1px,transparent_0)] bg-[size:16px_16px] opacity-10" />

                  <div className="mt-5 w-full bg-[#1e0a15]/90 rounded-2xl p-4 border border-amber-400/30 text-left">
                    <div className="text-xs font-bold text-amber-400 tracking-wider font-mono">
                      ENGAGEMENT CELEBRATION
                    </div>
                    <div className="text-lg font-bold text-rose-100 mt-1">
                      <span className="text-xs text-rose-300 font-sans block">TO:</span>
                      {HARDCODED_DATA.toName} ❤️
                    </div>
                    <div className="text-sm font-semibold text-rose-200 mt-0.5">
                      <span className="text-xs text-rose-300 font-sans block">FROM:</span>
                      {HARDCODED_DATA.fromName} ✨
                    </div>
                  </div>

                  {/* Wax Seal Badge */}
                  <div className="my-2 bg-gradient-to-br from-amber-400 to-amber-600 text-rose-950 font-bold text-base px-5 py-2 rounded-full shadow-lg border border-amber-200 flex items-center gap-2 group-hover:scale-110 transition">
                    <span>💍</span>
                    <span>TAP TO UNWRAP</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Relationship Counter */}
            <div className="w-full bg-rose-950/60 rounded-2xl p-3.5 border border-amber-400/20 text-center mb-2">
              <div className="text-xs text-amber-300 uppercase tracking-widest font-mono font-bold mb-1">
                OUR MILESTONE STATS
              </div>
              <div className="grid grid-cols-4 gap-1 text-center">
                <div className="bg-rose-900/40 p-1.5 rounded-xl border border-rose-400/10">
                  <span className="block text-lg font-bold text-amber-200">{elapsed.days}</span>
                  <span className="text-[10px] text-rose-300">Days</span>
                </div>
                <div className="bg-rose-900/40 p-1.5 rounded-xl border border-rose-400/10">
                  <span className="block text-lg font-bold text-amber-200">{elapsed.hours}</span>
                  <span className="text-[10px] text-rose-300">Hours</span>
                </div>
                <div className="bg-rose-900/40 p-1.5 rounded-xl border border-rose-400/10">
                  <span className="block text-lg font-bold text-amber-200">{elapsed.minutes}</span>
                  <span className="text-[10px] text-rose-300">Mins</span>
                </div>
                <div className="bg-rose-900/40 p-1.5 rounded-xl border border-rose-400/10">
                  <span className="block text-lg font-bold text-amber-200">{elapsed.seconds}</span>
                  <span className="text-[10px] text-rose-300">Secs</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* SCREEN 2: GOODIES & SCRAPBOOK MENU GRID */}
        {/* ---------------------------------------------------- */}
        {screen === 2 && (
          <div className="flex-1 flex flex-col p-4 sm:p-5 z-10 overflow-y-auto">
            <div className="text-center mt-1 mb-3">
              <h2 className="text-3xl font-bold text-amber-200 font-serif">
                Your Anniversary Goodies 🎁
              </h2>
              <p className="text-rose-200/80 text-sm mt-0.5">
                Tap each goodie to open the surprise inside 💌
              </p>
            </div>

            {/* Goodies Grid (5 Items) */}
            <div className="grid grid-cols-2 gap-3 my-auto py-2">
              {[
                { id: "letter", title: "Secret Note", icon: "📝", subtitle: "Special Birthday Letter" },
                { id: "reasons", title: "24 Reasons", icon: "💖", subtitle: "24 Months of Love" },
                { id: "timer", title: "Love Stopwatch", icon: "⏳", subtitle: "Live Counter Together" },
                { id: "hugs", title: "Warm Hugs", icon: "🎀", subtitle: "Infinite Hug" },
                { id: "coupons", title: "Love Coupons", icon: "🎫", subtitle: "Redeemable Dates" },
              ].map((card) => (
                <button
                  key={card.id}
                  onClick={() => setActiveCard(card.id)}
                  className="bg-gradient-to-b from-[#381625] to-[#250d18] rounded-2xl p-4 border border-amber-400/30 hover:border-amber-300 hover:scale-105 transition shadow-lg text-center flex flex-col items-center justify-center group"
                >
                  <span className="text-4xl mb-2 transform group-hover:scale-115 transition">
                    {card.icon}
                  </span>
                  <span className="font-bold text-amber-200 text-lg leading-snug">
                    {card.title}
                  </span>
                  <span className="text-xs text-rose-300/80 mt-0.5">
                    {card.subtitle}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-4 text-center">
              <button
                onClick={() => setScreen(3)}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-rose-950 font-bold text-lg py-3 px-6 rounded-2xl shadow-xl hover:from-amber-400 hover:to-amber-500 transition"
              >
                ✨ Read Final Anniversary Wish ❤️
              </button>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* SCREEN 3: FINAL CLOSING WISH */}
        {/* ---------------------------------------------------- */}
        {screen === 3 && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10 my-auto">
            <div className="bg-gradient-to-b from-[#3a1525] to-[#240c17] rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-amber-400/40 max-w-sm w-full relative">
              <span className="text-5xl block mb-2">💍✨</span>
              <h2 className="text-3xl font-bold text-amber-200 mb-2 font-serif">
                Happy 2nd Engagement Anniversary!
              </h2>

              <p className="text-xl text-rose-100 leading-relaxed my-4 font-serif italic">
                "{HARDCODED_DATA.closingText}"
              </p>

              <div className="text-right text-amber-300 font-bold text-lg border-t border-amber-400/20 pt-3">
                — Forever Yours, {HARDCODED_DATA.signOffName}
              </div>

              <div className="mt-6 flex flex-col gap-2">
                <button
                  onClick={() => setScreen(2)}
                  className="w-full bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 font-bold py-2.5 px-4 rounded-xl text-sm transition border border-amber-400/30"
                >
                  🔄 Explore Goodies Grid Again
                </button>

                <button
                  onClick={() => setScreen(1)}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-rose-950 font-bold py-2.5 px-4 rounded-xl text-sm transition shadow"
                >
                  📦 Replay Anniversary Box
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* MEMORY CARD OVERLAY MODAL */}
      {/* ---------------------------------------------------- */}
      {activeCard !== null && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#240d1a] w-full max-w-sm sm:max-w-md rounded-3xl p-5 sm:p-6 shadow-2xl border-2 border-amber-400/40 relative flex flex-col items-center animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setActiveCard(null)}
              className="absolute top-3 right-3 text-amber-200/80 hover:text-amber-100 bg-rose-950/80 w-8 h-8 rounded-full flex items-center justify-center font-bold text-base transition border border-amber-400/30"
            >
              ✕
            </button>

            {/* 1. SECRET NOTE */}
            {activeCard === "letter" && (
              <div className="w-full text-center flex flex-col items-center relative">
                <h3 className="text-2xl font-bold text-amber-200 mb-3 font-serif">
                  📝 A Secret Note For You
                </h3>
                <div className="bg-[#1c0914] rounded-2xl p-5 border border-amber-400/30 text-left shadow-inner my-1 w-full">
                  <span className="text-xs text-amber-400 font-mono block mb-2 uppercase tracking-wider">
                    TO: {HARDCODED_DATA.toName} | FROM: {HARDCODED_DATA.fromName}
                  </span>
                  <p className="text-xl sm:text-2xl text-rose-100 leading-relaxed font-serif">
                    "{HARDCODED_DATA.noteText}"
                  </p>
                </div>
              </div>
            )}

            {/* 2. 24 REASONS WHY I LOVE YOU */}
            {activeCard === "reasons" && (
              <div className="w-full text-center flex flex-col items-center">
                <h3 className="text-2xl font-bold text-amber-200 mb-1 font-serif">
                  💖 24 Reasons I Love You
                </h3>
                <p className="text-xs text-rose-300 mb-3">
                  1 Reason for every month of our 2-Year Engagement! ({unlockedReasons.size} / 24 Unlocked)
                </p>

                <div className="w-full bg-[#1c0914] p-5 rounded-2xl border border-amber-400/30 my-2 min-h-[160px] flex flex-col items-center justify-center">
                  <span className="text-xs font-mono text-amber-400 uppercase tracking-widest mb-2 font-bold">
                    REASON #{activeReasonIdx + 1} OF 24
                  </span>
                  <p className="text-xl sm:text-2xl text-rose-100 font-serif leading-relaxed">
                    "{HARDCODED_REASONS[activeReasonIdx]}"
                  </p>
                </div>

                <div className="flex justify-between w-full mt-3 gap-2">
                  <button
                    onClick={handlePrevReason}
                    className="flex-1 bg-rose-950 hover:bg-rose-900 text-amber-200 font-bold py-2 rounded-xl text-sm border border-amber-400/30 transition"
                  >
                    ⬅️ Previous
                  </button>
                  <button
                    onClick={handleNextReason}
                    className="flex-1 bg-amber-500 hover:bg-amber-400 text-rose-950 font-bold py-2 rounded-xl text-sm transition shadow"
                  >
                    Next Reason ➡️
                  </button>
                </div>
              </div>
            )}

            {/* 3. LIVE LOVE STOPWATCH */}
            {activeCard === "timer" && (
              <div className="w-full text-center flex flex-col items-center">
                <h3 className="text-2xl font-bold text-amber-200 mb-2 font-serif">
                  ⏳ Our Love Stopwatch
                </h3>
                <p className="text-xs text-rose-300 mb-3">
                  Live counter since the day we said YES on August 6, 2024 💍
                </p>

                <div className="w-full bg-[#1c0914] p-5 rounded-2xl border border-amber-400/30 my-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-rose-950/80 p-3 rounded-xl border border-amber-400/20 text-center">
                      <span className="block text-3xl font-bold text-amber-300">{elapsed.days}</span>
                      <span className="text-xs text-rose-300 uppercase tracking-wider">Days Together</span>
                    </div>
                    <div className="bg-rose-950/80 p-3 rounded-xl border border-amber-400/20 text-center">
                      <span className="block text-3xl font-bold text-amber-300">{elapsed.hours}</span>
                      <span className="text-xs text-rose-300 uppercase tracking-wider">Hours</span>
                    </div>
                    <div className="bg-rose-950/80 p-3 rounded-xl border border-amber-400/20 text-center">
                      <span className="block text-3xl font-bold text-amber-300">{elapsed.minutes}</span>
                      <span className="text-xs text-rose-300 uppercase tracking-wider">Minutes</span>
                    </div>
                    <div className="bg-rose-950/80 p-3 rounded-xl border border-amber-400/20 text-center">
                      <span className="block text-3xl font-bold text-amber-300">{elapsed.seconds}</span>
                      <span className="text-xs text-rose-300 uppercase tracking-wider">Seconds</span>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-amber-300/80 font-mono italic">
                    Counting every single second with you... ❤️
                  </div>
                </div>
              </div>
            )}

            {/* 4. WARM HUGS */}
            {activeCard === "hugs" && (
              <div className="w-full text-center flex flex-col items-center">
                <h3 className="text-2xl font-bold text-amber-200 mb-2 font-serif">
                  🎀 Warm Hugs
                </h3>
                <div className="w-full bg-gradient-to-b from-pink-950/60 to-rose-950/80 p-6 rounded-3xl border border-pink-400/30 shadow-inner my-2 text-center animate-pulse">
                  <span className="text-6xl block mb-2">🫂💖✨</span>
                  <h4 className="text-3xl font-bold text-pink-200 font-serif">
                    {HARDCODED_DATA.hugTitle}
                  </h4>
                  <p className="text-sm text-pink-300 mt-2 font-sans">
                    {HARDCODED_DATA.hugDesc}
                  </p>
                </div>
              </div>
            )}

            {/* 5. LOVE COUPONS */}
            {activeCard === "coupons" && (
              <div className="w-full text-center flex flex-col items-center gap-2">
                <h3 className="text-2xl font-bold text-amber-200 mb-1 font-serif">
                  🎫 2nd Anniversary Love Coupons
                </h3>
                {HARDCODED_COUPONS.map((couponText, idx) => (
                  <div
                    key={idx}
                    className="w-full bg-[#1c0914] p-3 rounded-xl border-2 border-dashed border-amber-400/40 flex items-center justify-between shadow-sm"
                  >
                    <span className="text-base font-bold text-amber-200 text-left">
                      {couponText}
                    </span>
                    <button
                      onClick={() =>
                        setCouponsRedeemed((prev) => ({
                          ...prev,
                          [idx]: !prev[idx],
                        }))
                      }
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg transition ${
                        couponsRedeemed[idx]
                          ? "bg-emerald-600 text-white"
                          : "bg-amber-500 hover:bg-amber-400 text-rose-950"
                      }`}
                    >
                      {couponsRedeemed[idx] ? "REDEEMED ✓" : "REDEEM NOW"}
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="w-full pt-4 border-t border-amber-400/20 text-center mt-3">
              <button
                onClick={() => setActiveCard(null)}
                className="bg-amber-500 hover:bg-amber-400 text-rose-950 font-bold px-6 py-2 rounded-xl text-sm shadow transition"
              >
                Close Goodie ✨
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
