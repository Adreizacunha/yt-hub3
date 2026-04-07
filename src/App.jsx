import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, onSnapshot, setDoc } from "firebase/firestore";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "firebase/auth";

// ═══════════════════════════════════════
// FIREBASE CONFIG
// ═══════════════════════════════════════
const firebaseConfig = {
  apiKey: "AIzaSyDhSBfdi3CV-lPlP6jqxK7Qz8EcTeDrwzM",
  authDomain: "yt-hub-994bd.firebaseapp.com",
  projectId: "yt-hub-994bd",
  storageBucket: "yt-hub-994bd.firebasestorage.app",
  messagingSenderId: "28444211141",
  appId: "1:28444211141:web:48e3554b89f81ec2cebdac"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const DOC_REF = doc(db, "dashboard", "main");

const ALLOWED_EMAILS = [
  "adreiza@gmail.com",
  "thiagobragadacunha123@gmail.com",
];

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

// ═══════════════════════════════════════
// LOGIN SCREEN
// ═══════════════════════════════════════
function LoginScreen({ onLogin, error }) {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const email = result.user.email.toLowerCase();
      if (ALLOWED_EMAILS.includes(email)) {
        onLogin(result.user);
      } else {
        await signOut(auth);
        onLogin(null, "Acesso negado. Este email não está autorizado.");
      }
    } catch (err) {
      console.error("Login error:", err);
      onLogin(null, "Erro ao fazer login. Tente novamente.");
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(160deg, #fef7f0 0%, #fff5eb 50%, #fef0e4 100%)",
      fontFamily: "'Nunito', sans-serif", padding: 20,
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
      <div style={{ maxWidth: 400, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>📺</div>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: "#1a1a2e", margin: "0 0 8px" }}>YT Hub</h1>
        <p style={{ fontSize: 15, color: "#64748b", margin: "0 0 32px", lineHeight: 1.5 }}>
          Gestão de canais YouTube<br />Faça login pra acessar
        </p>

        {error && (
          <div style={{
            background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 14,
            padding: "12px 18px", marginBottom: 20, fontSize: 13, fontWeight: 600, color: "#dc2626",
          }}>
            ⚠️ {error}
          </div>
        )}

        <button onClick={handleLogin} disabled={loading}
          style={{
            width: "100%", padding: "14px 24px", border: "none", borderRadius: 14,
            background: "#fff", color: "#1a1a2e", fontSize: 15, fontWeight: 700,
            cursor: loading ? "wait" : "pointer", fontFamily: "'Nunito', sans-serif",
            boxShadow: "0 2px 12px rgba(0,0,0,0.08)", display: "flex", alignItems: "center",
            justifyContent: "center", gap: 12, transition: "all 0.15s",
          }}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.12)"; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.08)"; }}
        >
          <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
          {loading ? "Entrando..." : "Entrar com Google"}
        </button>

        <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 20 }}>
          Acesso restrito a usuários autorizados
        </p>
      </div>
    </div>
  );
}

const STATUSES = ["Ideia", "Roteiro", "Edição", "Thumb", "Revisão", "Agendar", "Postado"];
const STATUS_EMOJI = { Ideia: "💡", Roteiro: "📝", Edição: "🎬", Thumb: "🖼", Revisão: "🔍", Agendar: "📅", Postado: "✅" };
const STATUS_COLOR = { Ideia: "#8b5cf6", Roteiro: "#3b82f6", Edição: "#f59e0b", Thumb: "#ec4899", Revisão: "#10b981", Agendar: "#06b6d4", Postado: "#22c55e" };
const STATUS_BG = { Ideia: "#ede9fe", Roteiro: "#dbeafe", Edição: "#fef3c7", Thumb: "#fce7f3", Revisão: "#d1fae5", Agendar: "#cffafe", Postado: "#dcfce7" };
const NEXT_STATUS = { Ideia: "Roteiro", Roteiro: "Edição", Edição: "Thumb", Thumb: "Revisão", Revisão: "Agendar", Agendar: "Postado" };

const EMPTY = { channels: [], videos: [], backlog: [], setupDone: false };

const CHANNEL_COLORS = [
  { bg: "#fef2f2", accent: "#ef4444", light: "#fca5a5" },
  { bg: "#fff7ed", accent: "#f97316", light: "#fdba74" },
  { bg: "#fefce8", accent: "#eab308", light: "#fde047" },
  { bg: "#f0fdf4", accent: "#22c55e", light: "#86efac" },
  { bg: "#ecfeff", accent: "#06b6d4", light: "#67e8f9" },
  { bg: "#eef2ff", accent: "#6366f1", light: "#a5b4fc" },
  { bg: "#fdf4ff", accent: "#d946ef", light: "#e879f9" },
  { bg: "#fff1f2", accent: "#f43f5e", light: "#fb7185" },
  { bg: "#f0fdfa", accent: "#14b8a6", light: "#5eead4" },
  { bg: "#faf5ff", accent: "#a855f7", light: "#c084fc" },
  { bg: "#fefce8", accent: "#ca8a04", light: "#facc15" },
  { bg: "#f1f5f9", accent: "#475569", light: "#94a3b8" },
];

// ═══════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════

function Btn({ children, onClick, variant = "primary", size = "md", full = false, style: s = {} }) {
  const base = { border: "none", borderRadius: 14, cursor: "pointer", fontFamily: "'Nunito', sans-serif", fontWeight: 700, transition: "all 0.15s", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 };
  const sizes = { sm: { fontSize: 12, padding: "7px 14px" }, md: { fontSize: 14, padding: "11px 22px" }, lg: { fontSize: 16, padding: "14px 28px" } };
  const variants = {
    primary: { background: "#1a1a2e", color: "#fff" },
    accent: { background: "#ff6b35", color: "#fff", boxShadow: "0 4px 16px rgba(255,107,53,0.3)" },
    success: { background: "#10b981", color: "#fff" },
    ghost: { background: "rgba(0,0,0,0.05)", color: "#1a1a2e" },
    danger: { background: "#fee2e2", color: "#dc2626" },
    white: { background: "#fff", color: "#1a1a2e", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" },
  };
  return <button onClick={onClick} style={{ ...base, ...sizes[size], ...variants[variant], width: full ? "100%" : "auto", ...s }}>{children}</button>;
}

function Input({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 5, fontFamily: "'Nunito', sans-serif", textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</label>}
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: "100%", padding: "11px 14px", background: "#f8fafc", border: "2px solid #e2e8f0", borderRadius: 12, fontSize: 14, fontFamily: "'Nunito', sans-serif", outline: "none", boxSizing: "border-box", color: "#1a1a2e", transition: "border-color 0.2s" }}
        onFocus={e => e.target.style.borderColor = "#ff6b35"} onBlur={e => e.target.style.borderColor = "#e2e8f0"} />
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 5, fontFamily: "'Nunito', sans-serif", textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</label>}
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ width: "100%", padding: "11px 14px", background: "#f8fafc", border: "2px solid #e2e8f0", borderRadius: 12, fontSize: 14, fontFamily: "'Nunito', sans-serif", outline: "none", boxSizing: "border-box", color: "#1a1a2e", cursor: "pointer" }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 2000 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: "24px 24px 0 0", padding: "24px 24px 36px", width: "100%", maxWidth: 540, maxHeight: "85vh", overflowY: "auto", animation: "slideUp 0.25s ease" }}>
        <div style={{ width: 40, height: 4, background: "#e2e8f0", borderRadius: 2, margin: "0 auto 16px" }} />
        <h3 style={{ margin: "0 0 18px", fontSize: 17, fontWeight: 800, color: "#1a1a2e", fontFamily: "'Nunito', sans-serif" }}>{title}</h3>
        {children}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// SETUP WIZARD
// ═══════════════════════════════════════
function SetupWizard({ onComplete }) {
  const [channels, setChannels] = useState([{ name: "", nicho: "", responsavel: "Adreiza", frequencia: 5, idioma: "" }]);
  const addCh = () => setChannels([...channels, { name: "", nicho: "", responsavel: "Adreiza", frequencia: 5, idioma: "" }]);
  const updCh = (i, f, v) => setChannels(channels.map((c, idx) => idx === i ? { ...c, [f]: v } : c));
  const rmCh = (i) => channels.length > 1 && setChannels(channels.filter((_, idx) => idx !== i));

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #fef7f0 0%, #fff5eb 50%, #fef0e4 100%)", padding: 20, display: "flex", justifyContent: "center" }}>
      <div style={{ maxWidth: 460, width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 52, marginBottom: 8 }}>📺</div>
          <h1 style={{ fontFamily: "'Nunito', sans-serif", fontSize: 26, fontWeight: 900, color: "#1a1a2e", margin: "0 0 8px" }}>Cadastre seus canais</h1>
          <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 14, color: "#64748b" }}>Depois é só ir gerenciando os vídeos de cada um.</p>
        </div>

        {channels.map((ch, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 18, padding: 18, marginBottom: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", position: "relative", borderLeft: `4px solid ${CHANNEL_COLORS[i % CHANNEL_COLORS.length].accent}` }}>
            {channels.length > 1 && <button onClick={() => rmCh(i)} style={{ position: "absolute", top: 10, right: 14, background: "none", border: "none", fontSize: 18, color: "#cbd5e1", cursor: "pointer" }}>×</button>}
            <div style={{ fontSize: 11, fontWeight: 800, color: CHANNEL_COLORS[i % CHANNEL_COLORS.length].accent, marginBottom: 10, fontFamily: "'Nunito', sans-serif" }}>CANAL {i + 1}</div>
            <Input label="Nome" value={ch.name} onChange={v => updCh(i, "name", v)} placeholder="Ex: Fatos Curiosos" />
            <Input label="Nicho" value={ch.nicho} onChange={v => updCh(i, "nicho", v)} placeholder="Ex: Curiosidades" />
            <Input label="Idioma" value={ch.idioma || ""} onChange={v => updCh(i, "idioma", v)} placeholder="Ex: Português, Inglês..." />
            <Select label="Quem faz os vídeos?" value={ch.responsavel} onChange={v => updCh(i, "responsavel", v)}
              options={[{ value: "Adreiza", label: "Adreiza" }, { value: "Thiago", label: "Thiago" }]} />
            <Input label="Frequência (vídeos/semana)" type="number" value={ch.frequencia || 5} onChange={v => updCh(i, "frequencia", parseInt(v) || 1)} placeholder="5" />
          </div>
        ))}
        <Btn variant="ghost" full onClick={addCh} style={{ marginBottom: 16 }}>+ Adicionar canal</Btn>
        <Btn variant="accent" size="lg" full onClick={() => {
          const valid = channels.filter(c => c.name.trim());
          if (!valid.length) return alert("Cadastre pelo menos 1 canal!");
          onComplete(valid.map((c, i) => ({ ...c, id: uid(), colorIndex: i })));
        }}>Pronto! Começar →</Btn>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// MONTHLY CALENDAR COMPONENT
// ═══════════════════════════════════════
function MonthCalendar({ videos, onUpdateVideo, onEditVideo, month, year, onChangeMonth }) {
  const [dragId, setDragId] = useState(null);
  const [dragOverDate, setDragOverDate] = useState(null);

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPad = (firstDay.getDay() + 6) % 7; // Monday = 0
  const totalDays = lastDay.getDate();

  const monthName = firstDay.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  const cells = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const today = new Date();
  const isToday = (d) => d && today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;

  const getDateStr = (d) => {
    const mm = String(month + 1).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    return `${year}-${mm}-${dd}`;
  };

  const handleDrop = (e, day) => {
    e.preventDefault();
    if (dragId && day) {
      onUpdateVideo(dragId, { dueDate: getDateStr(day) });
      setDragId(null);
      setDragOverDate(null);
    }
  };

  return (
    <div>
      {/* Month nav */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <button onClick={() => onChangeMonth(-1)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#64748b", padding: "4px 10px" }}>‹</button>
        <span style={{ fontSize: 15, fontWeight: 800, color: "#1a1a2e", fontFamily: "'Nunito', sans-serif", textTransform: "capitalize" }}>{monthName}</span>
        <button onClick={() => onChangeMonth(1)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#64748b", padding: "4px 10px" }}>›</button>
      </div>
      {/* Day headers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 4 }}>
        {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map(d => (
          <div key={d} style={{ textAlign: "center", fontSize: 10, fontWeight: 800, color: "#94a3b8", padding: "4px 0", fontFamily: "'Nunito', sans-serif" }}>{d}</div>
        ))}
      </div>
      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3 }}>
        {cells.map((day, i) => {
          if (!day) return <div key={`e${i}`} style={{ minHeight: 70 }} />;
          const ds = getDateStr(day);
          const dayVids = videos.filter(v => v.dueDate === ds);
          const isDragOver = dragOverDate === day;
          const isPast = new Date(ds) < new Date(today.toDateString()) && !isToday(day);

          return (
            <div key={day}
              onDragOver={e => { e.preventDefault(); setDragOverDate(day); }}
              onDragLeave={() => setDragOverDate(null)}
              onDrop={e => handleDrop(e, day)}
              style={{
                minHeight: 70, background: isDragOver ? "#fff7ed" : isToday(day) ? "#fef7f0" : "#fff",
                borderRadius: 10, padding: "4px 5px",
                border: isDragOver ? "2px solid #ff6b35" : isToday(day) ? "2px solid #ff6b35" : "1px solid #f1f5f9",
                transition: "all 0.15s", overflow: "hidden",
                opacity: isPast ? 0.5 : 1,
              }}>
              <div style={{ fontSize: 12, fontWeight: isToday(day) ? 900 : 600, color: isToday(day) ? "#ff6b35" : "#475569", marginBottom: 3, textAlign: "center" }}>
                {day}
              </div>
              {dayVids.map(v => (
                <div key={v.id} draggable
                  onDragStart={e => { setDragId(v.id); e.dataTransfer.effectAllowed = "move"; }}
                  onDragEnd={() => { setDragId(null); setDragOverDate(null); }}
                  onClick={() => onEditVideo(v)}
                  title={v.title}
                  style={{
                    fontSize: 10, fontWeight: 700, padding: "4px 6px", borderRadius: 6, marginBottom: 2,
                    background: STATUS_BG[v.status], color: STATUS_COLOR[v.status],
                    cursor: "grab", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    border: `1px solid ${STATUS_COLOR[v.status]}30`,
                    fontFamily: "'Nunito', sans-serif", textAlign: "center",
                  }}>
                  {STATUS_EMOJI[v.status]} {v.status}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Unscheduled videos — draggable pool */}
      {(() => {
        const unscheduled = videos.filter(v => !v.dueDate && v.status !== "Postado");
        if (unscheduled.length === 0) return null;
        return (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#f59e0b", marginBottom: 8, fontFamily: "'Nunito', sans-serif" }}>📌 Sem data — arraste para o calendário</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {unscheduled.map(v => (
                <div key={v.id} draggable
                  onDragStart={e => { setDragId(v.id); e.dataTransfer.effectAllowed = "move"; }}
                  onDragEnd={() => { setDragId(null); setDragOverDate(null); }}
                  onClick={() => onEditVideo(v)}
                  style={{
                    fontSize: 11, fontWeight: 700, padding: "6px 10px", borderRadius: 10,
                    background: STATUS_BG[v.status], color: STATUS_COLOR[v.status],
                    cursor: "grab", border: `1px solid ${STATUS_COLOR[v.status]}30`,
                    fontFamily: "'Nunito', sans-serif",
                  }}>
                  {STATUS_EMOJI[v.status]} {v.title}
                </div>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ═══════════════════════════════════════
// CHANNEL KANBAN PAGE (with calendar tab)
// ═══════════════════════════════════════
function ChannelPage({ channel, videos, colorSet, onBack, onAddVideo, onUpdateVideo, onDeleteVideo }) {
  const [dragId, setDragId] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [tab, setTab] = useState("kanban");
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());

  const overdue = videos.filter(v => v.dueDate && new Date(v.dueDate) < new Date() && v.status !== "Postado");

  const changeMonth = (dir) => {
    let m = calMonth + dir;
    let y = calYear;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setCalMonth(m);
    setCalYear(y);
  };

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", fontSize: 26, cursor: "pointer", color: "#64748b", padding: "4px 8px" }}>←</button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 26, fontWeight: 900, margin: 0, fontFamily: "'Nunito', sans-serif", color: "#1a1a2e" }}>{channel.name}</h1>
          <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 20, background: "#f1f5f9", color: "#475569" }}>{channel.nicho || "—"}</span>
            <span style={{ fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 20, background: channel.responsavel === "Thiago" ? "#dbeafe" : "#ede9fe", color: channel.responsavel === "Thiago" ? "#2563eb" : "#7c3aed" }}>{channel.responsavel}</span>
            <span style={{ fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 20, background: "#fef3c7", color: "#92400e" }}>📅 {channel.frequencia || 5}x/semana</span>
            {channel.idioma && <span style={{ fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 20, background: "#e0e7ff", color: "#4338ca" }}>🌐 {channel.idioma}</span>}
          </div>
        </div>
        <Btn variant="accent" size="md" onClick={() => { setForm({ title: "", status: "Ideia", responsavel: channel.responsavel, dueDate: "", priority: "Média", notes: "" }); setModal("new"); }}>+ Vídeo</Btn>
      </div>

      {/* Overdue alert */}
      {overdue.length > 0 && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 14, padding: "12px 18px", marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 18 }}>⚠️</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#dc2626", fontFamily: "'Nunito', sans-serif" }}>{overdue.length} vídeo{overdue.length > 1 ? "s" : ""} atrasado{overdue.length > 1 ? "s" : ""}!</span>
        </div>
      )}

      {/* Stats bar */}
      <div style={{ display: "flex", gap: 6, marginBottom: 14, overflowX: "auto", paddingBottom: 4 }}>
        {STATUSES.map(s => {
          const count = videos.filter(v => v.status === s).length;
          return (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 20, background: count > 0 ? STATUS_BG[s] : "#f8fafc", whiteSpace: "nowrap" }}>
              <span style={{ fontSize: 14 }}>{STATUS_EMOJI[s]}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: count > 0 ? STATUS_COLOR[s] : "#cbd5e1" }}>{s} {count}</span>
            </div>
          );
        })}
      </div>

      {/* Tab switcher */}
      <div style={{ display: "flex", gap: 4, background: "#f1f5f9", borderRadius: 12, padding: 4, marginBottom: 16 }}>
        {[{ id: "kanban", label: "☰ Pipeline" }, { id: "calendar", label: "📅 Calendário" }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{
              flex: 1, padding: "11px 0", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700,
              cursor: "pointer", fontFamily: "'Nunito', sans-serif", transition: "all 0.15s",
              background: tab === t.id ? "#fff" : "transparent",
              color: tab === t.id ? "#ff6b35" : "#94a3b8",
              boxShadow: tab === t.id ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
            }}>{t.label}</button>
        ))}
      </div>

      {/* KANBAN TAB */}
      {tab === "kanban" && (
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 16, scrollSnapType: "x mandatory" }}>
          {STATUSES.map(status => {
            const col = videos.filter(v => v.status === status);
            const isOver = dragOver === status;
            return (
              <div key={status}
                onDragOver={e => { e.preventDefault(); setDragOver(status); }}
                onDragLeave={() => setDragOver(null)}
                onDrop={e => { e.preventDefault(); if (dragId) { onUpdateVideo(dragId, { status }); setDragId(null); setDragOver(null); } }}
                style={{
                  minWidth: 260, flex: "0 0 260px", scrollSnapAlign: "start",
                  background: isOver ? STATUS_BG[status] : "#fff",
                  borderRadius: 16, border: `2px solid ${isOver ? STATUS_COLOR[status] + "60" : "#f1f5f9"}`,
                  transition: "all 0.15s", display: "flex", flexDirection: "column",
                }}>
                <div style={{ padding: "12px 14px 8px", display: "flex", alignItems: "center", gap: 6, borderBottom: `2px solid ${STATUS_COLOR[status]}20` }}>
                  <span style={{ fontSize: 14 }}>{STATUS_EMOJI[status]}</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: STATUS_COLOR[status], fontFamily: "'Nunito', sans-serif" }}>{status}</span>
                  <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 800, color: STATUS_COLOR[status], background: STATUS_BG[status], padding: "2px 8px", borderRadius: 10 }}>{col.length}</span>
                </div>
                <div style={{ padding: 6, flex: 1, display: "flex", flexDirection: "column", gap: 6, minHeight: 80, maxHeight: 400, overflowY: "auto" }}>
                  {col.map(v => {
                    const isDragging = dragId === v.id;
                    const isOverdue = v.dueDate && new Date(v.dueDate) < new Date() && v.status !== "Postado";
                    return (
                      <div key={v.id} draggable
                        onDragStart={e => { setDragId(v.id); e.dataTransfer.effectAllowed = "move"; }}
                        onDragEnd={() => { setDragId(null); setDragOver(null); }}
                        onClick={() => { setForm({ ...v }); setModal("edit"); }}
                        style={{
                          background: isOverdue ? "#fef2f2" : "#f8fafc", borderRadius: 12, padding: "10px 12px",
                          border: `1px solid ${isOverdue ? "#fca5a5" : "#e2e8f0"}`,
                          cursor: "grab", opacity: isDragging ? 0.4 : 1, transition: "all 0.15s",
                        }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a2e", lineHeight: 1.3, marginBottom: 6, fontFamily: "'Nunito', sans-serif" }}>{v.title}</div>
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" }}>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 10, background: v.responsavel === "Thiago" ? "#dbeafe" : "#ede9fe", color: v.responsavel === "Thiago" ? "#2563eb" : "#7c3aed" }}>{v.responsavel}</span>
                          {v.dueDate && (
                            <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 10, background: isOverdue ? "#fee2e2" : "#fef3c7", color: isOverdue ? "#dc2626" : "#92400e" }}>
                              {isOverdue ? "⚠️ " : ""}{new Date(v.dueDate + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                            </span>
                          )}
                        </div>
                        {NEXT_STATUS[v.status] && (
                          <button onClick={e => { e.stopPropagation(); onUpdateVideo(v.id, { status: NEXT_STATUS[v.status] }); }}
                            style={{ marginTop: 8, width: "100%", background: STATUS_BG[NEXT_STATUS[v.status]], border: "none", borderRadius: 8, padding: "6px 0", fontSize: 11, fontWeight: 700, color: STATUS_COLOR[NEXT_STATUS[v.status]], cursor: "pointer", fontFamily: "'Nunito', sans-serif" }}>
                            → {NEXT_STATUS[v.status]}
                          </button>
                        )}
                      </div>
                    );
                  })}
                  {col.length === 0 && (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 60, border: "2px dashed #e2e8f0", borderRadius: 10, margin: 4, color: "#cbd5e1", fontSize: 11, fontWeight: 600 }}>
                      Arraste aqui
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CALENDAR TAB */}
      {tab === "calendar" && (
        <MonthCalendar
          videos={videos}
          onUpdateVideo={onUpdateVideo}
          onEditVideo={v => { setForm({ ...v }); setModal("edit"); }}
          month={calMonth}
          year={calYear}
          onChangeMonth={changeMonth}
        />
      )}

      {/* Video modal */}
      <Modal open={modal === "new" || modal === "edit"} onClose={() => setModal(null)} title={modal === "edit" ? "Editar Vídeo" : "Novo Vídeo"}>
        <Input label="Título" value={form.title || ""} onChange={v => setForm({ ...form, title: v })} placeholder="Ex: 10 Fatos sobre..." />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Select label="Status" value={form.status || "Ideia"} onChange={v => setForm({ ...form, status: v })}
            options={STATUSES.map(s => ({ value: s, label: `${STATUS_EMOJI[s]} ${s}` }))} />
          <Select label="Responsável" value={form.responsavel || "Adreiza"} onChange={v => setForm({ ...form, responsavel: v })}
            options={[{ value: "Adreiza", label: "Adreiza" }, { value: "Thiago", label: "Thiago" }]} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Input label="Data Postagem" type="date" value={form.dueDate || ""} onChange={v => setForm({ ...form, dueDate: v })} />
          <Select label="Prioridade" value={form.priority || "Média"} onChange={v => setForm({ ...form, priority: v })}
            options={[{ value: "Alta", label: "🔴 Alta" }, { value: "Média", label: "🟡 Média" }, { value: "Baixa", label: "🟢 Baixa" }]} />
        </div>
        <Input label="Notas" value={form.notes || ""} onChange={v => setForm({ ...form, notes: v })} placeholder="Observações..." />
        <Btn variant="accent" full onClick={() => {
          if (!form.title?.trim()) return alert("Digite um título!");
          if (modal === "edit") onUpdateVideo(form.id, form);
          else onAddVideo({ ...form, channelId: channel.id });
          setModal(null);
        }}>{modal === "edit" ? "Salvar" : "Criar Vídeo"}</Btn>
        {modal === "edit" && <Btn variant="danger" full onClick={() => { onDeleteVideo(form.id); setModal(null); }} style={{ marginTop: 8 }}>Deletar</Btn>}
      </Modal>
    </div>
  );
}

// ═══════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════
export default function App() {
  const [user, setUser] = useState(undefined); // undefined = loading, null = not logged in
  const [authError, setAuthError] = useState(null);
  const [data, setData] = useState(null);
  const [view, setView] = useState("home");
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [noteFilter, setNoteFilter] = useState("Todos");
  const saveRef = useRef(null);

  // ─── Auth listener ───
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser && ALLOWED_EMAILS.includes(firebaseUser.email.toLowerCase())) {
        setUser(firebaseUser);
      } else {
        setUser(null);
      }
    });
    return () => unsub();
  }, []);

  // ─── Firebase realtime sync ───
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(DOC_REF, (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        // Migrate Auxiliar -> Thiago
        let migrated = false;
        if (d.channels) {
          d.channels = d.channels.map(c => {
            if (c.responsavel === "Auxiliar") { migrated = true; return { ...c, responsavel: "Thiago" }; }
            if (c.responsavel === "Eu") { migrated = true; return { ...c, responsavel: "Adreiza" }; }
            return c;
          });
        }
        if (d.videos) {
          d.videos = d.videos.map(v => {
            if (v.responsavel === "Auxiliar") { migrated = true; return { ...v, responsavel: "Thiago" }; }
            if (v.responsavel === "Eu") { migrated = true; return { ...v, responsavel: "Adreiza" }; }
            return v;
          });
        }
        setData(d);
        if (migrated) setDoc(DOC_REF, d);
      } else {
        setData(EMPTY);
      }
    }, (err) => {
      console.error("Firebase error:", err);
      try {
        const s = localStorage.getItem("yt-cards-v2");
        if (s) setData(JSON.parse(s));
        else setData(EMPTY);
      } catch { setData(EMPTY); }
    });
    return () => unsub();
  }, [user]);

  const save = useCallback((d) => {
    setData(d);
    if (saveRef.current) clearTimeout(saveRef.current);
    saveRef.current = setTimeout(() => {
      setDoc(DOC_REF, d).catch(err => {
        console.error("Save failed:", err);
        try { localStorage.setItem("yt-cards-v2", JSON.stringify(d)); } catch {}
      });
    }, 300);
  }, []);

  const addVideo = v => save({ ...data, videos: [...data.videos, { ...v, id: uid(), createdAt: new Date().toISOString() }] });
  const updateVideo = (id, u) => save({ ...data, videos: data.videos.map(v => v.id === id ? { ...v, ...u } : v) });
  const deleteVideo = id => save({ ...data, videos: data.videos.filter(v => v.id !== id) });
  const addChannel = ch => save({ ...data, channels: [...data.channels, { ...ch, id: uid(), colorIndex: data.channels.length }] });
  const updateChannel = (id, u) => save({ ...data, channels: data.channels.map(c => c.id === id ? { ...c, ...u } : c) });
  const deleteChannel = id => save({ ...data, channels: data.channels.filter(c => c.id !== id), videos: data.videos.filter(v => v.channelId !== id) });
  const addBacklog = b => save({ ...data, backlog: [...data.backlog, { ...b, id: uid() }] });
  const updateBacklog = (id, u) => save({ ...data, backlog: data.backlog.map(b => b.id === id ? { ...b, ...u } : b) });
  const deleteBacklog = id => save({ ...data, backlog: data.backlog.filter(b => b.id !== id) });
  const addNote = n => save({ ...data, notes: [...(data.notes || []), { ...n, id: uid(), createdAt: new Date().toISOString() }] });
  const updateNote = (id, u) => save({ ...data, notes: (data.notes || []).map(n => n.id === id ? { ...n, ...u } : n) });
  const deleteNote = id => save({ ...data, notes: (data.notes || []).filter(n => n.id !== id) });

  const totalPending = useMemo(() => data ? data.videos.filter(v => v.status !== "Postado").length : 0, [data]);
  const totalOverdue = useMemo(() => data ? data.videos.filter(v => v.dueDate && new Date(v.dueDate) < new Date() && v.status !== "Postado").length : 0, [data]);

  const handleLogin = (loggedUser, error) => {
    if (error) {
      setAuthError(error);
      setUser(null);
    } else if (loggedUser) {
      setAuthError(null);
      setUser(loggedUser);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setData(null);
  };

  // ─── Loading state ───
  if (user === undefined) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(160deg, #fef7f0 0%, #fff5eb 50%, #fef0e4 100%)", fontFamily: "'Nunito', sans-serif" }}>
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
        <div style={{ textAlign: "center", color: "#64748b" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📺</div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>Carregando...</div>
        </div>
      </div>
    );
  }

  // ─── Login screen ───
  if (!user) {
    return <LoginScreen onLogin={handleLogin} error={authError} />;
  }

  if (!data) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(160deg, #fef7f0 0%, #fff5eb 50%, #fef0e4 100%)", fontFamily: "'Nunito', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
      <div style={{ textAlign: "center", color: "#64748b" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📺</div>
        <div style={{ fontSize: 15, fontWeight: 700 }}>Carregando dados...</div>
      </div>
    </div>
  );

  if (!data.setupDone) {
    return (
      <>
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
        <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}} @keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}} *{box-sizing:border-box} body{margin:0}`}</style>
        <SetupWizard onComplete={(channels) => save({ ...data, channels, setupDone: true })} />
      </>
    );
  }

  const NAV = [
    { id: "home", label: "Canais", icon: "📺" },
    { id: "ideas", label: "Ideias", icon: "💡" },
    { id: "notes", label: "Mural", icon: "📌" },
    { id: "settings", label: "Config", icon: "⚙️" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #fef7f0 0%, #fff5eb 50%, #fef0e4 100%)", fontFamily: "'Nunito', sans-serif", color: "#1a1a2e", margin: 0, padding: 0, width: "100vw", position: "absolute", left: 0, top: 0 }}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}} @keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}} *{box-sizing:border-box} body{margin:0} ::-webkit-scrollbar{width:4px;height:4px} ::-webkit-scrollbar-thumb{background:#ddd;border-radius:2px}`}</style>

      <div style={{ margin: "0 auto", padding: "20px 32px 90px", minHeight: "100vh" }}>

        {/* ═══ HOME — Channel Cards ═══ */}
        {view === "home" && !selectedChannel && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <div>
                <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0 }}>Meus Canais</h1>
                <p style={{ fontSize: 13, color: "#94a3b8", margin: "2px 0 0", fontWeight: 600 }}>
                  {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", borderRadius: 12, padding: "6px 12px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                  {user.photoURL && <img src={user.photoURL} alt="" style={{ width: 24, height: 24, borderRadius: "50%" }} />}
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#64748b" }}>{user.displayName?.split(" ")[0]}</span>
                  <button onClick={handleLogout} title="Sair"
                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#94a3b8", padding: "2px 4px" }}>↗</button>
                </div>
                <Btn variant="accent" size="sm" onClick={() => { setForm({ name: "", nicho: "", idioma: "", responsavel: "Adreiza", frequencia: 5 }); setModal("newChannel"); }}>+ Canal</Btn>
              </div>
            </div>

            {/* Global stats */}
            <div style={{ display: "flex", gap: 8, margin: "16px 0" }}>
              {[
                { label: "Canais", value: data.channels.length, color: "#6366f1", bg: "#eef2ff" },
                { label: "Pendentes", value: totalPending, color: "#f59e0b", bg: "#fefce8" },
                { label: "Atrasados", value: totalOverdue, color: "#ef4444", bg: "#fef2f2" },
              ].map(s => (
                <div key={s.label} style={{ flex: 1, background: s.bg, borderRadius: 16, padding: "16px 14px", textAlign: "center" }}>
                  <div style={{ fontSize: 30, fontWeight: 900, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Overdue banner */}
            {totalOverdue > 0 && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 16, padding: "12px 18px", marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 22 }}>⚠️</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#dc2626" }}>{totalOverdue} vídeo{totalOverdue > 1 ? "s" : ""} atrasado{totalOverdue > 1 ? "s" : ""}!</div>
                  <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>Clique no canal pra resolver</div>
                </div>
              </div>
            )}

            {/* Channel Cards Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
              {data.channels.map((ch, i) => {
                const colors = CHANNEL_COLORS[ch.colorIndex !== undefined ? ch.colorIndex % CHANNEL_COLORS.length : i % CHANNEL_COLORS.length];
                const chVideos = data.videos.filter(v => v.channelId === ch.id);
                const pending = chVideos.filter(v => v.status !== "Postado").length;
                const posted = chVideos.filter(v => v.status === "Postado").length;
                const overdue = chVideos.filter(v => v.dueDate && new Date(v.dueDate) < new Date() && v.status !== "Postado").length;
                // Most advanced pending video
                const nextUp = chVideos.filter(v => v.status !== "Postado").sort((a, b) => STATUSES.indexOf(b.status) - STATUSES.indexOf(a.status))[0];

                return (
                  <div key={ch.id} onClick={() => setSelectedChannel(ch.id)}
                    style={{
                      background: "#fff", borderRadius: 20, padding: 22, cursor: "pointer",
                      boxShadow: "0 2px 12px rgba(0,0,0,0.05)", border: `1px solid ${colors.light}40`,
                      borderTop: `4px solid ${colors.accent}`,
                      transition: "all 0.15s", position: "relative",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.05)"; }}
                  >
                    {/* Overdue badge */}
                    {overdue > 0 && (
                      <div style={{ position: "absolute", top: -8, left: 16, background: "#ef4444", color: "#fff", fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 10, zIndex: 2 }}>
                        ⚠️ {overdue} atrasado{overdue > 1 ? "s" : ""}
                      </div>
                    )}

                    {/* Edit button */}
                    <button onClick={e => { e.stopPropagation(); setForm({ ...ch }); setModal("editChannel"); }}
                      style={{ position: "absolute", top: 14, right: 14, background: "#f1f5f9", border: "none", borderRadius: 8, padding: "5px 10px", fontSize: 14, cursor: "pointer", color: "#94a3b8", transition: "all 0.15s", zIndex: 1 }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#e2e8f0"; e.currentTarget.style.color = "#475569"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.color = "#94a3b8"; }}
                    >✎</button>

                    <div style={{ fontSize: 18, fontWeight: 800, color: "#1a1a2e", marginBottom: 8, lineHeight: 1.2, paddingRight: 30 }}>{ch.name}</div>
                    <div style={{ display: "flex", gap: 5, marginBottom: 12, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 10, background: "#f1f5f9", color: "#64748b" }}>{ch.nicho || "—"}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 10, background: ch.responsavel === "Thiago" ? "#dbeafe" : "#ede9fe", color: ch.responsavel === "Thiago" ? "#2563eb" : "#7c3aed" }}>{ch.responsavel}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 10, background: "#fef3c7", color: "#92400e" }}>📅 {ch.frequencia || 5}x/sem</span>
                      {ch.idioma && <span style={{ fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 10, background: "#e0e7ff", color: "#4338ca" }}>🌐 {ch.idioma}</span>}
                    </div>

                    {/* Status pills with labels */}
                    <div style={{ display: "flex", gap: 4, marginBottom: 12, flexWrap: "wrap" }}>
                      {STATUSES.map(s => {
                        const count = chVideos.filter(v => v.status === s).length;
                        if (count === 0) return null;
                        return <span key={s} style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 8, background: STATUS_BG[s], color: STATUS_COLOR[s] }}>{STATUS_EMOJI[s]} {s} ({count})</span>;
                      })}
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 700, color: "#94a3b8" }}>
                      <span>⏳ {pending}</span>
                      <span>✅ {posted}</span>
                    </div>

                    {nextUp && (
                      <div style={{ marginTop: 12, padding: "10px 14px", background: STATUS_BG[nextUp.status], borderRadius: 12, fontSize: 13, fontWeight: 600 }}>
                        <span style={{ color: STATUS_COLOR[nextUp.status] }}>{STATUS_EMOJI[nextUp.status]}</span>
                        <span style={{ color: "#475569", marginLeft: 6 }}>{nextUp.title.length > 35 ? nextUp.title.slice(0, 35) + "..." : nextUp.title}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══ CHANNEL DETAIL PAGE ═══ */}
        {view === "home" && selectedChannel && (() => {
          const ch = data.channels.find(c => c.id === selectedChannel);
          if (!ch) return null;
          const chVideos = data.videos.filter(v => v.channelId === ch.id);
          const colors = CHANNEL_COLORS[ch.colorIndex !== undefined ? ch.colorIndex % CHANNEL_COLORS.length : 0];
          return (
            <ChannelPage
              channel={ch}
              videos={chVideos}
              colorSet={colors}
              onBack={() => setSelectedChannel(null)}
              onAddVideo={addVideo}
              onUpdateVideo={updateVideo}
              onDeleteVideo={deleteVideo}
            />
          );
        })()}

        {/* ═══ IDEAS ═══ */}
        {view === "ideas" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <h2 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>💡 Banco de Ideias</h2>
              <Btn variant="accent" size="sm" onClick={() => { setForm({ name: "", nicho: "", notes: "", referencias: "", dataLimite: "", responsavel: "Adreiza", frequencia: 5 }); setModal("newIdea"); }}>+ Ideia</Btn>
            </div>
            <p style={{ fontSize: 13, color: "#94a3b8", margin: "0 0 16px", fontWeight: 600 }}>Toda segunda, promova uma ideia e crie um canal novo!</p>
            {data.backlog.map(b => {
              const isOverdue = b.dataLimite && new Date(b.dataLimite) < new Date();
              return (
              <div key={b.id} style={{ background: "#fff", borderRadius: 16, padding: 20, marginBottom: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", borderLeft: `4px solid ${isOverdue ? "#ef4444" : "#06b6d4"}`, position: "relative" }}>
                {/* Edit button */}
                <button onClick={() => { setForm({ ...b }); setModal("editIdea"); }}
                  style={{ position: "absolute", top: 14, right: 14, background: "#f1f5f9", border: "none", borderRadius: 8, padding: "5px 10px", fontSize: 14, cursor: "pointer", color: "#94a3b8", transition: "all 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#e2e8f0"; e.currentTarget.style.color = "#475569"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.color = "#94a3b8"; }}
                >✎</button>

                <div style={{ fontSize: 17, fontWeight: 800, paddingRight: 40 }}>{b.name}</div>
                <div style={{ display: "flex", gap: 5, marginTop: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: "#cffafe", color: "#0891b2" }}>{b.nicho || "—"}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: b.responsavel === "Thiago" ? "#dbeafe" : "#ede9fe", color: b.responsavel === "Thiago" ? "#2563eb" : "#7c3aed" }}>{b.responsavel || "Adreiza"}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: "#fef3c7", color: "#92400e" }}>📅 {b.frequencia || 5}x/sem</span>
                  {b.dataLimite && (
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: isOverdue ? "#fee2e2" : "#f0fdf4", color: isOverdue ? "#dc2626" : "#16a34a" }}>
                      {isOverdue ? "⚠️ " : "🎯 "}Criar até {new Date(b.dataLimite + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                    </span>
                  )}
                </div>
                {b.referencias && (
                  <div style={{ marginTop: 10, fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>
                    <span style={{ fontWeight: 700, color: "#94a3b8" }}>🔗 Referências: </span>
                    {b.referencias.split(/[\s,]+/).filter(Boolean).map((url, i) => (
                      <a key={i} href={url.startsWith("http") ? url : `https://${url}`} target="_blank" rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        style={{ color: "#3b82f6", textDecoration: "underline", marginRight: 8, fontSize: 11, wordBreak: "break-all" }}>{url.replace(/https?:\/\/(www\.)?/, "").slice(0, 35)}{url.length > 45 ? "…" : ""}</a>
                    ))}
                  </div>
                )}
                {b.notes && <p style={{ fontSize: 13, color: "#64748b", margin: "8px 0 0", lineHeight: 1.5 }}>{b.notes}</p>}
                <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                  <Btn variant="accent" size="sm" onClick={() => { addChannel({ name: b.name, nicho: b.nicho, responsavel: b.responsavel || "Adreiza", frequencia: b.frequencia || 5 }); deleteBacklog(b.id); }}>🚀 Criar Canal</Btn>
                  <Btn variant="danger" size="sm" onClick={() => deleteBacklog(b.id)}>×</Btn>
                </div>
              </div>
              );
            })}
            {data.backlog.length === 0 && (
              <div style={{ background: "#fff", borderRadius: 16, padding: "40px 20px", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>💡</div>
                <p style={{ color: "#94a3b8", fontSize: 14, fontWeight: 600 }}>Nenhuma ideia ainda. Anote as que surgirem!</p>
              </div>
            )}
          </div>
        )}

        {/* ═══ MURAL DE NOTAS ═══ */}
        {view === "notes" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <h2 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>📌 Mural de Anotações</h2>
              <Btn variant="accent" size="sm" onClick={() => { setForm({ text: "", tag: "Geral", color: "yellow" }); setModal("newNote"); }}>+ Nota</Btn>
            </div>
            <p style={{ fontSize: 13, color: "#94a3b8", margin: "0 0 12px", fontWeight: 600 }}>Anote tudo que vier à cabeça. Filtre por tags pra encontrar rápido.</p>

            {/* Tag filter */}
            {(() => {
              const allNotes = data.notes || [];
              const allTags = [...new Set(allNotes.map(n => n.tag || "Geral"))];
              const filtered = noteFilter === "Todos" ? allNotes : allNotes.filter(n => (n.tag || "Geral") === noteFilter);

              const NOTE_COLORS = {
                yellow: { bg: "#fef9c3", border: "#fde047", shadow: "rgba(253,224,71,0.3)" },
                pink: { bg: "#fce7f3", border: "#f9a8d4", shadow: "rgba(249,168,212,0.3)" },
                blue: { bg: "#dbeafe", border: "#93c5fd", shadow: "rgba(147,197,253,0.3)" },
                green: { bg: "#dcfce7", border: "#86efac", shadow: "rgba(134,239,172,0.3)" },
                purple: { bg: "#ede9fe", border: "#c4b5fd", shadow: "rgba(196,181,253,0.3)" },
                orange: { bg: "#ffedd5", border: "#fdba74", shadow: "rgba(253,186,116,0.3)" },
              };

              return (
                <>
                  {/* Tags bar */}
                  <div style={{ display: "flex", gap: 6, marginBottom: 18, flexWrap: "wrap" }}>
                    {["Todos", ...allTags].filter((t, i, a) => a.indexOf(t) === i).map(tag => (
                      <button key={tag} onClick={() => setNoteFilter(tag)}
                        style={{
                          padding: "6px 14px", borderRadius: 20, border: "none", fontSize: 12, fontWeight: 700,
                          cursor: "pointer", fontFamily: "'Nunito', sans-serif", transition: "all 0.15s",
                          background: noteFilter === tag ? "#1a1a2e" : "#f1f5f9",
                          color: noteFilter === tag ? "#fff" : "#64748b",
                        }}>{tag} {tag !== "Todos" ? `(${allNotes.filter(n => (n.tag || "Geral") === tag).length})` : `(${allNotes.length})`}</button>
                    ))}
                  </div>

                  {/* Notes grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
                    {filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(note => {
                      const c = NOTE_COLORS[note.color] || NOTE_COLORS.yellow;
                      return (
                        <div key={note.id}
                          style={{
                            background: c.bg, borderRadius: 4, padding: 18, minHeight: 140,
                            border: `1px solid ${c.border}`, position: "relative",
                            boxShadow: `3px 3px 8px ${c.shadow}`,
                            transition: "all 0.15s", cursor: "default",
                            fontFamily: "'Nunito', sans-serif",
                          }}
                        >
                          {/* Actions */}
                          <div style={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 4 }}>
                            <button onClick={() => { setForm({ ...note }); setModal("editNote"); }}
                              style={{ background: "rgba(255,255,255,0.6)", border: "none", borderRadius: 6, padding: "3px 7px", fontSize: 12, cursor: "pointer", color: "#64748b" }}>✎</button>
                            <button onClick={() => deleteNote(note.id)}
                              style={{ background: "rgba(255,255,255,0.6)", border: "none", borderRadius: 6, padding: "3px 7px", fontSize: 12, cursor: "pointer", color: "#94a3b8" }}>×</button>
                          </div>

                          {/* Tag */}
                          <span style={{ fontSize: 10, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            {note.tag || "Geral"}
                          </span>

                          {/* Content */}
                          <p style={{ fontSize: 14, color: "#1a1a2e", margin: "8px 0 0", lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-word", paddingRight: 10 }}>
                            {note.text}
                          </p>

                          {/* Date */}
                          <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 12, fontWeight: 600 }}>
                            {new Date(note.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {filtered.length === 0 && (
                    <div style={{ background: "#fff", borderRadius: 16, padding: "40px 20px", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                      <div style={{ fontSize: 40, marginBottom: 8 }}>📌</div>
                      <p style={{ color: "#94a3b8", fontSize: 14, fontWeight: 600 }}>
                        {noteFilter !== "Todos" ? `Nenhuma nota com a tag "${noteFilter}"` : "Nenhuma anotação ainda. Clique em + Nota!"}
                      </p>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}

        {/* ═══ SETTINGS ═══ */}
        {view === "settings" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <h2 style={{ fontSize: 22, fontWeight: 900, margin: "0 0 20px" }}>⚙️ Configurações</h2>
            <div style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", marginBottom: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Exportar Dados</div>
              <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 12px" }}>Baixe um backup de todos os seus dados.</p>
              <Btn variant="ghost" size="sm" onClick={() => {
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "yt-hub-backup.json"; a.click();
              }}>📥 Exportar JSON</Btn>
            </div>
            <div style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", marginBottom: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Importar Dados</div>
              <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 12px" }}>Restaure de um backup.</p>
              <Btn variant="ghost" size="sm" onClick={() => {
                const input = document.createElement("input"); input.type = "file"; input.accept = ".json";
                input.onchange = async (e) => {
                  const file = e.target.files[0]; if (!file) return;
                  const text = await file.text();
                  try { const d = JSON.parse(text); save(d); alert("Dados importados!"); } catch { alert("Arquivo inválido."); }
                };
                input.click();
              }}>📤 Importar JSON</Btn>
            </div>
            <div style={{ background: "#fee2e2", borderRadius: 16, padding: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#dc2626", marginBottom: 4 }}>Resetar Tudo</div>
              <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 12px" }}>Apaga todos os dados e volta pro zero.</p>
              <Btn variant="danger" size="sm" onClick={() => { if (confirm("Tem certeza? Isso apaga TUDO.")) { save(EMPTY); setView("home"); setSelectedChannel(null); } }}>🗑 Resetar</Btn>
            </div>
          </div>
        )}
      </div>

      {/* ═══ BOTTOM NAV ═══ */}
      <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "center", padding: "8px 0 12px", zIndex: 100 }}>
        <div style={{ display: "flex", gap: 0, width: "100%" }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => { setView(n.id); setSelectedChannel(null); }}
              style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, background: "none", border: "none", cursor: "pointer", padding: "6px 0", color: view === n.id ? "#ff6b35" : "#94a3b8", fontFamily: "'Nunito', sans-serif", position: "relative" }}>
              <span style={{ fontSize: 20 }}>{n.icon}</span>
              <span style={{ fontSize: 10, fontWeight: 800 }}>{n.label}</span>
              {n.id === "home" && totalOverdue > 0 && (
                <span style={{ position: "absolute", top: 0, right: "30%", background: "#ef4444", color: "#fff", fontSize: 9, fontWeight: 800, padding: "1px 5px", borderRadius: 10, minWidth: 14, textAlign: "center" }}>{totalOverdue}</span>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* ═══ GLOBAL MODALS ═══ */}
      <Modal open={modal === "newChannel" || modal === "editChannel"} onClose={() => setModal(null)} title={modal === "editChannel" ? "Editar Canal" : "Novo Canal"}>
        <Input label="Nome" value={form.name || ""} onChange={v => setForm({ ...form, name: v })} placeholder="Ex: Fatos Incríveis" />
        <Input label="Nicho" value={form.nicho || ""} onChange={v => setForm({ ...form, nicho: v })} placeholder="Ex: Curiosidades" />
        <Input label="Idioma" value={form.idioma || ""} onChange={v => setForm({ ...form, idioma: v })} placeholder="Ex: Português, Inglês, Francês..." />
        <Select label="Quem faz os vídeos?" value={form.responsavel || "Adreiza"} onChange={v => setForm({ ...form, responsavel: v })}
          options={[{ value: "Adreiza", label: "Adreiza" }, { value: "Thiago", label: "Thiago" }]} />
        <Input label="Frequência (vídeos/semana)" type="number" value={form.frequencia || 5} onChange={v => setForm({ ...form, frequencia: parseInt(v) || 1 })} placeholder="5" />
        <Btn variant="accent" full onClick={() => {
          if (!form.name?.trim()) return alert("Digite um nome!");
          if (modal === "editChannel") updateChannel(form.id, { name: form.name, nicho: form.nicho, idioma: form.idioma, responsavel: form.responsavel, frequencia: form.frequencia });
          else addChannel(form);
          setModal(null);
        }} style={{ marginTop: 4 }}>{modal === "editChannel" ? "Salvar" : "Criar Canal"}</Btn>
        {modal === "editChannel" && (
          <Btn variant="danger" full onClick={() => { if (confirm("Deletar " + form.name + " e todos os vídeos?")) { deleteChannel(form.id); setModal(null); } }} style={{ marginTop: 8 }}>Deletar Canal</Btn>
        )}
      </Modal>

      <Modal open={modal === "newIdea" || modal === "editIdea"} onClose={() => setModal(null)} title={modal === "editIdea" ? "Editar Ideia" : "Nova Ideia de Canal"}>
        <Input label="Nome do Canal" value={form.name || ""} onChange={v => setForm({ ...form, name: v })} placeholder="Ex: Top 10 Mistérios" />
        <Input label="Nicho" value={form.nicho || ""} onChange={v => setForm({ ...form, nicho: v })} placeholder="Ex: Mistério" />
        <Input label="Canais Referência (URLs)" value={form.referencias || ""} onChange={v => setForm({ ...form, referencias: v })} placeholder="https://youtube.com/@canal1, https://youtube.com/@canal2" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Input label="Data Limite p/ Criação" type="date" value={form.dataLimite || ""} onChange={v => setForm({ ...form, dataLimite: v })} />
          <Select label="Responsável" value={form.responsavel || "Adreiza"} onChange={v => setForm({ ...form, responsavel: v })}
            options={[{ value: "Adreiza", label: "Adreiza" }, { value: "Thiago", label: "Thiago" }]} />
        </div>
        <Input label="Frequência (vídeos/semana)" type="number" value={form.frequencia || 5} onChange={v => setForm({ ...form, frequencia: parseInt(v) || 1 })} placeholder="5" />
        <Input label="Notas" value={form.notes || ""} onChange={v => setForm({ ...form, notes: v })} placeholder="Ideias de vídeos, estratégia..." />
        <Btn variant="accent" full onClick={() => {
          if (!form.name?.trim()) return alert("Digite um nome!");
          if (modal === "editIdea") updateBacklog(form.id, form);
          else addBacklog(form);
          setModal(null);
        }} style={{ marginTop: 4 }}>{modal === "editIdea" ? "Salvar" : "Salvar Ideia"}</Btn>
        {modal === "editIdea" && (
          <Btn variant="danger" full onClick={() => { deleteBacklog(form.id); setModal(null); }} style={{ marginTop: 8 }}>Deletar Ideia</Btn>
        )}
      </Modal>

      {/* Note Modal */}
      <Modal open={modal === "newNote" || modal === "editNote"} onClose={() => setModal(null)} title={modal === "editNote" ? "Editar Nota" : "Nova Nota"}>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 5, fontFamily: "'Nunito', sans-serif", textTransform: "uppercase", letterSpacing: "0.04em" }}>Anotação</label>
          <textarea value={form.text || ""} onChange={e => setForm({ ...form, text: e.target.value })} placeholder="O que veio à cabeça..."
            rows={4}
            style={{ width: "100%", padding: "11px 14px", background: "#f8fafc", border: "2px solid #e2e8f0", borderRadius: 12, fontSize: 14, fontFamily: "'Nunito', sans-serif", outline: "none", boxSizing: "border-box", color: "#1a1a2e", resize: "vertical", transition: "border-color 0.2s" }}
            onFocus={e => e.target.style.borderColor = "#ff6b35"} onBlur={e => e.target.style.borderColor = "#e2e8f0"}
          />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Input label="Tag / Categoria" value={form.tag || "Geral"} onChange={v => setForm({ ...form, tag: v })} placeholder="Ex: Urgente, Ideia, Compras..." />
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 5, fontFamily: "'Nunito', sans-serif", textTransform: "uppercase", letterSpacing: "0.04em" }}>Cor</label>
            <div style={{ display: "flex", gap: 6, paddingTop: 4 }}>
              {[
                { id: "yellow", color: "#fde047" },
                { id: "pink", color: "#f9a8d4" },
                { id: "blue", color: "#93c5fd" },
                { id: "green", color: "#86efac" },
                { id: "purple", color: "#c4b5fd" },
                { id: "orange", color: "#fdba74" },
              ].map(c => (
                <button key={c.id} onClick={() => setForm({ ...form, color: c.id })}
                  style={{
                    width: 30, height: 30, borderRadius: 8, border: form.color === c.id ? "3px solid #1a1a2e" : "2px solid #e2e8f0",
                    background: c.color, cursor: "pointer", transition: "all 0.15s",
                    transform: form.color === c.id ? "scale(1.15)" : "scale(1)",
                  }} />
              ))}
            </div>
          </div>
        </div>
        <Btn variant="accent" full onClick={() => {
          if (!form.text?.trim()) return alert("Escreva algo!");
          if (modal === "editNote") updateNote(form.id, form);
          else addNote(form);
          setModal(null);
        }} style={{ marginTop: 4 }}>{modal === "editNote" ? "Salvar" : "Criar Nota"}</Btn>
        {modal === "editNote" && (
          <Btn variant="danger" full onClick={() => { deleteNote(form.id); setModal(null); }} style={{ marginTop: 8 }}>Deletar Nota</Btn>
        )}
      </Modal>
    </div>
  );
}
