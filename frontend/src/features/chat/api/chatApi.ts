import type { ChatMessage, ConversationSummary } from "../types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8001/api/v1";

interface ApiConversation {
  id: string;
  title: string;
  updated_at: string;
}

interface ApiMessage {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;

    try {
      const body = await response.json();
      if (typeof body.detail === "string") {
        message = body.detail;
      }
    } catch {
      // Keep the status-based message if the response isn't JSON.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

function toConversation(data: ApiConversation): ConversationSummary {
  return {
    id: data.id,
    title: data.title,
    updatedAt: data.updated_at,
  };
}

function toMessage(data: ApiMessage): ChatMessage {
  return {
    id: data.id,
    role: data.role,
    content: data.content,
    createdAt: data.created_at,
  };
}

export async function listConversations(): Promise<ConversationSummary[]> {
  const data = await request<ApiConversation[]>("/conversations");
  return data.map(toConversation);
}

export async function createConversation(
  title = "New conversation",
): Promise<ConversationSummary> {
  const data = await request<ApiConversation>("/conversations", {
    method: "POST",
    body: JSON.stringify({ title }),
  });

  return toConversation(data);
}

export async function listMessages(
  conversationId: string,
): Promise<ChatMessage[]> {
  const data = await request<ApiMessage[]>(
    `/conversations/${conversationId}/messages`,
  );

  return data.map(toMessage);
}

export async function sendMessage(
  conversationId: string,
  content: string,
  model = "gemini-3.6-flash",
): Promise<ChatMessage> {
  const data = await request<ApiMessage>(
    `/conversations/${conversationId}/messages`,
    {
      method: "POST",
      body: JSON.stringify({ content, model }),
    },
  );

  return toMessage(data);
}

export async function renameConversation(
  conversationId: string,
  title: string,
): Promise<ConversationSummary> {
  const data = await request<ApiConversation>(
    `/conversations/${conversationId}`,
    {
      method: "PATCH",
      body: JSON.stringify({ title }),
    },
  );

  return toConversation(data);
}

export async function deleteConversation(
  conversationId: string,
): Promise<void> {
  await request<void>(`/conversations/${conversationId}`, {
    method: "DELETE",
  });
}