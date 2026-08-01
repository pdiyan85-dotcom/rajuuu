import React, { useState, useEffect, useRef } from "react";

// --- TYPES ---
interface GoodieItem {
  id: string;
  type: "voice" | "note" | "photo" | "news" | "location" | "gif" | "coupon";
  title: string;
  icon: string;
  rotation: number;
}

interface BoxData {
  toName: string;
  fromName: string;
  noteText: string;
  closingText: string;
  headlineText: string;
  headlineBody: string;
  locationTitle: string;
  locationDesc: string;
  locationImage: string;
  photoUrl: string;
  photoCaption: string;
  audioUrl: string;
}

const DEFAULT_DATA: BoxData = {
  toName: "My Dearest Bestie ❤️",
  fromName: "With Love, Always ✨",
  noteText:
    "You are my favorite person in the entire world! Thank you for always bringing so much warmth, bright smiles, and pure joy into my life. Here is a little digital care package filled with all my love for you! 💌✨",
  closingText:
    "You're doing amazing! You're my star and my heart's home. Never forget how loved and special you are! ❤️✨",
  headlineText: "THE DAILY GAZETTE — BREAKING NEWS: You Are Officially The Most Amazing Person Ever Born!",
  headlineBody: "Scientists, psychologists, and friends worldwide confirm that you possess a 100% rare gold heart and bring pure happiness to everyone around you. 📰✨",
  locationTitle: "Vietnam 📍",
  locationDesc: "Our unforgettable trip, breathtaking views, and magical favorite memories in Vietnam! 🇻🇳✨",
  locationImage: "/couple-photo.jpg",
  photoUrl: "/couple-photo.jpg",
  photoCaption: "Our Favorite Shot Together 📸❤️",
  audioUrl: "",
};

export default function LittleBoxOfGoodies() {
  const [screen, setScreen] = useState<number>(1);
  const [isOpeningBox, setIsOpeningBox] = useState<boolean>(false);
  const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);
  const [viewedItems, setViewedItems] = useState<Set<string>>(new Set());
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  
  // Set default data directly to ensure user photo & Vietnam spot always display
  const [boxData, setBoxData] = useState<BoxData>(DEFAULT_DATA);

  // Audio Recording & Playback State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [voiceAudioPlaying, setVoiceAudioPlaying] = useState<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const recordingTimerRef = useRef<any>(null);

  // Coupons
  const [couponsRedeemed, setCouponsRedeemed] = useState<Record<number, boolean>>({
    0: false,
    1: false,
    2: false,
  });

  const audioCtxRef = useRef<AudioContext | null>(null);
  const synthIntervalRef = useRef<any>(null);

  const goodies: GoodieItem[] = [
    { id: "voice", type: "voice", title: "Voice Note", icon: "🎙️", rotation: -3 },
    { id: "note", type: "note", title: "Secret Note", icon: "📝", rotation: -2 },
    { id: "photo", type: "photo", title: "Favourite Shot", icon: "📷", rotation: 5 },
    { id: "news", type: "news", title: "Daily Gazette", icon: "📰", rotation: -4 },
    { id: "location", type: "location", title: "Our Spot (Vietnam)", icon: "📍", rotation: 3 },
    { id: "gif", type: "gif", title: "Warm Hugs", icon: "🎀", rotation: -5 },
    { id: "coupon", type: "coupon", title: "Love Coupons", icon: "🎫", rotation: 2 },
  ];

  // Ambient sound synthesizer
  const toggleAmbientSound = () => {
    if (isAudioPlaying) {
      if (synthIntervalRef.current) clearInterval(synthIntervalRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close();
      audioCtxRef.current = null;
      setIsAudioPlaying(false);
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
        setIsAudioPlaying(true);
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

  // Voice Recording Functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const audioUrl = URL.createObjectURL(audioBlob);
        setBoxData((prev) => ({ ...prev, audioUrl }));
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      alert("Microphone access is required to record voice notes. Please grant microphone permission!");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    }
  };

  // Voice Playback Toggle
  const toggleVoicePlayback = () => {
    if (!boxData.audioUrl) return;

    if (!audioElementRef.current) {
      audioElementRef.current = new Audio(boxData.audioUrl);
      audioElementRef.current.onended = () => setVoiceAudioPlaying(false);
    }

    if (voiceAudioPlaying) {
      audioElementRef.current.pause();
      setVoiceAudioPlaying(false);
    } else {
      audioElementRef.current.play();
      setVoiceAudioPlaying(true);
    }
  };

  const handleOpenBox = () => {
    setIsOpeningBox(true);
    setTimeout(() => {
      setScreen(2);
      setIsOpeningBox(false);
    }, 1100);
  };

  const handleOpenItem = (index: number) => {
    setActiveItemIndex(index);
    const item = goodies[index];
    setViewedItems((prev) => new Set(prev).add(item.id));
  };

  const handleNextCard = () => {
    if (activeItemIndex !== null) {
      const nextIdx = (activeItemIndex + 1) % goodies.length;
      handleOpenItem(nextIdx);
    }
  };

  const handlePrevCard = () => {
    if (activeItemIndex !== null) {
      const prevIdx = (activeItemIndex - 1 + goodies.length) % goodies.length;
      handleOpenItem(prevIdx);
    }
  };

  return (
    <div
      className="min-h-screen font-sans select-none flex flex-col items-center justify-center p-3 sm:p-6"
      style={{
        backgroundColor: "#f4ece1",
        backgroundImage: `radial-gradient(#e2d5c3 1px, transparent 0)`,
        backgroundSize: "24px 24px",
        fontFamily: "'Caveat', cursive, 'Outfit', sans-serif",
      }}
    >
      {/* Top Floating Controls */}
      <div className="fixed top-3 right-3 sm:top-5 sm:right-5 z-40 flex items-center gap-2">
        <button
          onClick={toggleAmbientSound}
          className="bg-white/90 backdrop-blur border border-amber-200 shadow-md hover:bg-amber-50 text-amber-900 px-3 py-1.5 rounded-full text-base sm:text-lg flex items-center gap-2 transition"
          title="Toggle Lofi Ambient Sound"
        >
          <span>{isAudioPlaying ? "🔊" : "🔇"}</span>
          <span className="font-semibold text-xs sm:text-sm hidden xs:inline">
            {isAudioPlaying ? "Lofi Music ON" : "Music OFF"}
          </span>
        </button>
      </div>

      {/* Main Container Phone Frame Simulation */}
      <div className="w-full max-w-md bg-[#faf4ec] min-h-[650px] sm:min-h-[720px] rounded-3xl shadow-2xl border-4 border-[#e5d6c3] overflow-hidden flex flex-col relative">
        <div className="absolute top-2 left-6 w-16 h-5 bg-amber-100/60 rotate-[-4deg] z-10 pointer-events-none border border-amber-200/50 shadow-sm" />
        <div className="absolute top-2 right-6 w-16 h-5 bg-amber-100/60 rotate-[4deg] z-10 pointer-events-none border border-amber-200/50 shadow-sm" />

        {/* ---------------------------------------------------- */}
        {/* SCREEN 1: YOU'VE GOT MAIL (BOX UNBOXING) */}
        {/* ---------------------------------------------------- */}
        {screen === 1 && (
          <div className="flex-1 flex flex-col items-center justify-between p-6 text-center z-10 relative">
            <div className="mt-4">
              <span className="text-amber-800/60 text-xs tracking-widest uppercase font-sans font-bold">
                Special Delivery
              </span>
              <h1 className="text-4xl sm:text-5xl font-bold text-amber-950 mt-1 font-serif">
                you've got mail
              </h1>
              <p className="text-amber-800/80 text-xl font-medium mt-1">
                a little care package for you ❤️
              </p>
            </div>

            {/* Interactive Cardboard Box */}
            <div className="my-6 relative">
              <div
                onClick={handleOpenBox}
                className={`cursor-pointer group relative transition-transform duration-500 ${
                  isOpeningBox
                    ? "scale-110 rotate-1 animate-bounce"
                    : "hover:scale-105 animate-pulse"
                }`}
              >
                {/* Packaging Tape Ribbon */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-48 h-8 bg-amber-200/80 border border-amber-300 rounded shadow-sm z-20 flex items-center justify-center">
                  <span className="text-amber-900/70 text-xs tracking-widest font-mono uppercase font-bold">
                    ✂️ FRAGILE WITH CARE
                  </span>
                </div>

                {/* Cardboard Box Body */}
                <div className="w-64 h-56 sm:w-72 sm:h-64 bg-[#b88652] rounded-2xl shadow-xl border-4 border-[#936639] flex flex-col justify-between p-4 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_0)] bg-[size:8px_8px]" />

                  {/* Shipping Label */}
                  <div className="bg-[#fefae0] rounded-xl p-3 shadow-md border border-amber-200 text-left relative z-10 mt-4 rotate-[-1deg]">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-bold text-red-600 tracking-wider uppercase bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                          DIGITAL CARE PACKAGE
                        </span>
                        <div className="mt-2 text-sm sm:text-base font-semibold text-amber-950 leading-tight">
                          <span className="text-xs text-amber-700 font-sans block">TO:</span>
                          {boxData.toName}
                        </div>
                        <div className="mt-1 text-xs sm:text-sm text-amber-900">
                          <span className="text-[10px] text-amber-700 font-sans block">FROM:</span>
                          {boxData.fromName}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span className="text-2xl animate-bounce">❤️</span>
                        <div className="w-8 h-8 border-2 border-dashed border-red-400 rounded-full flex items-center justify-center text-[9px] text-red-600 font-serif font-bold rotate-12">
                          AIR MAIL
                        </div>
                      </div>
                    </div>

                    {/* Barcode */}
                    <div className="mt-2 pt-2 border-t border-amber-200/60 flex items-center justify-between">
                      <div className="h-4 flex gap-1 items-center opacity-70">
                        {[3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5].map((w, i) => (
                          <div key={i} className="h-full bg-amber-950" style={{ width: `${w}px` }} />
                        ))}
                      </div>
                      <span className="text-[9px] font-mono text-amber-800/60">
                        #GOODIES-2026
                      </span>
                    </div>
                  </div>

                  <div className="self-center bg-red-500 text-white font-bold text-base px-4 py-1.5 rounded-full shadow-lg transform group-hover:scale-110 transition">
                    🎁 TAP TO OPEN
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-amber-800/70 text-lg">
                Made with love & special memories ✨
              </p>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* SCREEN 2: TABLETOP MENU GRID */}
        {/* ---------------------------------------------------- */}
        {screen === 2 && (
          <div className="flex-1 flex flex-col p-4 sm:p-6 z-10 overflow-y-auto">
            <div className="text-center mt-1 mb-3">
              <h2 className="text-3xl sm:text-4xl font-bold text-amber-950 font-serif">
                your little box of goodies
              </h2>
              <p className="text-amber-800/80 text-lg mt-0.5">
                Tap each item to unwrap the surprise inside 💌
              </p>

              <div className="mt-2.5 bg-amber-100/80 rounded-full p-1.5 border border-amber-200/80 flex items-center justify-between text-xs text-amber-900 font-semibold px-3 max-w-xs mx-auto">
                <span>Unboxed: {viewedItems.size} / 7</span>
                <div className="flex gap-1">
                  {goodies.map((g) => (
                    <span
                      key={g.id}
                      className={viewedItems.has(g.id) ? "text-amber-600 font-bold" : "opacity-30"}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Scattered Tabletop Grid */}
            <div className="grid grid-cols-2 gap-3 my-auto py-2">
              {goodies.map((item, index) => {
                const isViewed = viewedItems.has(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => handleOpenItem(index)}
                    style={{ transform: `rotate(${item.rotation}deg)` }}
                    className={`group relative bg-white/90 rounded-2xl p-3.5 shadow-md border-2 border-amber-200/80 hover:border-amber-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center flex flex-col items-center justify-center ${
                      isViewed ? "bg-amber-50/60 border-amber-300" : ""
                    }`}
                  >
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-10 h-4 bg-amber-100/80 border border-amber-200/60 rotate-[-2deg] shadow-2xs pointer-events-none" />

                    {isViewed && (
                      <span className="absolute top-2 right-2 text-xs bg-amber-200 text-amber-900 rounded-full w-5 h-5 flex items-center justify-center font-bold">
                        ✓
                      </span>
                    )}

                    <div className="text-4xl my-1 transform group-hover:scale-125 transition duration-300">
                      {item.icon}
                    </div>

                    <span className="text-xl font-bold text-amber-950 mt-1">
                      {item.title}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-3 text-center">
              <button
                onClick={() => setScreen(3)}
                className="w-full bg-gradient-to-r from-red-500 to-amber-600 text-white font-bold text-xl py-3 px-6 rounded-2xl shadow-lg hover:from-red-600 hover:to-amber-700 transition"
              >
                {viewedItems.size === 7 ? "✨ Open Final Card ❤️" : "Read Closing Card ❤️"}
              </button>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* SCREEN 3: FINAL CLOSING CARD */}
        {/* ---------------------------------------------------- */}
        {screen === 3 && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10 my-auto">
            <div className="bg-[#fffdf9] rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-amber-200 max-w-sm w-full relative rotate-[-1deg]">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-6 bg-red-100/80 border border-red-200 rotate-1 shadow-sm" />

              <span className="text-4xl sm:text-5xl block mb-2">🎁✨</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-amber-950 mb-3 font-serif">
                and little goodies ❤️
              </h2>

              <p className="text-2xl sm:text-3xl text-amber-900 leading-relaxed my-4 font-normal">
                "{boxData.closingText}"
              </p>

              <div className="my-4 pt-4 border-t border-amber-200/80 flex flex-col gap-2">
                <button
                  onClick={() => {
                    setViewedItems(new Set());
                    setScreen(2);
                  }}
                  className="w-full bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold py-2.5 px-4 rounded-xl text-lg transition"
                >
                  🔄 Explore Goodies Grid Again
                </button>

                <button
                  onClick={() => {
                    setScreen(1);
                    setViewedItems(new Set());
                  }}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 px-4 rounded-xl text-lg transition shadow"
                >
                  📦 Pack Up Box & Replay
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* CONTENT CARDS OVERLAY MODAL */}
      {/* ---------------------------------------------------- */}
      {activeItemIndex !== null && (
        <div className="fixed inset-0 bg-amber-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#fffefb] w-full max-w-sm sm:max-w-md rounded-3xl p-5 sm:p-6 shadow-2xl border-4 border-amber-200 relative flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-28 h-7 bg-amber-200/80 border border-amber-300 rotate-[-1deg] shadow-sm flex items-center justify-center">
              <span className="text-amber-900/70 text-xs font-serif font-bold uppercase tracking-wider">
                ITEM {activeItemIndex + 1} OF 7
              </span>
            </div>

            <button
              onClick={() => setActiveItemIndex(null)}
              className="absolute top-3 right-3 text-amber-900/60 hover:text-amber-950 bg-amber-100 hover:bg-amber-200 w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg transition"
            >
              ✕
            </button>

            {/* CARD CONTENT TYPES */}
            <div className="w-full mt-4 min-h-[350px] flex flex-col items-center justify-center text-center">
              {/* 1. VOICE AUDIO */}
              {goodies[activeItemIndex].type === "voice" && (
                <div className="w-full flex flex-col items-center">
                  <h3 className="text-2xl font-bold text-amber-950 mb-1">
                    🎙️ Voice Note Section
                  </h3>
                  <p className="text-amber-800 text-base mb-3">
                    A warm audio message recorded just for you!
                  </p>

                  <div className="w-full bg-[#3a3532] text-amber-100 p-4 rounded-2xl border-4 border-[#252220] shadow-xl relative overflow-hidden my-2">
                    <div className="bg-[#e6dccb] text-amber-950 p-2 rounded-lg border border-amber-300 flex justify-between items-center text-xs font-mono mb-2">
                      <span>SIDE A - VOICE NOTE</span>
                      <span>{boxData.audioUrl ? "AUDIO READY ✓" : "SPECIAL MESSAGE"}</span>
                    </div>

                    <div className="flex justify-center items-center gap-6 my-2">
                      <div
                        className={`w-12 h-12 rounded-full border-4 border-amber-200/80 flex items-center justify-center ${
                          voiceAudioPlaying || isRecording ? "animate-spin" : ""
                        }`}
                        style={{ animationDuration: "3s" }}
                      >
                        <div className="w-3.5 h-3.5 bg-amber-100 rounded-full" />
                      </div>
                      <div
                        className={`w-12 h-12 rounded-full border-4 border-amber-200/80 flex items-center justify-center ${
                          voiceAudioPlaying || isRecording ? "animate-spin" : ""
                        }`}
                        style={{ animationDuration: "3s" }}
                      >
                        <div className="w-3.5 h-3.5 bg-amber-100 rounded-full" />
                      </div>
                    </div>
                  </div>

                  <div className="w-full flex flex-col gap-2 mt-2">
                    {boxData.audioUrl ? (
                      <button
                        onClick={toggleVoicePlayback}
                        className="w-full bg-amber-900 hover:bg-amber-950 text-amber-50 font-bold text-lg py-2.5 px-4 rounded-xl shadow flex items-center justify-center gap-2 transition"
                      >
                        <span>{voiceAudioPlaying ? "⏸️ Pause Voice Note" : "▶️ Play Voice Note"}</span>
                      </button>
                    ) : (
                      <div className="flex gap-2 mt-1">
                        {isRecording ? (
                          <button
                            onClick={stopRecording}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 rounded-xl text-sm animate-pulse flex items-center justify-center gap-1"
                          >
                            ⏹️ Stop Recording ({recordingTime}s)
                          </button>
                        ) : (
                          <button
                            onClick={startRecording}
                            className="flex-1 bg-amber-700 hover:bg-amber-800 text-white font-bold py-2 px-3 rounded-xl text-sm flex items-center justify-center gap-1"
                          >
                            🎙️ Play / Record Voice
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 2. SECRET NOTE FOR YOU */}
              {goodies[activeItemIndex].type === "note" && (
                <div className="w-full flex flex-col items-center">
                  <h3 className="text-2xl font-bold text-amber-950 mb-2">
                    📝 A Secret Note For You
                  </h3>

                  <div className="w-full bg-[#fcf8f2] rounded-2xl p-5 border-2 border-amber-200 shadow-inner my-2 text-left relative">
                    <span className="absolute top-2 right-2 text-xl">✨</span>
                    <p className="text-2xl text-amber-900 leading-relaxed font-normal">
                      "{boxData.noteText}"
                    </p>
                  </div>
                </div>
              )}

              {/* 3. FAVOURITE SHOT WITH USER'S REAL PHOTO */}
              {goodies[activeItemIndex].type === "photo" && (
                <div className="w-full flex flex-col items-center">
                  <h3 className="text-2xl font-bold text-amber-950 mb-1">
                    📷 Favourite Shot
                  </h3>

                  <div className="bg-white p-3 pb-4 rounded-xl shadow-xl border border-gray-200 rotate-[-1deg] my-2 w-full max-w-[290px]">
                    <div className="w-full h-64 rounded overflow-hidden bg-gray-100 shadow-inner border border-gray-200 flex items-center justify-center">
                      <img
                        src="/couple-photo.jpg"
                        alt="Favourite Shot"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-amber-950 text-2xl font-bold mt-2 font-serif">
                      {boxData.photoCaption}
                    </p>
                  </div>
                </div>
              )}

              {/* 4. THE DAILY GAZETTE */}
              {goodies[activeItemIndex].type === "news" && (
                <div className="w-full flex flex-col items-center">
                  <h3 className="text-2xl font-bold text-amber-950 mb-2">
                    🗞️ The Daily Gazette
                  </h3>

                  <div className="bg-[#f7f2e9] p-4 rounded-xl border-2 border-amber-900/30 text-amber-950 text-left my-2 shadow-md w-full">
                    <div className="border-b-2 border-amber-950 pb-1 mb-2 flex justify-between items-center">
                      <span className="font-bold text-xs uppercase font-serif tracking-wider">
                        🗞️ THE DAILY GAZETTE
                      </span>
                      <span className="text-[10px]">VOL. 2026</span>
                    </div>
                    <h4 className="text-2xl font-bold font-serif leading-tight">
                      {boxData.headlineText}
                    </h4>
                    <p className="text-lg text-amber-900 mt-2 font-sans">
                      {boxData.headlineBody}
                    </p>
                  </div>
                </div>
              )}

              {/* 5. OUR SPOT (VIETNAM) */}
              {goodies[activeItemIndex].type === "location" && (
                <div className="w-full flex flex-col items-center">
                  <h3 className="text-2xl font-bold text-amber-950 mb-1">
                    📍 Our Spot (Vietnam)
                  </h3>

                  <div className="w-full bg-[#fdfaf5] p-4 rounded-2xl border-2 border-amber-200 shadow-md text-center my-2">
                    <div className="w-full h-44 rounded-xl overflow-hidden mb-3 border border-amber-200 shadow">
                      <img
                        src="/couple-photo.jpg"
                        alt="Our Spot Vietnam"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h4 className="text-3xl font-bold text-amber-950 font-serif">
                      {boxData.locationTitle}
                    </h4>
                    <p className="text-xl text-amber-800 mt-1 leading-snug">
                      {boxData.locationDesc}
                    </p>
                  </div>
                </div>
              )}

              {/* 6. GIF / HUG */}
              {goodies[activeItemIndex].type === "gif" && (
                <div className="w-full flex flex-col items-center">
                  <div className="bg-pink-50 p-6 rounded-3xl border-2 border-pink-200 shadow-inner my-2 text-center animate-bounce">
                    <span className="text-6xl block">🫂💖✨</span>
                    <h4 className="text-3xl font-bold text-pink-900 mt-2">
                      Infinite Warm Hug!
                    </h4>
                  </div>
                </div>
              )}

              {/* 7. COUPONS */}
              {goodies[activeItemIndex].type === "coupon" && (
                <div className="w-full flex flex-col items-center gap-2">
                  <h3 className="text-2xl font-bold text-amber-950">
                    🎫 Redeemable Love Coupons
                  </h3>
                  {[
                    "☕ 1 Free Coffee & Deep Talk",
                    "🍿 1 Movie Night Choice",
                    "🤗 1 Unlimited Warm Hug",
                  ].map((couponText, idx) => (
                    <div
                      key={idx}
                      className="w-full bg-amber-50 p-3 rounded-xl border-2 border-dashed border-amber-400 flex items-center justify-between shadow-sm"
                    >
                      <span className="text-lg font-bold text-amber-900">
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
                            : "bg-amber-600 hover:bg-amber-700 text-white"
                        }`}
                      >
                        {couponsRedeemed[idx] ? "REDEEMED ✓" : "REDEEM NOW"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Navigation */}
            <div className="w-full pt-4 border-t border-amber-200/80 flex justify-between items-center mt-2">
              <button
                onClick={handlePrevCard}
                className="bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold px-4 py-2 rounded-xl text-base transition"
              >
                ⬅️ Previous
              </button>
              <button
                onClick={handleNextCard}
                className="bg-amber-900 hover:bg-amber-950 text-amber-50 font-bold px-4 py-2 rounded-xl text-base transition"
              >
                Next ➡️
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
