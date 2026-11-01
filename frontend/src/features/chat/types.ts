export type MessageRole = "user" | "assistant";

export type ProviderId = "gemini" | "openai" | "anthropic";

export type ModelAvailability = "available" | "not-configured";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: string;
}

export interface ConversationSummary {
  id: string;
  title: string;
  updatedAt: string;
}

export interface ChatModel {
  id: string;
  name: string;
  provider: ProviderId;
  availability: ModelAvailability;
}
