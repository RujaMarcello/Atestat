export interface ConversationProps {
  name: string;
  lastMessageSentAt: string;
  profilePictureUrl: string;
  lastLineText: string;
  onClick?: () => void;
}
