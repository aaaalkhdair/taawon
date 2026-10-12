"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import { Bot, Send, ShieldCheck, Sparkles, User } from "lucide-react";
import type { ChatMessage } from "@/db/schema";
import { useT } from "@/i18n/client";
import { Button, Card, Input } from "@/components/ui";
import { sendChatMessageAction } from "@/app/parent/actions";

export function ChatBox({
  childId,
  childName,
  initialMessages,
}: {
  childId: string;
  childName: string;
  initialMessages: ChatMessage[];
}) {
  const { t } = useT();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [pending, startTransition] = useTransition();
  const endRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, pending]);

  const handleSend = (textToSend?: string) => {
    const text = (textToSend ?? input).trim();
    if (!text || pending) return;

    const optimisticMsg: ChatMessage = {
      id: crypto.randomUUID(),
      childId,
      userId: "",
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setInput("");

    startTransition(async () => {
      try {
        const reply = await sendChatMessageAction(childId, text);
        setMessages((prev) => [...prev, reply]);
      } catch {
        alert("Failed to send message");
      }
    });
  };

  const chips = [
    t("parent.chat.chip1"),
    t("parent.chat.chip2"),
    t("parent.chat.chip3"),
    t("parent.chat.chip4"),
  ];

  return (
    <Card className="flex flex-col h-[calc(100vh-14rem)] min-h-[480px] overflow-hidden shadow-card">
      {/* Header Info Banner */}
      <div className="flex items-center justify-between border-b border-line bg-surface/80 px-5 py-3 text-xs">
        <div className="flex items-center gap-2 text-muted">
          <Bot className="size-4 text-brand-600" />
          <span>{childName}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-muted">
          <ShieldCheck className="size-3.5 text-care-600" />
          <span>{t("common.privacyNote")}</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-care-500 text-white shadow-pop">
              <Sparkles className="size-7" />
            </div>
            <h3 className="mt-4 font-bold text-ink">{t("parent.chat.title")}</h3>
            <p className="mt-1 text-xs text-muted max-w-sm">
              {t("parent.chat.subtitle")}
            </p>
          </div>
        )}

        {messages.map((m) => {
          const isUser = m.role === "user";
          return (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}
            >
              <div
                className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  isUser
                    ? "bg-brand-100 text-brand-700"
                    : "bg-gradient-to-tr from-brand-600 to-care-500 text-white shadow-xs"
                }`}
              >
                {isUser ? <User className="size-4" /> : <Bot className="size-4" />}
              </div>
              <div
                className={`max-w-[82%] sm:max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  isUser
                    ? "bg-brand-600 text-white rounded-br-xs"
                    : "bg-surface border border-line text-slate-800 rounded-bl-xs"
                }`}
              >
                <p className="whitespace-pre-line">{m.content}</p>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {pending && (
          <div className="flex items-start gap-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-brand-600 to-care-500 text-white">
              <Bot className="size-4" />
            </div>
            <div className="rounded-2xl rounded-bl-xs border border-line bg-surface px-4 py-3">
              <div className="dot-typing flex items-center gap-1 text-slate-400">
                <span className="size-2 rounded-full bg-brand-600" />
                <span className="size-2 rounded-full bg-brand-600" />
                <span className="size-2 rounded-full bg-brand-600" />
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Suggested Chips Bar */}
      <div className="border-t border-line bg-surface/50 px-4 py-2.5 overflow-x-auto scrollbar-none flex gap-2">
        {chips.map((chip, idx) => (
          <button
            key={idx}
            type="button"
            disabled={pending}
            onClick={() => handleSend(chip)}
            className="whitespace-nowrap rounded-full border border-line bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-brand-50 hover:border-brand-300 hover:text-brand-700 transition-all shrink-0"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 border-t border-line bg-white p-3"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("parent.chat.placeholder")}
          className="flex-1 text-sm h-11"
          disabled={pending}
        />
        <Button
          type="submit"
          disabled={!input.trim() || pending}
          className="size-11 p-0 shrink-0"
        >
          <Send className="size-4 rtl-flip" />
        </Button>
      </form>
    </Card>
  );
}
