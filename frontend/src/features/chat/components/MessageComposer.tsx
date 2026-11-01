import type { FormEvent, KeyboardEvent } from "react";
import { ArrowUp } from "lucide-react";

interface MessageComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isSending: boolean;
}

export function MessageComposer({
  value,
  onChange,
  onSubmit,
  isSending,
}: MessageComposerProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (value.trim() && !isSending) {
      onSubmit();
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  return (
    <div className="border-t border-white/[0.06] bg-[#15161c] px-5 pb-4 pt-4 sm:px-8">
      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-[#1c1d25] p-2 shadow-lg shadow-black/10 transition focus-within:border-violet-400/40 focus-within:ring-2 focus-within:ring-violet-500/10"
      >
        <label className="sr-only" htmlFor="message-composer">
          Message Lume
        </label>
        <textarea
          id="message-composer"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message Lume..."
          rows={1}
          disabled={isSending}
          className="max-h-40 min-h-12 w-full resize-none bg-transparent px-3 py-3 text-sm leading-6 text-slate-100 outline-none placeholder:text-slate-500 disabled:opacity-60"
        />

        <div className="flex items-center justify-between px-2 pb-1">
          <p className="text-[11px] text-slate-600">
            Enter to send · Shift+Enter for a new line
          </p>
          <button
            type="submit"
            disabled={!value.trim() || isSending}
            aria-label={isSending ? "Sending message" : "Send message"}
            className="flex size-9 items-center justify-center rounded-xl bg-violet-500 text-white transition hover:bg-violet-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1c1d25] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-slate-500"
          >
            <ArrowUp size={18} strokeWidth={2.5} aria-hidden="true" />
          </button>
        </div>
      </form>

      <p className="mx-auto mt-3 max-w-3xl text-center text-[10px] text-slate-600">
        AI can make mistakes. Check important information.
      </p>
    </div>
  );
}
