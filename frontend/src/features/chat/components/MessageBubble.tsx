import { useState } from "react";
import { Check, Copy, Sparkles } from "lucide-react";
import type { ChatMessage } from "../types";

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const isAssistant = message.role === "assistant";

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  if (!isAssistant) {
    return (
      <article className="flex justify-end">
        <div className="max-w-[min(78%,42rem)] rounded-2xl rounded-br-md bg-[#292b3a] px-4 py-3 text-sm leading-6 text-slate-100">
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
      </article>
    );
  }

  return (
    <article className="flex gap-3">
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300 ring-1 ring-violet-400/20">
        <Sparkles size={15} aria-hidden="true" />
      </div>

      <div className="min-w-0 max-w-[min(82%,48rem)] flex-1">
        <div className="mb-1.5 flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-200">Lume</span>
          <button
            type="button"
            onClick={handleCopy}
            aria-label={copied ? "Copied response" : "Copy response"}
            className="rounded p-1 text-slate-500 transition hover:bg-white/5 hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
          >
            {copied ? (
              <Check size={14} aria-hidden="true" />
            ) : (
              <Copy size={14} aria-hidden="true" />
            )}
          </button>
        </div>

        <p className="whitespace-pre-wrap text-sm leading-7 text-slate-300">
          {message.content}
        </p>
      </div>
    </article>
  );
}
