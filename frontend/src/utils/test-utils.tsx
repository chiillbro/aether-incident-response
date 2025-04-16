import { Message } from "@/types";

export const stressTestMessages: Message[] = Array.from({ length: 10000 }, (_, i) => ({
  id: `msg-${i}`,
  incidentId: 'incident-1',
  senderId: 'system',
  content: `Message ${i + 1}`,
  createdAt: String(new Date()),
  sender: { id: 'system', name: 'Stress Test', email: 'stress@test.com' },
}));
