import { FriendDto } from '../../../../generated/api';

export interface FriendProps {
  addFriendRequest: (id: number, chatId: number) => void;
  deleteUserFromList: (id: number) => void;
  data: FriendDto;
}
