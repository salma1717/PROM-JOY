export enum Sender {
  USER = 'user',
  BOT = 'bot'
}

export interface Message {
  id: string;
  text: string;
  sender: Sender;
  timestamp: Date;
  isError?: boolean;
}

export interface EmergencyResource {
  name: string;
  description: string;
  contact: string;
  url?: string;
  email?: string;
}
