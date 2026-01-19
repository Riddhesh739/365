"use client";
const MOODS = [
  { label: "Calm", color: "#22c55e" },
  { label: "Heavy", color: "#64748b" },
  { label: "Happy", color: "#eab308" },
  { label: "Sad", color: "#3b82f6" },
  { label: "Angry", color: "#ef4444" },
];


import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";


/* ---------- TYPES ---------- */
type Entry = {
  date: string;
  content: string;
  mood: string | null;
};


/* ---------- MAIN PAGE ---------- */
export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [todayEntry, setTodayEntry] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(true);
  const [mood, setMood] = useState("Calm");


  const today = new Date().toISOString().split("T")[0];

  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
  {MOODS.map((m) => (
    <button
      key={m.label}
      onClick={() => setMood(m.label)}
      style={{
        padding: "6px 10px",
        borderRadius: 999,
        border: mood === m.label ? "2px solid #000" : "1px solid #ccc",
        backgroundColor: m.color,
        color: "#000",
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      {m.label}
    </button>
  ))}
</div>


  /* ---------- INIT USER + DATA ---------- */
  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      setUser(user);

      const { data } = await supabase
        .from("entries")
        .select("date, content")
        .eq("user_id", user.id);

      setEntries(data as Entry[] || []);
      setLoading(false);
    };

    init();
  }, []);

  if (loading) {
    return <p style={{ padding: 40 }}>Loading…</p>;
  }

  if (!user) {
    return <Auth />;
  }

  /* ---------- HELPERS ---------- */
  const entryMap = new Map(entries.map((e) => [e.date, e]));
  // 🔥 STREAK CALCULATION
const calculateStreak = () => {
  let streak = 0;
  let cursor = new Date(today);

  while (true) {
    const dateStr = cursor.toISOString().split("T")[0];
    if (entryMap.has(dateStr)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
};

const streak = calculateStreak();


  const submitToday = async () => {
    if (!todayEntry.trim()) return;

    const { error } = await supabase.from("entries").insert({
  user_id: user.id,
  date: today,
  content: todayEntry,
  mood,
});


    if (error) {
      alert("Already written today.");
      return;
    }

    setEntries([...entries, { date: today, content: todayEntry, mood }]);

    setTodayEntry("");
  };

  /* ---------- BUILD 365 DAYS ---------- */
  const start = new Date(new Date().getFullYear(), 0, 1);
  const days = Array.from({ length: 365 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d.toISOString().split("T")[0];
  });

  /* ---------- UI ---------- */
  return (
    <main style={{ padding: 24 }}>
      <h1>365</h1>

      {/* TODAY INPUT */}
      {!entryMap.has(today) && (
        <div style={{ marginBottom: 20 }}>
          <textarea
            placeholder="Write today…"
            value={todayEntry}
            onChange={(e) => setTodayEntry(e.target.value)}
            style={{ width: "100%", height: 80 }}
          />
          <button onClick={submitToday} style={{ marginTop: 8 }}>
            Save today
          </button>
        </div>
      )}

      {entryMap.has(today) && (
        <><p style={{ marginBottom: 20 }}>Today is already written ✅</p><p style={{ marginBottom: 12, fontWeight: 600 }}>
          {streak > 0 ? `🔥 ${streak} day streak` : "🧊 No active streak"}
        </p></>

      )}

      {/* 365 CIRCULAR GRID */}
      {/* GRID */}
<div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: 8,
  }}
>
  {days.map((date) => {
  const entry = entryMap.get(date);
  const isFuture = date > today;
  const isToday = date === today;
  const isPast = date < today;
  const dayNumber = new Date(date).getDate();
  const moodColor =
  entry && entry.mood
    ? MOODS.find((m) => m.label === entry.mood)?.color
    : "#22c55e";


  return (
    <div
      key={date}
      onClick={() => entry && setSelectedEntry(entry)}
      style={{
        width: 36,
        height: 36,
        borderRadius: "50%",

        backgroundColor: isFuture
          ? "#be4444ff"          // future → red
          : entry
          ? moodColor            // written → green
          : isPast
          ? "#94a3b8"            // missed → grey
          : "#94a3b8",

        border: isToday ? "3px solid #2563eb" : "none",

        cursor: entry ? "pointer" : "default",

        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        fontSize: 12,
        fontWeight: 600,
        color: "#ffffff",
        userSelect: "none",
      }}
    >
      {dayNumber}
    </div>
  );
})}

  
</div>


      {/* READ ENTRY PANEL */}
      {selectedEntry && (
        <div
          style={{
            marginTop: 24,
            padding: 16,
            border: "1px solid #ddd",
            borderRadius: 8,
          }}
        >
          <strong style={{ color: "#2563eb" }}>
            {selectedEntry.date}
          </strong>
          <p style={{ marginTop: 8 }}>{selectedEntry.content}</p>
          <button onClick={() => setSelectedEntry(null)}>Close</button>
        </div>
      )}
    </main>
  );
}

/* ---------- AUTH ---------- */
function Auth() {
  const [email, setEmail] = useState("");

  const signIn = async () => {
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) alert(error.message);
    else alert("Check your email for the login link");
  };

  return (
    <main style={{ padding: 40 }}>
      <h1>365</h1>
      <input
        placeholder="Enter email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ padding: 8 }}
      />
      <button onClick={signIn} style={{ marginLeft: 8 }}>
        Login
      </button>
    </main>
  );
}

