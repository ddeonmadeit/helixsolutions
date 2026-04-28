import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Bold, Italic, Underline, Link as LinkIcon, List, ListOrdered,
  Heading1, Heading2, Send, Loader2, Mail, Inbox, Eye, RefreshCw,
} from "lucide-react";

const ADMIN_PASSWORD = "helix2024";
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

const Mailpage = () => {
  const { toast } = useToast();
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");

  // Composer
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [bodyHtml, setBodyHtml] = useState(
    `<p>Hi there,</p><p>Write your message here. Use the toolbar to add formatting, links and lists.</p>`,
  );

  // Style controls
  const [fontFamily, setFontFamily] = useState(FONT_OPTIONS[0].value);
  const [textColor, setTextColor] = useState("#e8edf2");
  const [bgColor, setBgColor] = useState("#0b0f1a");
  const [cardColor, setCardColor] = useState("#111827");
  const [accentColor, setAccentColor] = useState("#22d3ee");
  const [showLogo, setShowLogo] = useState(true);
  const [showFooter, setShowFooter] = useState(true);

  const [sending, setSending] = useState(false);
  const [tab, setTab] = useState<"compose" | "sent" | "received">("compose");
  const [emails, setEmails] = useState<EmailRow[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [viewing, setViewing] = useState<EmailRow | null>(null);

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
        <div style="color:${textColor};">${bodyHtml}</div>
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

  // ---- Editor commands ----
  const exec = (cmd: string, value?: string) => {
    document.execCommand(cmd, false, value);
    if (editorRef.current) setBodyHtml(editorRef.current.innerHTML);
  };
  const onEditorInput = () => {
    if (editorRef.current) setBodyHtml(editorRef.current.innerHTML);
  };
  const insertLink = () => {
    const url = prompt("Enter URL");
    if (url) exec("createLink", url);
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

  // ---- Load emails ----
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

  useEffect(() => {
    if (authed) loadEmails();
  }, [authed]);

  // Init editor content once
  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = bodyHtml;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed]);

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <form
          onSubmit={(e) => { e.preventDefault(); if (pw === ADMIN_PASSWORD) setAuthed(true); }}
          className="glass glow-primary rounded-2xl p-10 w-full max-w-sm space-y-5"
        >
          <h1 className="text-2xl font-bold text-foreground text-center">Mail Studio</h1>
          <Input type="password" placeholder="Password" value={pw} onChange={(e) => setPw(e.target.value)} className="bg-background/40" />
          <button className="w-full rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground">Enter</button>
        </form>
      </div>
    );
  }

  const list = emails.filter((e) => tab === "sent" ? e.direction === "sent" : tab === "received" ? e.direction === "received" : true);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Mail Studio</h1>
            <p className="text-muted-foreground text-sm mt-1">Compose, preview and track every email.</p>
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
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Composer */}
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

              {/* Toolbar */}
              <div className="flex flex-wrap items-center gap-1 rounded-xl bg-background/40 border border-border/50 p-2">
                {[
                  {icon: Heading1, cmd: "formatBlock", val: "h1"},
                  {icon: Heading2, cmd: "formatBlock", val: "h2"},
                  {icon: Bold, cmd: "bold"},
                  {icon: Italic, cmd: "italic"},
                  {icon: Underline, cmd: "underline"},
                  {icon: List, cmd: "insertUnorderedList"},
                  {icon: ListOrdered, cmd: "insertOrderedList"},
                ].map(({icon: Icon, cmd, val}, i) => (
                  <button key={i} type="button" onMouseDown={(e)=>e.preventDefault()} onClick={()=>exec(cmd, val)}
                    className="p-2 rounded-md hover:bg-primary/20 text-foreground"><Icon className="h-4 w-4"/></button>
                ))}
                <button type="button" onMouseDown={(e)=>e.preventDefault()} onClick={insertLink}
                  className="p-2 rounded-md hover:bg-primary/20 text-foreground"><LinkIcon className="h-4 w-4"/></button>
                <div className="mx-1 h-6 w-px bg-border"/>
                <input type="color" title="Text color" onChange={(e)=>exec("foreColor", e.target.value)} className="h-7 w-7 rounded cursor-pointer bg-transparent border border-border"/>
              </div>

              {/* Editor */}
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={onEditorInput}
                className="min-h-[260px] rounded-xl bg-background/40 border border-border/50 p-4 text-sm text-foreground focus:outline-none focus:border-primary/50 prose prose-invert max-w-none"
                style={{ fontFamily }}
              />

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

              <button onClick={handleSend} disabled={sending}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:brightness-110 disabled:opacity-50">
                {sending ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4"/>}
                {sending ? "Sending…" : "Send Email"}
              </button>
            </div>

            {/* Live Preview — exact recipient view */}
            <div className="glass rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground px-2">
                <Eye className="h-3.5 w-3.5"/> Recipient preview (pixel-accurate)
              </div>
              <iframe
                title="Email preview"
                srcDoc={renderedHtml}
                className="w-full h-[700px] rounded-xl bg-white border border-border/50"
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
