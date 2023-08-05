import { UserDto } from '../../generated/api';

export interface UserDataPopupProps {
  open: boolean | undefined;
  onOk: () => void;
  onCancel: () => void;
  dataUser: UserDto | undefined;
  isLoading: boolean;
}
