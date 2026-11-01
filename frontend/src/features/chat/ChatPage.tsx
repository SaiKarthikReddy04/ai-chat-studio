import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  Compass,
  PenLine,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { ConversationSidebar } from "./components/ConversationSidebar";
import { MessageBubble } from "./components/MessageBubble";
import { MessageComposer } from "./components/MessageComposer";
import {
  createConversation,
  deleteConversation,
  listConversations,
  listMessages,
  listModels,
  renameConversation,
  sendMessage,
} from "./api/chatApi";

import type { ChatMessage, ChatModel, ConversationSummary } from "./types";

interface LocalConversation extends ConversationSummary {
  messages: ChatMessage[];
}

const initialConversation: LocalConversation = {
  id: "local-welcome",
  title: "New conversation",
  updatedAt: new Date().toISOString(),
  messages: [],
};

const starterPrompts = [
  {
    icon: Compass,
    label: "Explore an idea",
    prompt: "Help me explore an idea and find a fresh perspective.",
  },
  {
    icon: PenLine,
    label: "Shape my writing",
    prompt: "Help me turn these rough thoughts into clear writing.",
  },
  {
    icon: WandSparkles,
    label: "Make a clear plan",
    prompt: "Help me break a big goal into a simple, practical plan.",
  },
];

export function ChatPage() {
  const [conversations, setConversations] = useState<LocalConversation[]>([
    initialConversation,
  ]);
  const [activeConversationId, setActiveConversationId] = useState(
    initialConversation.id,
  );
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [models, setModels] = useState<ChatModel[]>([]);
  const [selectedModelId, setSelectedModelId] = useState("");
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const modelMenuRef = useRef<HTMLDivElement>(null);

  const selectedModel =
    models.find(
      (model) =>
        model.id === selectedModelId && model.availability === "available",
    ) ?? null;

  const activeConversation = conversations.find(
    (conversation) => conversation.id === activeConversationId,
  );
  const messages = activeConversation?.messages ?? [];

  useEffect(() => {
    let cancelled = false;

    async function loadConversations() {
      try {
        const savedConversations = await listConversations();

        if (cancelled || savedConversations.length === 0) {
          return;
        }

        const firstConversation = savedConversations[0];
        const savedMessages = await listMessages(firstConversation.id);

        if (cancelled) {
          return;
        }

        setConversations(
          savedConversations.map((conversation, index) => ({
            ...conversation,
            messages: index === 0 ? savedMessages : [],
          })),
        );
        setActiveConversationId(firstConversation.id);
      } catch (error) {
        console.error("Could not load conversations:", error);
      }
    }

    void loadConversations();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadModels() {
      try {
        const catalog = await listModels();

        if (cancelled) return;

        setModels(catalog);

        const preferredModel =
          catalog.find(
            (model) =>
              model.provider === "gemini" && model.availability === "available",
          ) ?? catalog.find((model) => model.availability === "available");

        setSelectedModelId(preferredModel?.id ?? "");
      } catch (error) {
        console.error("Could not load models:", error);
      }
    }

    void loadModels();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (
        modelMenuRef.current &&
        !modelMenuRef.current.contains(event.target as Node)
      ) {
        setIsModelMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsModelMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  async function handleNewChat() {
    try {
      const conversation = await createConversation();

      setConversations((current) => [
        { ...conversation, messages: [] },
        ...current,
      ]);
      setActiveConversationId(conversation.id);
      setDraft("");
    } catch (error) {
      console.error("Could not create a conversation:", error);
    }
  }

  async function handleSelectConversation(conversationId: string) {
    setActiveConversationId(conversationId);

    try {
      const savedMessages = await listMessages(conversationId);

      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === conversationId
            ? { ...conversation, messages: savedMessages }
            : conversation,
        ),
      );
    } catch (error) {
      console.error("Could not load conversation messages:", error);
    }
  }

  async function handleSend() {
    const content = draft.trim();

    const modelToSend = selectedModel;

    if (!content || isSending || !activeConversation || !modelToSend) {
      return;
    }

    const isFirstMessage = activeConversation.messages.length === 0;
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      createdAt: new Date().toISOString(),
    };

    setDraft("");
    setIsSending(true);

    let conversationId = activeConversation.id;

    try {
      if (conversationId === "local-welcome") {
        const created = await createConversation(content.slice(0, 40));
        conversationId = created.id;
        setActiveConversationId(created.id);

        setConversations((current) => [
          { ...created, messages: [userMessage] },
          ...current.filter(
            (conversation) => conversation.id !== "local-welcome",
          ),
        ]);
      } else {
        setConversations((current) =>
          current.map((conversation) =>
            conversation.id === conversationId
              ? {
                  ...conversation,
                  messages: [...conversation.messages, userMessage],
                }
              : conversation,
          ),
        );
      }

      const assistantMessage = await sendMessage(
        conversationId,
        content,
        selectedModel.provider,
        selectedModel.id,
      );

      let savedTitle: string | undefined;
      if (isFirstMessage && activeConversation.id !== "local-welcome") {
        try {
          const renamed = await renameConversation(
            conversationId,
            content.slice(0, 40),
          );
          savedTitle = renamed.title;
        } catch (error) {
          console.error(
            "The message was sent, but the title could not be saved:",
            error,
          );
        }
      }

      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === conversationId
            ? {
                ...conversation,
                title: savedTitle ?? conversation.title,
                updatedAt: assistantMessage.createdAt,
                messages: [...conversation.messages, assistantMessage],
              }
            : conversation,
        ),
      );
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          error instanceof Error
            ? `I couldn’t send that message: ${error.message}`
            : "I couldn’t send that message. Please try again.",
        createdAt: new Date().toISOString(),
      };

      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === conversationId
            ? {
                ...conversation,
                messages: [...conversation.messages, errorMessage],
              }
            : conversation,
        ),
      );
    } finally {
      setIsSending(false);
    }
  }

  async function handleRenameConversation(
    conversationId: string,
    title: string,
  ) {
    try {
      const renamed = await renameConversation(conversationId, title);

      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === conversationId
            ? { ...conversation, ...renamed }
            : conversation,
        ),
      );
    } catch (error) {
      window.alert(
        error instanceof Error
          ? `Could not rename conversation: ${error.message}`
          : "Could not rename conversation.",
      );
    }
  }

  async function handleDeleteConversation(conversationId: string) {
    const conversation = conversations.find(
      (item) => item.id === conversationId,
    );

    if (!conversation) return;

    const confirmed = window.confirm(
      `Delete "${conversation.title}" and its messages? This cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      await deleteConversation(conversationId);

      const remaining = conversations.filter(
        (item) => item.id !== conversationId,
      );

      if (remaining.length > 0) {
        setConversations(remaining);

        if (activeConversationId === conversationId) {
          setActiveConversationId(remaining[0].id);
        }
      } else {
        const freshConversation = {
          ...initialConversation,
          messages: [],
        };

        setConversations([freshConversation]);
        setActiveConversationId(freshConversation.id);
      }
    } catch (error) {
      window.alert(
        error instanceof Error
          ? `Could not delete conversation: ${error.message}`
          : "Could not delete conversation.",
      );
    }
  }

  return (
    <div className="relative flex h-screen min-h-[640px] overflow-hidden bg-[#090a10] text-slate-100">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 68% 8%, rgba(109, 73, 190, 0.16), transparent 38%), radial-gradient(ellipse at 35% 95%, rgba(42, 105, 122, 0.08), transparent 34%)",
        }}
      />

      <div className="relative z-10 flex min-h-0 w-full">
        <ConversationSidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelectConversation}
          onNewChat={handleNewChat}
          onRenameConversation={handleRenameConversation}
          onDeleteConversation={handleDeleteConversation}
        />

        <main className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-[76px] shrink-0 items-center justify-between border-b border-white/[0.07] px-5 sm:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-violet-300/20 bg-violet-300/[0.08] text-violet-200 shadow-[0_0_24px_rgba(167,139,250,0.12)]">
                <Sparkles size={17} aria-hidden="true" />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold tracking-wide text-white">
                  AI Chat Studio
                </p>
                <p className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  Your private thinking space
                </p>
              </div>
            </div>

            <div ref={modelMenuRef} className="relative">
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={isModelMenuOpen}
                onClick={() => setIsModelMenuOpen((open) => !open)}
                className="flex h-11 min-w-[220px] items-center gap-2.5 rounded-xl border border-white/[0.09] bg-white/[0.035] px-3 text-left shadow-[0_8px_30px_rgba(0,0,0,0.18)] transition hover:border-violet-300/20 hover:bg-white/[0.055] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-violet-300/10 text-violet-200">
                  <Sparkles size={14} aria-hidden="true" />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[11px] font-medium text-slate-100">
                    {selectedModel?.name ?? "Choose a model"}
                  </span>
                  <span className="mt-0.5 block text-[9px] capitalize text-slate-500">
                    {selectedModel
                      ? `${selectedModel.provider} · Ready`
                      : "Select an available model"}
                  </span>
                </span>

                <span
                  className={`shrink-0 text-slate-500 transition ${
                    isModelMenuOpen ? "rotate-180" : ""
                  }`}
                  aria-hidden="true"
                >
                  ▾
                </span>
              </button>

              {isModelMenuOpen && (
                <div
                  role="menu"
                  aria-label="Choose a model"
                  className="absolute right-0 top-full z-50 mt-2 w-[280px] overflow-hidden rounded-2xl border border-white/10 bg-[#11131b]/95 p-1.5 shadow-[0_20px_60px_rgba(0,0,0,0.65)] backdrop-blur-xl"
                >
                  <div className="flex items-center justify-between border-b border-white/[0.06] px-3 py-2.5">
                    <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Model library
                    </span>
                    <span className="text-[9px] text-slate-600">
                      {
                        models.filter(
                          (model) => model.availability === "available",
                        ).length
                      }{" "}
                      ready
                    </span>
                  </div>

                  <div className="max-h-72 overflow-y-auto py-1">
                    {models.map((model) => {
                      const isAvailable = model.availability === "available";
                      const isSelected = model.id === selectedModelId;

                      return (
                        <button
                          key={`${model.provider}-${model.id}`}
                          type="button"
                          role="menuitemradio"
                          aria-checked={isSelected}
                          disabled={!isAvailable}
                          onClick={() => {
                            setSelectedModelId(model.id);
                            setIsModelMenuOpen(false);
                          }}
                          className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition ${
                            isAvailable
                              ? "text-slate-300 hover:bg-white/[0.06] hover:text-white"
                              : "cursor-not-allowed text-slate-600"
                          } ${isSelected ? "bg-violet-300/[0.08]" : ""}`}
                        >
                          <span
                            className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
                              isAvailable
                                ? "bg-violet-300/10 text-violet-200"
                                : "bg-white/[0.025] text-slate-700"
                            }`}
                          >
                            <Sparkles size={14} aria-hidden="true" />
                          </span>

                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[11px] font-medium">
                              {model.name}
                            </span>
                            <span className="mt-0.5 block text-[9px] capitalize text-slate-500">
                              {model.provider}
                            </span>
                          </span>

                          <span
                            className={`shrink-0 rounded-full px-2 py-1 text-[8px] font-medium ${
                              isAvailable
                                ? "border border-emerald-300/10 bg-emerald-300/[0.06] text-emerald-200"
                                : "border border-white/[0.05] bg-white/[0.025] text-slate-600"
                            }`}
                          >
                            {isAvailable
                              ? isSelected
                                ? "Selected"
                                : "Ready"
                              : "Add key"}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="border-t border-white/[0.06] px-3 py-2 text-[9px] text-slate-600">
                    Provider access follows your backend configuration.
                  </div>
                </div>
              )}
            </div>
          </header>

          <section
            aria-label="Chat messages"
            className="min-h-0 flex-1 overflow-y-auto px-5 sm:px-8"
          >
            {messages.length === 0 ? (
              <div className="mx-auto flex min-h-full w-full max-w-5xl flex-col justify-center py-10 sm:py-14">
                <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
                  <div className="relative z-10">
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-300/15 bg-violet-300/[0.055] px-3 py-1.5">
                      <Sparkles
                        size={12}
                        className="text-violet-300"
                        aria-hidden="true"
                      />
                      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-200/90">
                        A space for clearer thinking
                      </span>
                    </div>

                    <h1 className="max-w-2xl text-4xl font-semibold leading-[1.08] tracking-[-0.045em] text-white sm:text-5xl xl:text-6xl">
                      Make room for
                      <span className="block bg-gradient-to-r from-violet-200 via-fuchsia-200 to-cyan-200 bg-clip-text pb-2 text-transparent">
                        better ideas.
                      </span>
                    </h1>

                    <p className="mt-5 max-w-lg text-sm leading-7 text-slate-400 sm:text-base">
                      A thoughtful place to ask, write, plan, and make sense of
                      what comes next. Start anywhere.
                    </p>

                    <div className="mt-9">
                      <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                        A few places to begin
                      </p>

                      <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                        {starterPrompts.map((item) => {
                          const Icon = item.icon;

                          return (
                            <button
                              key={item.label}
                              type="button"
                              onClick={() => setDraft(item.prompt)}
                              className="group flex min-h-[92px] flex-col justify-between rounded-2xl border border-white/[0.075] bg-white/[0.025] p-3.5 text-left transition duration-200 hover:-translate-y-0.5 hover:border-violet-300/25 hover:bg-violet-300/[0.055] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
                            >
                              <span className="flex items-center justify-between">
                                <Icon
                                  size={15}
                                  className="text-violet-300/90"
                                  aria-hidden="true"
                                />
                                <ArrowUpRight
                                  size={13}
                                  className="text-slate-600 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-violet-200"
                                  aria-hidden="true"
                                />
                              </span>
                              <span className="mt-3 text-[11px] font-medium text-slate-300">
                                {item.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="relative mx-auto hidden aspect-square w-full max-w-[390px] items-center justify-center lg:flex">
                    <div className="absolute inset-[12%] rounded-full border border-white/[0.06]" />
                    <div className="absolute inset-[23%] rounded-full border border-violet-200/[0.09]" />
                    <div className="absolute inset-[34%] rounded-full border border-white/[0.08]" />

                    <div
                      className="absolute inset-[18%] rounded-full opacity-70 blur-3xl"
                      style={{
                        background:
                          "conic-gradient(from 210deg, rgba(101,75,190,.15), rgba(166,123,255,.55), rgba(88,197,214,.32), rgba(101,75,190,.15))",
                      }}
                    />

                    <div
                      className="relative flex size-40 items-center justify-center rounded-full border border-white/15 shadow-[0_0_90px_rgba(157,119,255,0.22),inset_0_0_40px_rgba(255,255,255,0.08)]"
                      style={{
                        background:
                          "radial-gradient(circle at 34% 28%, rgba(230,215,255,.95), rgba(155,119,231,.85) 18%, rgba(74,66,130,.9) 48%, rgba(17,21,38,.98) 76%)",
                      }}
                    >
                      <div className="absolute inset-3 rounded-full border border-white/15" />
                      <Sparkles
                        size={34}
                        strokeWidth={1.25}
                        className="text-white drop-shadow-[0_0_18px_rgba(255,255,255,0.9)]"
                        aria-hidden="true"
                      />
                    </div>

                    <div className="absolute right-[2%] top-[26%] rounded-xl border border-white/10 bg-[#14141d]/80 px-3 py-2 shadow-xl backdrop-blur">
                      <p className="text-[9px] uppercase tracking-[0.16em] text-slate-500">
                        Model
                      </p>
                      <p className="mt-1 text-[11px] font-medium text-slate-200">
                        Gemini Flash
                      </p>
                    </div>

                    <div className="absolute bottom-[15%] left-[0%] rounded-xl border border-white/10 bg-[#14141d]/80 px-3 py-2 shadow-xl backdrop-blur">
                      <p className="text-[9px] uppercase tracking-[0.16em] text-slate-500">
                        Workspace
                      </p>
                      <p className="mt-1 text-[11px] font-medium text-slate-200">
                        Ready when you are
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mx-auto flex min-h-full max-w-3xl flex-col gap-8 py-8 sm:py-10">
                <div className="mb-1 flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500">
                  <span className="size-1.5 rounded-full bg-violet-300" />
                  Conversation
                </div>

                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}

                {isSending && (
                  <div
                    role="status"
                    className="flex items-center gap-3 text-xs text-slate-500"
                  >
                    <span className="flex size-7 items-center justify-center rounded-full border border-violet-300/15 bg-violet-300/[0.06] text-violet-200">
                      <Sparkles size={13} aria-hidden="true" />
                    </span>
                    Gemini is gathering its thoughts…
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </section>

          <div className="shrink-0 px-4 pb-5 sm:px-8 sm:pb-7">
            <div className="mx-auto max-w-3xl">
              <MessageComposer
                value={draft}
                onChange={setDraft}
                onSubmit={handleSend}
                isSending={isSending}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
