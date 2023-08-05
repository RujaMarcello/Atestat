import { FriendDto } from '../../../../generated/api';

export interface AddFriendsProps {
  data: FriendDto;
  deleteUserFromList: (id: number) => void;
}
