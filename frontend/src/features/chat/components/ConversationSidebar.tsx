import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  Check,
  Clock3,
  MessageSquarePlus,
  MoreHorizontal,
  Pencil,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import type { ConversationSummary } from "../types";

interface ConversationSidebarProps {
  conversations: ConversationSummary[];
  activeConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  onNewChat: () => void;
  onRenameConversation: (
    conversationId: string,
    title: string,
  ) => Promise<void>;
  onDeleteConversation: (conversationId: string) => Promise<void>;
}

function formatConversationDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = new Date();
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  return isToday
    ? date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    : date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export function ConversationSidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onRenameConversation,
  onDeleteConversation,
}: ConversationSidebarProps) {
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const filteredConversations = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return conversations;
    }

    return conversations.filter((conversation) =>
      conversation.title.toLowerCase().includes(normalizedQuery),
    );
  }, [conversations, query]);

  function saveRename(conversationId: string) {
    const title = editingTitle.trim();

    if (!title) {
      return;
    }

    void onRenameConversation(conversationId, title);
    setEditingId(null);
    setEditingTitle("");
    setOpenMenuId(null);
  }

  return (
    <aside className="relative flex h-full w-[288px] shrink-0 flex-col overflow-hidden border-r border-white/[0.07] bg-[#0d0f15] text-slate-300">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-28 size-72 rounded-full bg-violet-500/[0.09] blur-3xl"
      />

      <div className="relative flex h-[76px] shrink-0 items-center gap-3 px-5">
        <div className="relative flex size-10 items-center justify-center rounded-[14px] border border-violet-200/20 bg-gradient-to-br from-violet-300/20 via-violet-500/10 to-cyan-300/10 text-violet-100 shadow-[0_0_30px_rgba(139,92,246,0.14)]">
          <div className="absolute inset-1 rounded-[10px] border border-white/[0.08]" />
          <Sparkles size={18} strokeWidth={1.8} aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-[14px] font-semibold tracking-[0.02em] text-white">
            Lume
          </p>
          <p className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-slate-500">
            AI workspace
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 rounded-full border border-emerald-300/10 bg-emerald-300/[0.05] px-2 py-1">
          <span className="size-1.5 rounded-full bg-emerald-300 shadow-[0_0_8px_rgba(110,231,183,0.8)]" />
          <span className="text-[9px] font-medium uppercase tracking-wider text-emerald-200/80">
            Ready
          </span>
        </div>
      </div>

      <div className="relative px-3 pt-2">
        <button
          type="button"
          onClick={onNewChat}
          className="group flex h-11 w-full items-center justify-between rounded-xl border border-violet-200/20 bg-gradient-to-r from-violet-500/20 via-violet-400/10 to-cyan-300/[0.08] px-3.5 text-left shadow-[0_6px_24px_rgba(91,54,160,0.12)] transition duration-200 hover:border-violet-200/35 hover:from-violet-500/30 hover:via-violet-400/15 hover:to-cyan-300/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
        >
          <span className="flex items-center gap-2.5">
            <MessageSquarePlus
              size={16}
              className="text-violet-200"
              aria-hidden="true"
            />
            <span className="text-xs font-semibold text-slate-100">
              New conversation
            </span>
          </span>
          <ArrowUpRight
            size={14}
            className="text-violet-200/60 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-violet-100"
            aria-hidden="true"
          />
        </button>
      </div>

      <div className="px-3 pt-5">
        <label className="relative block">
          <span className="sr-only">Search conversations</span>
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            aria-hidden="true"
          />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Find a conversation"
            className="h-10 w-full rounded-xl border border-white/[0.07] bg-white/[0.025] pl-9 pr-3 text-xs text-slate-200 outline-none transition placeholder:text-slate-600 hover:border-white/[0.12] focus:border-violet-300/35 focus:bg-white/[0.04] focus:ring-2 focus:ring-violet-400/10"
          />
        </label>
      </div>

      <nav
        aria-label="Conversation history"
        className="relative mt-6 flex-1 overflow-y-auto px-3 pb-4"
      >
        <div className="mb-2 flex items-center justify-between px-2">
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            Recent conversations
          </p>
          <span className="rounded-md bg-white/[0.045] px-1.5 py-0.5 text-[9px] tabular-nums text-slate-500">
            {filteredConversations.length}
          </span>
        </div>

        {filteredConversations.length > 0 ? (
          <div className="space-y-1">
            {filteredConversations.map((conversation) => {
              const isActive = conversation.id === activeConversationId;
              const isEditing = conversation.id === editingId;
              const isMenuOpen = conversation.id === openMenuId;

              return (
                <div
                  key={conversation.id}
                  className={`group relative rounded-xl ${
                    isActive
                      ? "bg-gradient-to-r from-white/[0.09] to-white/[0.035] ring-1 ring-inset ring-white/[0.07]"
                      : "hover:bg-white/[0.04]"
                  }`}
                >
                  {isActive && (
                    <span className="absolute bottom-2 left-0 top-2 w-[2px] rounded-full bg-gradient-to-b from-violet-300 to-cyan-200" />
                  )}

                  {isEditing ? (
                    <div className="flex items-center gap-1.5 p-2">
                      <input
                        autoFocus
                        aria-label="Conversation title"
                        value={editingTitle}
                        onChange={(event) =>
                          setEditingTitle(event.target.value)
                        }
                        onKeyDown={(event) => {
                          if (event.key === "Enter")
                            saveRename(conversation.id);
                          if (event.key === "Escape") setEditingId(null);
                        }}
                        className="h-8 min-w-0 flex-1 rounded-lg border border-violet-300/30 bg-black/20 px-2 text-xs text-white outline-none focus:ring-2 focus:ring-violet-400/20"
                      />
                      <button
                        type="button"
                        aria-label="Save conversation name"
                        onClick={() => saveRename(conversation.id)}
                        className="rounded-md p-1.5 text-emerald-300 hover:bg-emerald-300/10"
                      >
                        <Check size={14} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        aria-label="Cancel renaming"
                        onClick={() => setEditingId(null)}
                        className="rounded-md p-1.5 text-slate-400 hover:bg-white/[0.08]"
                      >
                        <X size={14} aria-hidden="true" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-1 px-2 py-1.5">
                        <button
                          type="button"
                          aria-pressed={isActive}
                          onClick={() => onSelectConversation(conversation.id)}
                          className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg py-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
                        >
                          <span
                            className={`flex size-7 shrink-0 items-center justify-center rounded-lg ${
                              isActive
                                ? "bg-violet-300/10 text-violet-200"
                                : "bg-white/[0.035] text-slate-500 group-hover:text-slate-300"
                            }`}
                          >
                            <Clock3 size={13} aria-hidden="true" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span
                              className={`block truncate text-[11px] font-medium ${
                                isActive ? "text-white" : "text-slate-400"
                              }`}
                            >
                              {conversation.title}
                            </span>
                            <span className="mt-1 block text-[9px] text-slate-600">
                              {formatConversationDate(conversation.updatedAt)}
                            </span>
                          </span>
                        </button>

                        <button
                          type="button"
                          aria-label={`Actions for ${conversation.title}`}
                          aria-expanded={isMenuOpen}
                          onClick={() =>
                            setOpenMenuId(isMenuOpen ? null : conversation.id)
                          }
                          className="rounded-md p-1.5 text-slate-500 opacity-0 transition hover:bg-white/[0.08] hover:text-slate-200 focus:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 group-hover:opacity-100"
                        >
                          <MoreHorizontal size={15} aria-hidden="true" />
                        </button>
                      </div>

                      {isMenuOpen && (
                        <div className="absolute right-2 top-10 z-20 w-36 rounded-xl border border-white/10 bg-[#191b24] p-1.5 shadow-2xl shadow-black/50">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(conversation.id);
                              setEditingTitle(conversation.title);
                              setOpenMenuId(null);
                            }}
                            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[11px] text-slate-300 hover:bg-white/[0.07] hover:text-white"
                          >
                            <Pencil size={13} aria-hidden="true" />
                            Rename
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setOpenMenuId(null);
                              void onDeleteConversation(conversation.id);
                            }}
                            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[11px] text-rose-300 hover:bg-rose-400/10"
                          >
                            <Trash2 size={13} aria-hidden="true" />
                            Delete
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mx-2 mt-5 rounded-xl border border-dashed border-white/[0.08] px-4 py-5 text-center">
            <Search
              size={16}
              className="mx-auto mb-2 text-slate-600"
              aria-hidden="true"
            />
            <p className="text-[11px] text-slate-400">
              No matching conversations
            </p>
            <p className="mt-1 text-[10px] text-slate-600">
              Try another search.
            </p>
          </div>
        )}
      </nav>

      <div className="relative shrink-0 border-t border-white/[0.07] p-3">
        <div className="rounded-xl border border-white/[0.06] bg-gradient-to-br from-white/[0.045] to-white/[0.015] p-3">
          <div className="flex items-center gap-2.5">
            <div className="relative flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-300/25 to-cyan-300/15 text-[11px] font-semibold text-violet-100 ring-1 ring-white/10">
              SA
              <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-[#111318] bg-emerald-300" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-semibold text-slate-200">
                Personal workspace
              </p>
              <p className="mt-0.5 flex items-center gap-1.5 text-[10px] text-slate-500">
                <Sparkles
                  size={10}
                  className="text-violet-300"
                  aria-hidden="true"
                />
                Gemini · Free tier
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-white/[0.06] pt-2.5 text-[9px] text-slate-600">
            <span>Lume AI Studio</span>
            <span>Preview · v0.1</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
