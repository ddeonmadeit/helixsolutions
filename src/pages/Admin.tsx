import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Users, Mail, Send, CheckCircle, PenLine, FileText, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ADMIN_PASSWORD = "helix2024";

interface Lead {
  id: string;
  name: string | null;
  email: string | null;
  time_sinks: string[] | null;
  business_type: string | null;
  current_software: string[] | null;
  personality: string | null;
  website: string | null;
  phone: string | null;
  openclaw_prompt: string | null;
  created_at: string;
}

interface Signature {
  id: string;
  full_name: string;
  email: string;
  signed_at: string;
  ip_address: string | null;
  user_agent: string | null;
  agreed_to_terms: boolean;
  contract_version: string;
}

const formatLabel = (val: string) =>
  val.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const CONTRACT_PDF_URL = "/contract.pdf";

const Admin = () => {
  const { toast } = useToast();
  const [authed, setAuthed] = useState(false);
  const [viewingSig, setViewingSig] = useState<Signature | null>(null);
  const [password, setPassword] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Thank you email state
  const [tyName, setTyName] = useState("");
  const [tyEmail, setTyEmail] = useState("");
  const [tySending, setTySending] = useState(false);
  const [tySent, setTySent] = useState(false);

  // Follow-up email state
  const [fuName, setFuName] = useState("");
  const [fuEmail, setFuEmail] = useState("");
  const [fuJoinUrl, setFuJoinUrl] = useState("");
  const [fuSending, setFuSending] = useState(false);
  const [fuSent, setFuSent] = useState(false);

  // Payment received email state
  const [prName, setPrName] = useState("");
  const [prEmail, setPrEmail] = useState("");
  const [prSending, setPrSending] = useState(false);
  const [prSent, setPrSent] = useState(false);

  // Missed call email state
  const [mcName, setMcName] = useState("");
  const [mcEmail, setMcEmail] = useState("");
  const [mcSending, setMcSending] = useState(false);
  const [mcSent, setMcSent] = useState(false);

  const handleSendThankYou = async () => {
    if (!tyName.trim() || !tyEmail.trim().includes("@")) return;
    setTySending(true);
    setTySent(false);
    try {
      const { error } = await supabase.functions.invoke("send-thankyou-email", {
        body: { name: tyName.trim(), email: tyEmail.trim() },
      });
      if (error) throw error;
      setTySent(true);
      setTyName("");
      setTyEmail("");
      toast({ title: "Email sent!", description: `Thank you email sent to ${tyEmail.trim()}` });
    } catch (err: any) {
      toast({ title: "Send failed", description: err.message, variant: "destructive" });
    } finally {
      setTySending(false);
    }
  };

  const handleSendFollowUp = async () => {
    if (!fuName.trim() || !fuEmail.trim().includes("@")) return;
    setFuSending(true);
    setFuSent(false);
    try {
      const { error } = await supabase.functions.invoke("send-followup-email", {
        body: { name: fuName.trim(), email: fuEmail.trim(), joinUrl: fuJoinUrl.trim() || undefined },
      });
      if (error) throw error;
      setFuSent(true);
      setFuName("");
      setFuEmail("");
      setFuJoinUrl("");
      toast({ title: "Follow-up sent!", description: `Reminder email sent to ${fuEmail.trim()}` });
    } catch (err: any) {
      toast({ title: "Send failed", description: err.message, variant: "destructive" });
    } finally {
      setFuSending(false);
    }
  };

  const handleSendPaymentReceived = async () => {
    if (!prName.trim() || !prEmail.trim().includes("@")) return;
    setPrSending(true);
    setPrSent(false);
    try {
      const { error } = await supabase.functions.invoke("send-simple-email", {
        body: {
          to: prEmail.trim(),
          subject: "Payment Received — Helix Solutions",
          name: prName.trim(),
          body: "We have received your payment and are working on setting up OpenClaw.",
        },
      });
      if (error) throw error;
      setPrSent(true);
      setPrName("");
      setPrEmail("");
      toast({ title: "Email sent!", description: `Payment confirmation sent to ${prEmail.trim()}` });
    } catch (err: any) {
      toast({ title: "Send failed", description: err.message, variant: "destructive" });
    } finally {
      setPrSending(false);
    }
  };

  const handleSendMissedCall = async () => {
    if (!mcName.trim() || !mcEmail.trim().includes("@")) return;
    setMcSending(true);
    setMcSent(false);
    try {
      const { error } = await supabase.functions.invoke("send-missedcall-email", {
        body: { name: mcName.trim(), email: mcEmail.trim() },
      });
      if (error) throw error;
      setMcSent(true);
      setMcName("");
      setMcEmail("");
      toast({ title: "Email sent!", description: `Missed call email sent to ${mcEmail.trim()}` });
    } catch (err: any) {
      toast({ title: "Send failed", description: err.message, variant: "destructive" });
    } finally {
      setMcSending(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthed(true);
    } else {
      setError("Incorrect password.");
    }
  };

  useEffect(() => {
    if (!authed) return;
    setLoading(true);
    Promise.all([
      supabase.functions.invoke("get-leads"),
      supabase.functions.invoke("get-signatures"),
    ]).then(([leadsRes, sigsRes]) => {
      if (leadsRes.error) throw leadsRes.error;
      if (sigsRes.error) throw sigsRes.error;
      setLeads(leadsRes.data?.leads ?? []);
      setSignatures(sigsRes.data?.signatures ?? []);
    })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [authed]);

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="glass glow-primary rounded-2xl p-10 w-full max-w-sm space-y-6">
          <h1 className="text-2xl font-bold text-foreground text-center">Admin Access</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-background/40"
            />
            {error && <p className="text-destructive text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Enter
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-6 py-12">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Leads Dashboard</h1>
            <p className="text-muted-foreground mt-1">All quiz submissions</p>
          </div>
          <div className="flex gap-4">
            <div className="glass rounded-xl px-5 py-3 text-center">
              <p className="text-2xl font-bold text-primary">{signatures.length}</p>
              <p className="text-xs text-muted-foreground">Signatures</p>
            </div>
            <div className="glass rounded-xl px-5 py-3 text-center">
              <p className="text-2xl font-bold text-primary">{leads.length}</p>
              <p className="text-xs text-muted-foreground">Total Leads</p>
            </div>
          </div>
        </div>

        {/* Send Thank You Email */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Send className="h-4 w-4 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Send Thank You Email</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-5">
            Send a personalised thank-you email with the onboarding link to any client on demand.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Client full name"
              value={tyName}
              onChange={(e) => setTyName(e.target.value)}
              className="bg-background/40 flex-1"
            />
            <Input
              type="email"
              placeholder="Client email address"
              value={tyEmail}
              onChange={(e) => setTyEmail(e.target.value)}
              className="bg-background/40 flex-1"
            />
            <button
              onClick={handleSendThankYou}
              disabled={tySending || !tyName.trim() || !tyEmail.trim().includes("@")}
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {tySending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : tySent ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {tySending ? "Sending…" : tySent ? "Sent!" : "Send Email"}
            </button>
          </div>
        </div>

        {/* Follow-Up / Booking Reminder Email */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="h-4 w-4 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Send Booking Reminder</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-5">
            Send a personalised booking reminder email to any client.
          </p>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="Client full name"
                value={fuName}
                onChange={(e) => { setFuName(e.target.value); setFuSent(false); }}
                className="bg-background/40 flex-1"
              />
              <Input
                type="email"
                placeholder="Client email address"
                value={fuEmail}
                onChange={(e) => { setFuEmail(e.target.value); setFuSent(false); }}
                className="bg-background/40 flex-1"
              />
              <button
                onClick={handleSendFollowUp}
                disabled={fuSending || !fuName.trim() || !fuEmail.trim().includes("@")}
                className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {fuSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : fuSent ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
                {fuSending ? "Sending…" : fuSent ? "Sent!" : "Send Reminder"}
              </button>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Meeting Join Link <span className="text-muted-foreground/60">(optional — paste from Cal.com booking confirmation)</span>
              </label>
              <Input
                type="url"
                placeholder="https://cal.com/video/... or Zoom/Meet link"
                value={fuJoinUrl}
                onChange={(e) => setFuJoinUrl(e.target.value)}
                className="bg-background/40"
              />
            </div>
          </div>
        </div>

        {/* Payment Received Email */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="h-4 w-4 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Send Payment Confirmation</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-5">
            Notify a client that their payment has been received and OpenClaw setup is underway.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Client full name"
              value={prName}
              onChange={(e) => { setPrName(e.target.value); setPrSent(false); }}
              className="bg-background/40 flex-1"
            />
            <Input
              type="email"
              placeholder="Client email address"
              value={prEmail}
              onChange={(e) => { setPrEmail(e.target.value); setPrSent(false); }}
              className="bg-background/40 flex-1"
            />
            <button
              onClick={handleSendPaymentReceived}
              disabled={prSending || !prName.trim() || !prEmail.trim().includes("@")}
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {prSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : prSent ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {prSending ? "Sending…" : prSent ? "Sent!" : "Send Confirmation"}
            </button>
          </div>
        </div>

        {/* Missed Call Email */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="h-4 w-4 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Send Missed Call Email</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-5">
            Send a "we missed you" note with a personalised reschedule link.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Client full name"
              value={mcName}
              onChange={(e) => { setMcName(e.target.value); setMcSent(false); }}
              className="bg-background/40 flex-1"
            />
            <Input
              type="email"
              placeholder="Client email address"
              value={mcEmail}
              onChange={(e) => { setMcEmail(e.target.value); setMcSent(false); }}
              className="bg-background/40 flex-1"
            />
            <button
              onClick={handleSendMissedCall}
              disabled={mcSending || !mcName.trim() || !mcEmail.trim().includes("@")}
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {mcSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : mcSent ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <Mail className="h-4 w-4" />
              )}
              {mcSending ? "Sending…" : mcSent ? "Sent!" : "Send Email"}
            </button>
          </div>
        </div>

        {/* Signatures Table */}
        <div className="glass rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-border/50">
            <PenLine className="h-4 w-4 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Signed Agreements</h2>
            <span className="ml-auto text-xs text-muted-foreground">{signatures.length} signature{signatures.length !== 1 ? "s" : ""}</span>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : signatures.length === 0 ? (
            <p className="text-muted-foreground text-center py-10 text-sm">No signatures yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead>Full Name</TableHead>
                  <TableHead>Signature</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Contract</TableHead>
                  <TableHead>Agreed</TableHead>
                  <TableHead>Signed At</TableHead>
                  <TableHead>Document</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {signatures.map((sig) => (
                  <TableRow key={sig.id} className="border-border">
                    <TableCell className="font-medium text-foreground">{sig.full_name}</TableCell>
                    <TableCell>
                      <span
                        style={{ fontFamily: "'Dancing Script', 'Brush Script MT', cursive", fontSize: "1.2rem" }}
                        className="text-primary"
                      >
                        {sig.full_name}
                      </span>
                    </TableCell>
                    <TableCell>
                      <a href={`mailto:${sig.email}`} className="text-primary hover:underline">{sig.email}</a>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{sig.contract_version}</Badge>
                    </TableCell>
                    <TableCell>
                      {sig.agreed_to_terms ? (
                        <CheckCircle className="h-4 w-4 text-primary" />
                      ) : (
                        <span className="text-destructive text-xs">No</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(sig.signed_at).toLocaleString("en-AU", {
                        day: "2-digit", month: "short", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => setViewingSig(sig)}
                        className="flex items-center gap-1.5 rounded-lg border border-primary/30 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

          )}
        </div>

        {/* Contract viewer modal */}
        <Dialog open={!!viewingSig} onOpenChange={(open) => !open && setViewingSig(null)}>
          <DialogContent className="max-w-4xl w-full h-[90vh] flex flex-col gap-0 p-0 overflow-hidden">
            <DialogHeader className="px-6 py-4 border-b border-border flex-shrink-0">
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Signed Agreement — {viewingSig?.full_name}
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {viewingSig?.email} · Signed{" "}
                {viewingSig && new Date(viewingSig.signed_at).toLocaleString("en-AU", {
                  day: "2-digit", month: "short", year: "numeric",
                  hour: "2-digit", minute: "2-digit",
                })}
              </p>
              <div className="mt-3 flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
                <PenLine className="h-4 w-4 text-primary flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Client Signature</p>
                  <p style={{ fontFamily: "'Dancing Script', 'Brush Script MT', cursive", fontSize: "1.4rem" }} className="text-foreground leading-tight">
                    {viewingSig?.full_name}
                  </p>
                </div>
              </div>
            </DialogHeader>
            <div className="flex-1 overflow-hidden">
              <iframe
                src={CONTRACT_PDF_URL}
                className="w-full h-full"
                title="Contract PDF"
              />
            </div>
          </DialogContent>
        </Dialog>

        {/* Leads Table */}
        <div className="glass rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-border/50">
            <Users className="h-4 w-4 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Leads</h2>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <p className="text-destructive text-center py-12">{error}</p>
          ) : leads.length === 0 ? (
            <p className="text-muted-foreground text-center py-12">No leads yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Functions</TableHead>
                  <TableHead>Personality</TableHead>
                  <TableHead>OpenClaw Prompt</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead.id} className="border-border">
                    <TableCell className="font-medium text-foreground">
                      {lead.name ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {lead.email ? (
                        <a href={`mailto:${lead.email}`} className="text-primary hover:underline">
                          {lead.email}
                        </a>
                      ) : "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {lead.website ? (
                        <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          {lead.website.replace(/^https?:\/\//, "")}
                        </a>
                      ) : "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {lead.phone || "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(lead.time_sinks ?? []).map((s) => (
                          <Badge key={s} variant="outline" className="text-xs">
                            {formatLabel(s)}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {lead.personality ? (
                        <Badge variant="secondary">{formatLabel(lead.personality)}</Badge>
                      ) : "—"}
                    </TableCell>
                    <TableCell>
                      {lead.openclaw_prompt ? (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(lead.openclaw_prompt!);
                            toast({ title: "Copied!", description: "OpenClaw prompt copied to clipboard." });
                          }}
                          className="flex items-center gap-1.5 rounded-lg border border-primary/30 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          Copy Prompt
                        </button>
                      ) : "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(lead.created_at).toLocaleDateString("en-AU", {
                        day: "2-digit", month: "short", year: "numeric",
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
