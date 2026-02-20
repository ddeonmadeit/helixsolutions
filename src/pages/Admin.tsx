import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, Users, Mail, Send, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ADMIN_PASSWORD = "helix2024";

interface Lead {
  id: string;
  name: string | null;
  email: string | null;
  time_sinks: string[] | null;
  business_type: string | null;
  current_software: string[] | null;
  created_at: string;
}

const formatLabel = (val: string) =>
  val.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const Admin = () => {
  const { toast } = useToast();
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Thank you email state
  const [tyName, setTyName] = useState("");
  const [tyEmail, setTyEmail] = useState("");
  const [tySending, setTySending] = useState(false);
  const [tySent, setTySent] = useState(false);

  // Follow-up email state
  const [fuEmail, setFuEmail] = useState("");
  const [fuSending, setFuSending] = useState(false);
  const [fuSent, setFuSent] = useState(false);
  const [fuResolved, setFuResolved] = useState<{ name: string; calUrl: string } | null>(null);

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
    if (!fuEmail.trim().includes("@")) return;
    setFuSending(true);
    setFuSent(false);
    setFuResolved(null);
    try {
      const { data, error } = await supabase.functions.invoke("send-followup-email", {
        body: { email: fuEmail.trim() },
      });
      if (error) throw error;
      setFuSent(true);
      setFuResolved({ name: data.name, calUrl: data.calUrl });
      setFuEmail("");
      toast({ title: "Follow-up sent!", description: `Reminder email sent to ${data.name}` });
    } catch (err: any) {
      toast({ title: "Send failed", description: err.message, variant: "destructive" });
    } finally {
      setFuSending(false);
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
    supabase.functions
      .invoke("get-leads")
      .then(({ data, error }) => {
        if (error) throw error;
        setLeads(data?.leads ?? []);
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
            Enter a client's email — we'll automatically pull their quiz data and send a personalised follow-up with their booking link.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              type="email"
              placeholder="Client email address"
              value={fuEmail}
              onChange={(e) => { setFuEmail(e.target.value); setFuSent(false); setFuResolved(null); }}
              className="bg-background/40 flex-1"
            />
            <button
              onClick={handleSendFollowUp}
              disabled={fuSending || !fuEmail.trim().includes("@")}
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
          {fuResolved && (
            <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-xs text-muted-foreground space-y-1">
              <p><span className="text-foreground font-medium">Sent to:</span> {fuResolved.name}</p>
              <p className="break-all"><span className="text-foreground font-medium">Cal link:</span>{" "}
                <a href={fuResolved.calUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">
                  {fuResolved.calUrl}
                </a>
              </p>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="glass rounded-2xl overflow-hidden">
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
                  <TableHead>Business Type</TableHead>
                  <TableHead>Time Sinks</TableHead>
                  <TableHead>Software</TableHead>
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
                    <TableCell>
                      {lead.business_type ? (
                        <Badge variant="secondary">{formatLabel(lead.business_type)}</Badge>
                      ) : "—"}
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
                      <div className="flex flex-wrap gap-1">
                        {(lead.current_software ?? []).map((s) => (
                          <Badge key={s} variant="outline" className="text-xs">
                            {formatLabel(s)}
                          </Badge>
                        ))}
                      </div>
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
