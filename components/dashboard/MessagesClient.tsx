"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Megaphone, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface AgentSummary {
  id: string;
  name: string;
  title: string | null;
  role: string;
}

interface MessageItem {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  isBroadcast: boolean;
  body: string;
  readBy: string[];
  createdAt: string;
}

interface Props {
  isAdmin: boolean;
  currentAgentId: string;
  currentAgentName: string;
  agents: AgentSummary[];
}

export const MessagesClient = ({ isAdmin, currentAgentId, agents }: Props) => {
  const [tab, setTab] = useState<"dm" | "broadcast">("dm");
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(isAdmin ? agents[0]?.id ?? null : currentAgentId);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [broadcasts, setBroadcasts] = useState<MessageItem[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const markRead = async (items: MessageItem[]) => {
    const unread = items.filter((m) => m.senderId !== currentAgentId && !m.readBy.includes(currentAgentId));
    if (unread.length === 0) return;
    fetch("/api/messages/mark-read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: unread.map((m) => m.id) }),
    }).catch(() => {});
  };

  const loadThread = async (agentId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/messages?threadAgentId=${agentId}`);
      const data = await res.json();
      const items: MessageItem[] = data.messages || [];
      setMessages(items);
      markRead(items);
    } finally {
      setLoading(false);
    }
  };

  const loadBroadcasts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/messages?broadcast=true`);
      const data = await res.json();
      const items: MessageItem[] = data.messages || [];
      setBroadcasts(items);
      markRead(items);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === "dm" && selectedAgentId) loadThread(selectedAgentId);
    if (tab === "broadcast") loadBroadcasts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, selectedAgentId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!draft.trim()) return;
    setSending(true);
    try {
      const body =
        tab === "broadcast"
          ? { body: draft.trim(), isBroadcast: true }
          : { body: draft.trim(), threadAgentId: isAdmin ? selectedAgentId! : undefined };

      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      setDraft("");
      if (tab === "broadcast") loadBroadcasts();
      else if (selectedAgentId) loadThread(selectedAgentId);
    } catch {
      window.alert("Couldn't send that message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <div className="flex gap-6 border-b border-line mb-8">
        <button
          onClick={() => setTab("dm")}
          className={`pb-3 flex items-center gap-2 text-xs font-mono uppercase tracking-widest border-b-2 transition-colors ${
            tab === "dm" ? "border-clay text-ink" : "border-transparent text-ink/50 hover:text-ink"
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" /> Direct Messages
        </button>
        <button
          onClick={() => setTab("broadcast")}
          className={`pb-3 flex items-center gap-2 text-xs font-mono uppercase tracking-widest border-b-2 transition-colors ${
            tab === "broadcast" ? "border-clay text-ink" : "border-transparent text-ink/50 hover:text-ink"
          }`}
        >
          <Megaphone className="w-3.5 h-3.5" /> Announcements
        </button>
      </div>

      {tab === "dm" ? (
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
          {isAdmin && (
            <div className="border border-line bg-surface">
              {agents.length === 0 ? (
                <p className="p-4 text-sm text-ink/50">No other agents yet.</p>
              ) : (
                agents.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setSelectedAgentId(a.id)}
                    className={`w-full text-left p-4 border-b border-line last:border-0 transition-colors ${
                      selectedAgentId === a.id ? "bg-parchment" : "hover:bg-parchment/50"
                    }`}
                  >
                    <p className="text-sm font-medium">{a.name}</p>
                    <p className="text-xs text-ink/50">{a.title || (a.role === "ADMIN" ? "RA" : a.role)}</p>
                  </button>
                ))
              )}
            </div>
          )}

          <div className="border border-line bg-surface flex flex-col h-[520px]">
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {loading ? (
                <p className="text-sm text-ink/50">Loading...</p>
              ) : messages.length === 0 ? (
                <p className="text-sm text-ink/50">
                  {isAdmin && !selectedAgentId ? "Select an agent to start a conversation." : "No messages yet. Say hello."}
                </p>
              ) : (
                messages.map((m) => {
                  const mine = m.senderId === currentAgentId;
                  return (
                    <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] ${mine ? "bg-ink text-parchment" : "bg-parchment border border-line"} px-4 py-2.5`}>
                        {!mine && <p className="text-xs font-medium text-clay mb-1">{m.senderName}</p>}
                        <p className="text-sm whitespace-pre-wrap">{m.body}</p>
                        <p className={`mt-1 text-[10px] ${mine ? "text-parchment/50" : "text-ink/40"}`}>
                          {new Date(m.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            {(!isAdmin || selectedAgentId) && (
              <div className="border-t border-line p-3 flex gap-2">
                <Textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Write a message..."
                  className="min-h-[44px] h-11 resize-none"
                />
                <Button onClick={handleSend} disabled={sending || !draft.trim()} size="icon" className="shrink-0 h-11 w-11">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div>
          {isAdmin && (
            <div className="border border-line bg-surface p-5 mb-6">
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Write an announcement for every agent..."
                className="min-h-[80px]"
              />
              <Button onClick={handleSend} disabled={sending || !draft.trim()} className="mt-3">
                <Megaphone className="w-4 h-4 mr-2" /> Send to All Agents
              </Button>
            </div>
          )}

          <div className="space-y-4">
            {loading ? (
              <p className="text-sm text-ink/50">Loading...</p>
            ) : broadcasts.length === 0 ? (
              <p className="text-sm text-ink/50">No announcements yet.</p>
            ) : (
              broadcasts.map((b) => (
                <div key={b.id} className="border border-line bg-surface p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="clay">Announcement</Badge>
                    <span className="text-sm font-medium">{b.senderName}</span>
                    <span className="text-xs text-ink/40">{new Date(b.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-ink/80 whitespace-pre-wrap">{b.body}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
