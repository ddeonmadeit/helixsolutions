import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Send, Loader2, Mail, Inbox, Eye, RefreshCw,
  ChevronDown, ChevronRight, FolderOpen, Save, Trash2, Check,
  GripVertical, Plus, Type, Image as ImageIcon, MousePointerClick,
  Heading1, Minus, ArrowUp, ArrowDown, X, Upload, Users,
} from "lucide-react";

const LOGO_URL =
  "https://eiqmwhiidovkcihwbmvq.supabase.co/storage/v1/object/public/email-assets/helix-logo.png";

interface EmailRow {
  id: string;
  direction: "sent" | "received";
  from_email: string;
  to_email: string;
  subject: string | null;
  html: string | null;
  status: string | null;
  created_at: string;
}

const FONT_OPTIONS = [
  { label: "Helvetica (default)", value: "'Helvetica Neue', Helvetica, Arial, sans-serif" },
  { label: "Inter", value: "Inter, system-ui, sans-serif" },
  { label: "Georgia (serif)", value: "Georgia, 'Times New Roman', serif" },
  { label: "Courier (mono)", value: "'Courier New', Courier, monospace" },
  { label: "System UI", value: "system-ui, -apple-system, sans-serif" },
];

// ---------- Block model ----------
type Align = "left" | "center" | "right";
type Block =
  | { id: string; type: "heading"; text: string; size: 1 | 2 | 3; align: Align; color?: string }
  | { id: string; type: "text"; html: string; align: Align }
  | { id: string; type: "image"; src: string; width: number; align: Align; href?: string; alt?: string }
  | {
      id: string; type: "button"; label: string; href: string; align: Align;
      bg: string; color: string; radius: number; padX: number; padY: number; fullWidth: boolean;
    }
  | { id: string; type: "divider"; color: string; thickness: number }
  | { id: string; type: "spacer"; height: number };

const uid = () => Math.random().toString(36).slice(2, 10);

const defaultBlocks = (accent: string): Block[] => [
  { id: uid(), type: "heading", text: "Hi there,", size: 2, align: "left" },
  { id: uid(), type: "text", html: "Write your message here. Drag blocks on the left to reorder. Add images, buttons, dividers from the toolbar.", align: "left" },
  { id: uid(), type: "button", label: "Get Started", href: "https://helixsolution.au", align: "left", bg: accent, color: "#0b0f1a", radius: 10, padX: 24, padY: 14, fullWidth: false },
];

function escapeHtml(s: string) {
  return (s || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

function renderBlockToHtml(b: Block, textColor: string): string {
  if (b.type === "heading") {
    const sizes = { 1: 28, 2: 22, 3: 18 } as const;
    return `<tr><td align="${b.align}" style="padding:0 0 16px;color:${b.color || textColor};font-size:${sizes[b.size]}px;font-weight:700;line-height:1.3;">${escapeHtml(b.text)}</td></tr>`;
  }
  if (b.type === "text") {
    return `<tr><td align="${b.align}" style="padding:0 0 16px;color:${textColor};font-size:15px;line-height:1.7;"><div style="text-align:${b.align};">${b.html}</div></td></tr>`;
  }
  if (b.type === "image") {
    const img = `<img src="${b.src}" alt="${escapeHtml(b.alt || "")}" width="${b.width}" style="display:block;border:0;max-width:100%;height:auto;border-radius:8px;"/>`;
    const wrapped = b.href ? `<a href="${b.href}" style="text-decoration:none;">${img}</a>` : img;
    return `<tr><td align="${b.align}" style="padding:0 0 16px;">${wrapped}</td></tr>`;
  }
  if (b.type === "button") {
    const btn = `<a href="${b.href}" style="display:${b.fullWidth ? "block" : "inline-block"};background-color:${b.bg};color:${b.color};text-decoration:none;font-weight:600;font-size:15px;padding:${b.padY}px ${b.padX}px;border-radius:${b.radius}px;${b.fullWidth ? "text-align:center;" : ""}">${escapeHtml(b.label)}</a>`;
    return `<tr><td align="${b.align}" style="padding:8px 0 20px;">${btn}</td></tr>`;
  }
  if (b.type === "divider") {
    return `<tr><td style="padding:12px 0;"><div style="height:${b.thickness}px;background-color:${b.color};line-height:${b.thickness}px;font-size:0;">&nbsp;</div></td></tr>`;
  }
  if (b.type === "spacer") {
    return `<tr><td style="height:${b.height}px;line-height:${b.height}px;font-size:0;">&nbsp;</td></tr>`;
  }
  return "";
}

const Mailpage = () => {
  const { toast } = useToast();
  const authed = true;

  // Composer
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");

  // Style controls
  const [fontFamily, setFontFamily] = useState(FONT_OPTIONS[0].value);
  const [textColor, setTextColor] = useState("#e8edf2");
  const [bgColor, setBgColor] = useState("#0b0f1a");
  const [cardColor, setCardColor] = useState("#111827");
  const [accentColor, setAccentColor] = useState("#22d3ee");
  const [showLogo, setShowLogo] = useState(true);
  const [showFooter, setShowFooter] = useState(true);

  // Blocks
  const [blocks, setBlocks] = useState<Block[]>(() => defaultBlocks("#22d3ee"));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const [sending, setSending] = useState(false);

  // Bulk CSV
  const [csvRows, setCsvRows] = useState<Record<string, string>[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvFileName, setCsvFileName] = useState<string>("");
  const [emailColumn, setEmailColumn] = useState<string>("");
  const [bulkSending, setBulkSending] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<{ done: number; total: number; ok: number; failed: number }>({ done: 0, total: 0, ok: 0, failed: 0 });

  const [tab, setTab] = useState<"compose" | "sent" | "received">("compose");
  const [emails, setEmails] = useState<EmailRow[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [viewing, setViewing] = useState<EmailRow | null>(null);

  // Templates
  interface Template {
    id: string; name: string; subject: string | null; body_html: string;
    font_family: string | null; text_color: string | null; bg_color: string | null;
    card_color: string | null; accent_color: string | null;
    show_logo: boolean | null; show_footer: boolean | null;
  }
  const [templates, setTemplates] = useState<Template[]>([]);
  const [openTemplateId, setOpenTemplateId] = useState<string | null>(null);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [savingTemplate, setSavingTemplate] = useState(false);

  // ---- Build inner body HTML from blocks (table rows for max email-client compatibility) ----
  const bodyHtml = useMemo(() => {
    const rows = blocks.map((b) => renderBlockToHtml(b, textColor)).join("");
    return `<table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation"><tbody>${rows}</tbody></table>`;
  }, [blocks, textColor]);

  // ---- Email rendering (mirrors edge function output exactly) ----
  const renderedHtml = useMemo(() => {
    const muted = "#8a9bb0";
    return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background-color:${bgColor};font-family:${fontFamily};">
<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${bgColor}">
  <tr><td align="center" style="padding:40px 16px;">
    <table width="100%" style="max-width:600px;" cellpadding="0" cellspacing="0" border="0">
      ${showLogo ? `<tr><td align="center" style="padding-bottom:24px;">
        <img src="${LOGO_URL}" alt="Helix Solutions" width="64" height="64" style="display:block;border:0;border-radius:14px;"/>
      </td></tr>` : ""}
      <tr><td style="background-color:${cardColor};border-radius:20px;border:1px solid #1e2a3a;padding:40px;color:${textColor};font-size:15px;line-height:1.7;">
        ${bodyHtml}
        <p style="margin:32px 0 0;font-size:14px;color:${muted};line-height:1.7;">
          Kind Regards,<br/><span style="color:${textColor};font-weight:600;">Helix Team</span>
        </p>
      </td></tr>
      ${showFooter ? `<tr><td align="center" style="padding-top:24px;">
        <p style="margin:0;font-size:11px;color:#3d4d5c;">© 2025 Helix Solutions · <a href="https://helixsolution.au" style="color:${accentColor};text-decoration:none;">helixsolution.au</a></p>
      </td></tr>` : ""}
    </table>
  </td></tr>
</table></body></html>`;
  }, [bodyHtml, fontFamily, textColor, bgColor, cardColor, accentColor, showLogo, showFooter]);

  // ---- Block helpers ----
  const updateBlock = (id: string, patch: Partial<Block>) =>
    setBlocks((bs) => bs.map((b) => (b.id === id ? ({ ...b, ...patch } as Block) : b)));
  const removeBlock = (id: string) =>
    setBlocks((bs) => bs.filter((b) => b.id !== id));
  const moveBlock = (id: string, dir: -1 | 1) =>
    setBlocks((bs) => {
      const i = bs.findIndex((b) => b.id === id);
      if (i < 0) return bs;
      const j = i + dir;
      if (j < 0 || j >= bs.length) return bs;
      const next = [...bs];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  const addBlock = (type: Block["type"]) => {
    const base: any = { id: uid(), align: "left" };
    let nb: Block;
    if (type === "heading") nb = { ...base, type, text: "New heading", size: 2 };
    else if (type === "text") nb = { ...base, type, html: "New paragraph text." };
    else if (type === "image") nb = { ...base, type, src: "https://placehold.co/600x300/111827/22d3ee?text=Image", width: 560, alt: "" };
    else if (type === "button") nb = { ...base, type, label: "Click here", href: "https://", bg: accentColor, color: "#0b0f1a", radius: 10, padX: 24, padY: 14, fullWidth: false };
    else if (type === "divider") nb = { id: uid(), type, color: "#1e2a3a", thickness: 1 } as Block;
    else nb = { id: uid(), type: "spacer", height: 24 } as Block;
    setBlocks((bs) => [...bs, nb]);
    setSelectedId(nb.id);
  };

  // Drag-reorder
  const onDragStart = (id: string) => setDragId(id);
  const onDragOverBlock = (id: string, e: React.DragEvent) => {
    e.preventDefault();
    if (id !== dragOverId) setDragOverId(id);
  };
  const onDrop = (id: string) => {
    if (!dragId || dragId === id) { setDragId(null); setDragOverId(null); return; }
    setBlocks((bs) => {
      const from = bs.findIndex((b) => b.id === dragId);
      const to = bs.findIndex((b) => b.id === id);
      if (from < 0 || to < 0) return bs;
      const next = [...bs];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
    setDragId(null); setDragOverId(null);
  };

  // ---- Send ----
  const handleSend = async () => {
    if (!to.includes("@") || !subject.trim()) {
      toast({ title: "Missing fields", description: "Recipient and subject are required.", variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      const { error } = await supabase.functions.invoke("send-custom-email", {
        body: {
          to: to.trim(), subject: subject.trim(), bodyHtml,
          fontFamily, textColor, bgColor, cardColor, accentColor,
          showLogo, showFooter,
        },
      });
      if (error) throw error;
      toast({ title: "Email sent", description: `Delivered to ${to}` });
      loadEmails();
    } catch (e: any) {
      toast({ title: "Send failed", description: e.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  // ---- CSV parsing (handles quoted fields, commas, newlines, escaped quotes) ----
  const parseCsv = (text: string): { headers: string[]; rows: Record<string, string>[] } => {
    const out: string[][] = [];
    let row: string[] = [];
    let cur = "";
    let inQ = false;
    const t = text.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
    for (let i = 0; i < t.length; i++) {
      const c = t[i];
      if (inQ) {
        if (c === '"') {
          if (t[i + 1] === '"') { cur += '"'; i++; } else { inQ = false; }
        } else cur += c;
      } else {
        if (c === '"') inQ = true;
        else if (c === ",") { row.push(cur); cur = ""; }
        else if (c === "\n") { row.push(cur); out.push(row); row = []; cur = ""; }
        else cur += c;
      }
    }
    if (cur.length || row.length) { row.push(cur); out.push(row); }
    const cleaned = out.filter((r) => r.some((v) => v.trim() !== ""));
    if (!cleaned.length) return { headers: [], rows: [] };
    const headers = cleaned[0].map((h) => h.trim());
    const rows = cleaned.slice(1).map((r) => {
      const obj: Record<string, string> = {};
      headers.forEach((h, idx) => { obj[h] = (r[idx] ?? "").trim(); });
      return obj;
    });
    return { headers, rows };
  };

  const onCsvFile = async (file: File) => {
    const text = await file.text();
    const { headers, rows } = parseCsv(text);
    if (!headers.length || !rows.length) {
      toast({ title: "Empty CSV", description: "Could not find any rows.", variant: "destructive" });
      return;
    }
    setCsvFileName(file.name);
    setCsvHeaders(headers);
    setCsvRows(rows);
    // Auto-pick email column
    const guess = headers.find((h) => /e[-_ ]?mail/i.test(h)) || headers[0];
    setEmailColumn(guess);
    toast({ title: "CSV loaded", description: `${rows.length} rows · ${headers.length} columns` });
  };

  const fillTemplate = (tpl: string, row: Record<string, string>) =>
    tpl.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (_, k) => row[k] ?? "");

  const handleBulkSend = async () => {
    if (!csvRows.length) { toast({ title: "No CSV", description: "Upload a CSV file first.", variant: "destructive" }); return; }
    if (!emailColumn) { toast({ title: "Pick column", description: "Choose which column contains the email address.", variant: "destructive" }); return; }
    if (!subject.trim()) { toast({ title: "Subject required", variant: "destructive" }); return; }

    const targets = csvRows
      .map((r) => ({ row: r, email: (r[emailColumn] || "").trim().toLowerCase() }))
      .filter((t) => t.email.includes("@"));
    if (!targets.length) { toast({ title: "No valid emails", variant: "destructive" }); return; }

    setBulkSending(true);
    setBulkProgress({ done: 0, total: targets.length, ok: 0, failed: 0 });

    let ok = 0, failed = 0;
    for (let i = 0; i < targets.length; i++) {
      const { row, email } = targets[i];
      try {
        const personalisedSubject = fillTemplate(subject, row);
        const personalisedBody = fillTemplate(bodyHtml, row);
        const { error } = await supabase.functions.invoke("send-custom-email", {
          body: {
            to: email, subject: personalisedSubject, bodyHtml: personalisedBody,
            fontFamily, textColor, bgColor, cardColor, accentColor,
            showLogo, showFooter,
          },
        });
        if (error) throw error;
        ok++;
      } catch {
        failed++;
      }
      setBulkProgress({ done: i + 1, total: targets.length, ok, failed });
      // Small delay to avoid rate limits
      await new Promise((r) => setTimeout(r, 250));
    }

    setBulkSending(false);
    toast({ title: "Bulk send complete", description: `${ok} sent · ${failed} failed` });
    loadEmails();
  };

  const loadEmails = async () => {
    setLoadingList(true);
    try {
      const { data, error } = await supabase.functions.invoke("list-emails");
      if (error) throw error;
      setEmails(data?.emails ?? []);
    } catch (e: any) {
      toast({ title: "Failed to load", description: e.message, variant: "destructive" });
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => { loadEmails(); loadTemplates(); }, []);

  const loadTemplates = async () => {
    const { data, error } = await supabase.functions.invoke("manage-email-templates", { body: { action: "list" } });
    if (!error) setTemplates(data?.templates ?? []);
  };

  const saveTemplate = async () => {
    if (!newTemplateName.trim()) {
      toast({ title: "Name required", description: "Give the template a name first.", variant: "destructive" });
      return;
    }
    setSavingTemplate(true);
    try {
      // Persist block layout inside body_html as a comment so we can rehydrate on apply
      const wrappedHtml = `<!--BLOCKS:${btoa(unescape(encodeURIComponent(JSON.stringify(blocks))))}-->\n${bodyHtml}`;
      const { error } = await supabase.functions.invoke("manage-email-templates", {
        body: {
          action: "save",
          template: {
            name: newTemplateName.trim(),
            subject, body_html: wrappedHtml,
            font_family: fontFamily, text_color: textColor, bg_color: bgColor,
            card_color: cardColor, accent_color: accentColor,
            show_logo: showLogo, show_footer: showFooter,
          },
        },
      });
      if (error) throw error;
      toast({ title: "Template saved", description: newTemplateName });
      setNewTemplateName("");
      loadTemplates();
    } catch (e: any) {
      toast({ title: "Save failed", description: e.message, variant: "destructive" });
    } finally {
      setSavingTemplate(false);
    }
  };

  const applyTemplate = (t: Template) => {
    setSubject(t.subject ?? "");
    // Try to recover blocks from the comment marker
    const m = t.body_html.match(/<!--BLOCKS:([^-]+)-->/);
    if (m) {
      try {
        const parsed = JSON.parse(decodeURIComponent(escape(atob(m[1])))) as Block[];
        setBlocks(parsed);
      } catch {
        setBlocks([{ id: uid(), type: "text", html: t.body_html, align: "left" }]);
      }
    } else {
      setBlocks([{ id: uid(), type: "text", html: t.body_html, align: "left" }]);
    }
    if (t.font_family) setFontFamily(t.font_family);
    if (t.text_color) setTextColor(t.text_color);
    if (t.bg_color) setBgColor(t.bg_color);
    if (t.card_color) setCardColor(t.card_color);
    if (t.accent_color) setAccentColor(t.accent_color);
    if (t.show_logo !== null) setShowLogo(!!t.show_logo);
    if (t.show_footer !== null) setShowFooter(!!t.show_footer);
    setTab("compose");
    toast({ title: "Template applied", description: t.name });
  };

  const deleteTemplate = async (id: string) => {
    const { error } = await supabase.functions.invoke("manage-email-templates", { body: { action: "delete", id } });
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    } else {
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const list = emails.filter((e) => tab === "sent" ? e.direction === "sent" : tab === "received" ? e.direction === "received" : true);
  const selected = blocks.find((b) => b.id === selectedId) || null;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Mail Studio</h1>
            <p className="text-muted-foreground text-sm mt-1">Drag blocks to reorder. Click a block to edit it.</p>
          </div>
          <div className="flex gap-2">
            {(["compose","sent","received"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium uppercase tracking-wider transition-colors ${tab===t ? "bg-primary text-primary-foreground" : "glass text-foreground hover:border-primary/30"}`}>
                {t === "compose" ? <Mail className="h-3.5 w-3.5"/> : t === "sent" ? <Send className="h-3.5 w-3.5"/> : <Inbox className="h-3.5 w-3.5"/>}
                {t}
              </button>
            ))}
          </div>
        </div>

        {tab === "compose" && (
          <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
            {/* Composer */}
            <div className="space-y-4">
              <div className="glass rounded-2xl p-6 space-y-4">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">To</Label>
                    <Input value={to} onChange={(e)=>setTo(e.target.value)} placeholder="recipient@example.com" className="bg-background/40 mt-1"/>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Subject</Label>
                    <Input value={subject} onChange={(e)=>setSubject(e.target.value)} placeholder="Subject line" className="bg-background/40 mt-1"/>
                  </div>
                </div>

                {/* Add block toolbar */}
                <div className="flex flex-wrap items-center gap-2 rounded-xl bg-background/40 border border-border/50 p-2">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground px-1">Add block:</span>
                  {[
                    { t: "heading", icon: Heading1, label: "Heading" },
                    { t: "text", icon: Type, label: "Text" },
                    { t: "image", icon: ImageIcon, label: "Image" },
                    { t: "button", icon: MousePointerClick, label: "Button" },
                    { t: "divider", icon: Minus, label: "Divider" },
                    { t: "spacer", icon: Plus, label: "Spacer" },
                  ].map(({ t, icon: Icon, label }) => (
                    <button key={t} onClick={() => addBlock(t as Block["type"])}
                      className="flex items-center gap-1.5 rounded-md bg-primary/10 hover:bg-primary/20 text-foreground px-2.5 py-1.5 text-xs font-medium">
                      <Icon className="h-3.5 w-3.5"/> {label}
                    </button>
                  ))}
                </div>

                {/* Block list */}
                <div className="space-y-2">
                  {blocks.map((b) => {
                    const isSel = selectedId === b.id;
                    const isOver = dragOverId === b.id;
                    return (
                      <div
                        key={b.id}
                        draggable
                        onDragStart={() => onDragStart(b.id)}
                        onDragOver={(e) => onDragOverBlock(b.id, e)}
                        onDrop={() => onDrop(b.id)}
                        onDragEnd={() => { setDragId(null); setDragOverId(null); }}
                        onClick={() => setSelectedId(b.id)}
                        className={`group rounded-xl border p-3 bg-background/40 cursor-move transition-all ${
                          isSel ? "border-primary/60 ring-1 ring-primary/40" : "border-border/50 hover:border-primary/30"
                        } ${isOver && dragId !== b.id ? "border-t-4 border-t-primary" : ""}`}
                      >
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground shrink-0"/>
                          <span className="text-[10px] uppercase tracking-wider text-primary font-semibold">{b.type}</span>
                          <span className="flex-1 truncate text-xs text-muted-foreground">
                            {b.type === "heading" ? b.text :
                             b.type === "text" ? b.html.replace(/<[^>]+>/g, "").slice(0, 60) :
                             b.type === "button" ? `${b.label} → ${b.href}` :
                             b.type === "image" ? b.src.slice(0, 60) :
                             b.type === "divider" ? `${b.thickness}px ${b.color}` :
                             `${b.height}px gap`}
                          </span>
                          <button onClick={(e)=>{e.stopPropagation();moveBlock(b.id,-1);}} className="p-1 text-muted-foreground hover:text-foreground"><ArrowUp className="h-3.5 w-3.5"/></button>
                          <button onClick={(e)=>{e.stopPropagation();moveBlock(b.id,1);}} className="p-1 text-muted-foreground hover:text-foreground"><ArrowDown className="h-3.5 w-3.5"/></button>
                          <button onClick={(e)=>{e.stopPropagation();removeBlock(b.id);}} className="p-1 text-muted-foreground hover:text-destructive"><X className="h-3.5 w-3.5"/></button>
                        </div>
                      </div>
                    );
                  })}
                  {blocks.length === 0 && (
                    <p className="text-center text-xs text-muted-foreground py-6">No blocks. Add one above.</p>
                  )}
                </div>

                {/* Selected block editor */}
                {selected && (
                  <div className="rounded-xl bg-background/40 border border-primary/30 p-4 space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary">Editing: {selected.type}</p>
                    <BlockEditor block={selected} onChange={(patch) => updateBlock(selected.id, patch)} />
                  </div>
                )}

                {/* Style controls */}
                <div className="space-y-3 rounded-xl bg-background/40 border border-border/50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email styling</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Font</Label>
                      <Select value={fontFamily} onValueChange={setFontFamily}>
                        <SelectTrigger className="bg-background/40 mt-1"><SelectValue/></SelectTrigger>
                        <SelectContent>
                          {FONT_OPTIONS.map((f) => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <ColorField label="Text color" value={textColor} onChange={setTextColor}/>
                    <ColorField label="Background" value={bgColor} onChange={setBgColor}/>
                    <ColorField label="Card color" value={cardColor} onChange={setCardColor}/>
                    <ColorField label="Accent / link" value={accentColor} onChange={setAccentColor}/>
                    <div className="flex flex-col gap-2 pt-1">
                      <label className="flex items-center gap-2 text-xs text-foreground">
                        <input type="checkbox" checked={showLogo} onChange={(e)=>setShowLogo(e.target.checked)}/> Show logo
                      </label>
                      <label className="flex items-center gap-2 text-xs text-foreground">
                        <input type="checkbox" checked={showFooter} onChange={(e)=>setShowFooter(e.target.checked)}/> Show footer
                      </label>
                    </div>
                  </div>
                </div>

                {/* Bulk CSV send */}
                <div className="space-y-3 rounded-xl bg-background/40 border border-border/50 p-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary"/>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Bulk send via CSV</p>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Upload a CSV with a header row. Use <code className="text-primary">{"{{column_name}}"}</code> in your subject or text blocks to personalise per recipient (e.g. <code className="text-primary">{"Hi {{name}}"}</code>).
                  </p>

                  <div className="flex flex-wrap items-center gap-2">
                    <label className="flex items-center gap-1.5 rounded-md bg-primary/10 hover:bg-primary/20 text-foreground px-3 py-1.5 text-xs font-medium cursor-pointer">
                      <Upload className="h-3.5 w-3.5"/> {csvFileName ? "Change CSV" : "Upload CSV"}
                      <input
                        type="file"
                        accept=".csv,text/csv"
                        className="hidden"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) onCsvFile(f); e.currentTarget.value = ""; }}
                      />
                    </label>
                    {csvFileName && (
                      <>
                        <span className="text-[11px] text-muted-foreground truncate max-w-[180px]">{csvFileName}</span>
                        <span className="text-[11px] text-primary font-medium">{csvRows.length} rows</span>
                        <button
                          type="button"
                          onClick={() => { setCsvRows([]); setCsvHeaders([]); setCsvFileName(""); setEmailColumn(""); }}
                          className="text-[11px] text-muted-foreground hover:text-destructive underline">
                          Clear
                        </button>
                      </>
                    )}
                  </div>

                  {csvHeaders.length > 0 && (
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">Email column</Label>
                        <Select value={emailColumn} onValueChange={setEmailColumn}>
                          <SelectTrigger className="bg-background/40 mt-1"><SelectValue placeholder="Choose column"/></SelectTrigger>
                          <SelectContent>
                            {csvHeaders.map((h) => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Available placeholders</Label>
                        <div className="mt-1 flex flex-wrap gap-1 rounded-md bg-background/40 border border-border/50 p-2 max-h-20 overflow-y-auto">
                          {csvHeaders.map((h) => (
                            <button
                              key={h}
                              type="button"
                              onClick={() => navigator.clipboard.writeText(`{{${h}}}`).then(() => toast({ title: "Copied", description: `{{${h}}}` }))}
                              className="text-[10px] bg-primary/10 hover:bg-primary/20 text-primary rounded px-1.5 py-0.5 font-mono">
                              {`{{${h}}}`}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {bulkSending && (
                    <div className="space-y-1">
                      <div className="h-2 w-full bg-background/60 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${bulkProgress.total ? (bulkProgress.done / bulkProgress.total) * 100 : 0}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Sending {bulkProgress.done}/{bulkProgress.total} · {bulkProgress.ok} sent · {bulkProgress.failed} failed
                      </p>
                    </div>
                  )}

                  <button
                    onClick={handleBulkSend}
                    disabled={bulkSending || !csvRows.length}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary/15 hover:bg-primary/25 border border-primary/30 px-5 py-2.5 text-sm font-semibold text-foreground disabled:opacity-50">
                    {bulkSending ? <Loader2 className="h-4 w-4 animate-spin"/> : <Users className="h-4 w-4"/>}
                    {bulkSending ? `Sending… (${bulkProgress.done}/${bulkProgress.total})` : `Bulk send to ${csvRows.length || 0} recipients`}
                  </button>
                </div>

                <button onClick={handleSend} disabled={sending}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:brightness-110 disabled:opacity-50">
                  {sending ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4"/>}
                  {sending ? "Sending…" : "Send Single Email"}
                </button>
              </div>
            </div>

            {/* Live Preview */}
            <div className="glass rounded-2xl p-4 space-y-2 lg:sticky lg:top-4 lg:self-start">
              <div className="flex items-center gap-2 text-xs text-muted-foreground px-2">
                <Eye className="h-3.5 w-3.5"/> Recipient preview (pixel-accurate)
              </div>
              <iframe
                title="Email preview"
                srcDoc={renderedHtml}
                className="w-full h-[800px] rounded-xl bg-white border border-border/50"
              />
            </div>
          </div>
        )}

        {tab !== "compose" && (
          <div className="glass rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
              <h2 className="text-lg font-semibold text-foreground capitalize flex items-center gap-2">
                {tab === "sent" ? <Send className="h-4 w-4 text-primary"/> : <Inbox className="h-4 w-4 text-primary"/>} {tab} emails
              </h2>
              <button onClick={loadEmails} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                <RefreshCw className={`h-3.5 w-3.5 ${loadingList ? "animate-spin" : ""}`}/> Refresh
              </button>
            </div>
            {loadingList ? (
              <div className="py-12 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary"/></div>
            ) : list.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground text-sm">No {tab} emails yet.</div>
            ) : (
              <div className="divide-y divide-border/40">
                {list.map((e) => (
                  <button key={e.id} onClick={()=>setViewing(e)}
                    className="w-full text-left px-6 py-4 hover:bg-primary/5 transition-colors flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{e.subject || "(no subject)"}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {e.direction === "sent" ? `To: ${e.to_email}` : `From: ${e.from_email}`}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-muted-foreground">{new Date(e.created_at).toLocaleString()}</p>
                      {e.status && <p className="text-[10px] uppercase tracking-wider text-primary">{e.status}</p>}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Saved Templates */}
        <div className="glass rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border/50 flex flex-col sm:flex-row sm:items-center gap-3">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 flex-1">
              <FolderOpen className="h-4 w-4 text-primary"/> Email Templates
              <span className="text-xs font-normal text-muted-foreground">({templates.length})</span>
            </h2>
            <div className="flex gap-2">
              <Input
                placeholder="Template name (e.g. Welcome)"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                className="bg-background/40 h-9 text-sm w-full sm:w-64"
              />
              <button
                onClick={saveTemplate}
                disabled={savingTemplate}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:brightness-110 disabled:opacity-50 whitespace-nowrap"
              >
                {savingTemplate ? <Loader2 className="h-3.5 w-3.5 animate-spin"/> : <Save className="h-3.5 w-3.5"/>}
                Save current
              </button>
            </div>
          </div>
          {templates.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              No saved templates yet. Compose an email above and click "Save current" to create one.
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {templates.map((t) => {
                const isOpen = openTemplateId === t.id;
                const muted = "#8a9bb0";
                const cleanBody = t.body_html.replace(/<!--BLOCKS:[^-]+-->\s*/, "");
                const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background-color:${t.bg_color || "#0b0f1a"};font-family:${t.font_family || "Helvetica,Arial,sans-serif"};">
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="padding:32px 16px;">
<table width="100%" style="max-width:600px;" cellpadding="0" cellspacing="0" border="0">
${t.show_logo !== false ? `<tr><td align="center" style="padding-bottom:20px;"><img src="${LOGO_URL}" width="56" height="56" style="border-radius:12px;display:block;border:0;"/></td></tr>` : ""}
<tr><td style="background-color:${t.card_color || "#111827"};border-radius:20px;border:1px solid #1e2a3a;padding:32px;color:${t.text_color || "#e8edf2"};font-size:15px;line-height:1.7;">
${cleanBody}
<p style="margin:28px 0 0;font-size:14px;color:${muted};">Kind Regards,<br/><span style="color:${t.text_color || "#e8edf2"};font-weight:600;">Helix Team</span></p>
</td></tr>
${t.show_footer !== false ? `<tr><td align="center" style="padding-top:20px;"><p style="margin:0;font-size:11px;color:#3d4d5c;">© 2025 Helix Solutions · <a href="https://helixsolution.au" style="color:${t.accent_color || "#22d3ee"};text-decoration:none;">helixsolution.au</a></p></td></tr>` : ""}
</table></td></tr></table></body></html>`;
                return (
                  <div key={t.id}>
                    <div className="flex items-center px-6 py-3 hover:bg-primary/5 transition-colors">
                      <button
                        onClick={() => setOpenTemplateId(isOpen ? null : t.id)}
                        className="flex items-center gap-3 flex-1 text-left"
                      >
                        {isOpen ? <ChevronDown className="h-4 w-4 text-primary"/> : <ChevronRight className="h-4 w-4 text-muted-foreground"/>}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground truncate">{t.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{t.subject || "(no subject)"}</p>
                        </div>
                      </button>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => applyTemplate(t)}
                          className="flex items-center gap-1 rounded-lg bg-primary/15 hover:bg-primary/25 text-primary px-3 py-1.5 text-xs font-semibold"
                        >
                          <Check className="h-3.5 w-3.5"/> Apply
                        </button>
                        <button
                          onClick={() => deleteTemplate(t.id)}
                          className="rounded-lg p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          title="Delete template"
                        >
                          <Trash2 className="h-3.5 w-3.5"/>
                        </button>
                      </div>
                    </div>
                    {isOpen && (
                      <div className="px-6 pb-5">
                        <iframe
                          srcDoc={html}
                          title={t.name}
                          className="w-full h-[500px] rounded-xl bg-white border border-border/50"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {viewing && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={()=>setViewing(null)}>
          <div className="bg-card rounded-2xl border border-border w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e)=>e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-border/50">
              <p className="text-sm text-muted-foreground">{viewing.direction === "sent" ? `To: ${viewing.to_email}` : `From: ${viewing.from_email}`}</p>
              <h3 className="text-lg font-semibold text-foreground">{viewing.subject}</h3>
              <p className="text-xs text-muted-foreground mt-1">{new Date(viewing.created_at).toLocaleString()}</p>
            </div>
            <iframe srcDoc={viewing.html ?? ""} className="flex-1 w-full bg-white" title="Email"/>
          </div>
        </div>
      )}
    </div>
  );
};

// ---------- Per-block editor ----------
const AlignPicker = ({ value, onChange }: { value: Align; onChange: (v: Align) => void }) => (
  <div className="flex gap-1">
    {(["left","center","right"] as Align[]).map((a) => (
      <button key={a} onClick={() => onChange(a)}
        className={`flex-1 text-xs px-2 py-1.5 rounded-md border ${value===a ? "bg-primary text-primary-foreground border-primary" : "bg-background/40 border-border/50 text-foreground hover:border-primary/40"}`}>
        {a}
      </button>
    ))}
  </div>
);

const BlockEditor = ({ block, onChange }: { block: Block; onChange: (patch: Partial<Block>) => void }) => {
  if (block.type === "heading") {
    return (
      <div className="space-y-3">
        <div>
          <Label className="text-xs text-muted-foreground">Heading text</Label>
          <Input value={block.text} onChange={(e)=>onChange({ text: e.target.value } as any)} className="bg-background/40 mt-1"/>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">Size</Label>
            <Select value={String(block.size)} onValueChange={(v)=>onChange({ size: Number(v) as 1|2|3 } as any)}>
              <SelectTrigger className="bg-background/40 mt-1"><SelectValue/></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">H1 (large)</SelectItem>
                <SelectItem value="2">H2 (medium)</SelectItem>
                <SelectItem value="3">H3 (small)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Alignment</Label>
            <div className="mt-1"><AlignPicker value={block.align} onChange={(v)=>onChange({ align: v } as any)}/></div>
          </div>
        </div>
        <ColorField label="Color (optional)" value={block.color || "#ffffff"} onChange={(v)=>onChange({ color: v } as any)}/>
      </div>
    );
  }
  if (block.type === "text") {
    return (
      <div className="space-y-3">
        <div>
          <Label className="text-xs text-muted-foreground">Text (HTML allowed: &lt;b&gt;, &lt;a href&gt;, &lt;br&gt;)</Label>
          <textarea
            value={block.html}
            onChange={(e)=>onChange({ html: e.target.value } as any)}
            rows={4}
            className="w-full mt-1 rounded-md bg-background/40 border border-border/50 p-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
          />
        </div>
        <AlignPicker value={block.align} onChange={(v)=>onChange({ align: v } as any)}/>
      </div>
    );
  }
  if (block.type === "image") {
    return (
      <div className="space-y-3">
        <div>
          <Label className="text-xs text-muted-foreground">Image URL</Label>
          <Input value={block.src} onChange={(e)=>onChange({ src: e.target.value } as any)} className="bg-background/40 mt-1"/>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Link URL (optional)</Label>
          <Input value={block.href || ""} onChange={(e)=>onChange({ href: e.target.value } as any)} className="bg-background/40 mt-1"/>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">Width (px)</Label>
            <Input type="number" value={block.width} onChange={(e)=>onChange({ width: Number(e.target.value) } as any)} className="bg-background/40 mt-1"/>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Alignment</Label>
            <div className="mt-1"><AlignPicker value={block.align} onChange={(v)=>onChange({ align: v } as any)}/></div>
          </div>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Alt text</Label>
          <Input value={block.alt || ""} onChange={(e)=>onChange({ alt: e.target.value } as any)} className="bg-background/40 mt-1"/>
        </div>
      </div>
    );
  }
  if (block.type === "button") {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">Button label</Label>
            <Input value={block.label} onChange={(e)=>onChange({ label: e.target.value } as any)} className="bg-background/40 mt-1"/>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Link (href)</Label>
            <Input value={block.href} onChange={(e)=>onChange({ href: e.target.value } as any)} className="bg-background/40 mt-1"/>
          </div>
          <ColorField label="Background" value={block.bg} onChange={(v)=>onChange({ bg: v } as any)}/>
          <ColorField label="Text color" value={block.color} onChange={(v)=>onChange({ color: v } as any)}/>
          <div>
            <Label className="text-xs text-muted-foreground">Radius (px)</Label>
            <Input type="number" value={block.radius} onChange={(e)=>onChange({ radius: Number(e.target.value) } as any)} className="bg-background/40 mt-1"/>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Padding X / Y</Label>
            <div className="flex gap-2 mt-1">
              <Input type="number" value={block.padX} onChange={(e)=>onChange({ padX: Number(e.target.value) } as any)} className="bg-background/40"/>
              <Input type="number" value={block.padY} onChange={(e)=>onChange({ padY: Number(e.target.value) } as any)} className="bg-background/40"/>
            </div>
          </div>
        </div>
        <AlignPicker value={block.align} onChange={(v)=>onChange({ align: v } as any)}/>
        <label className="flex items-center gap-2 text-xs text-foreground">
          <input type="checkbox" checked={block.fullWidth} onChange={(e)=>onChange({ fullWidth: e.target.checked } as any)}/> Full-width button
        </label>
      </div>
    );
  }
  if (block.type === "divider") {
    return (
      <div className="space-y-3 grid grid-cols-2 gap-3">
        <ColorField label="Color" value={block.color} onChange={(v)=>onChange({ color: v } as any)}/>
        <div>
          <Label className="text-xs text-muted-foreground">Thickness (px)</Label>
          <Input type="number" value={block.thickness} onChange={(e)=>onChange({ thickness: Number(e.target.value) } as any)} className="bg-background/40 mt-1"/>
        </div>
      </div>
    );
  }
  if (block.type === "spacer") {
    return (
      <div>
        <Label className="text-xs text-muted-foreground">Height (px)</Label>
        <Input type="number" value={block.height} onChange={(e)=>onChange({ height: Number(e.target.value) } as any)} className="bg-background/40 mt-1"/>
      </div>
    );
  }
  return null;
};

const ColorField = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <div>
    <Label className="text-xs text-muted-foreground">{label}</Label>
    <div className="mt-1 flex items-center gap-2 rounded-md bg-background/40 border border-border/50 px-2 py-1.5">
      <input type="color" value={value} onChange={(e)=>onChange(e.target.value)} className="h-6 w-6 rounded cursor-pointer bg-transparent border-0"/>
      <input type="text" value={value} onChange={(e)=>onChange(e.target.value)} className="flex-1 bg-transparent text-xs text-foreground outline-none"/>
    </div>
  </div>
);

export default Mailpage;
