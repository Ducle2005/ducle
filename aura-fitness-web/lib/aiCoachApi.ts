import { apiFetch } from "./api";

export const aiCoachApi = {
  getAdvice: () => apiFetch<string[]>("/ai-coach/advice"),
  sendMessage: (message: string, imageBase64?: string) => 
    apiFetch<{ reply: string }>("/ai-coach/chat", {
      method: "POST",
      body: JSON.stringify({ message, imageBase64 })
    })
};
