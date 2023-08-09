import { FC } from 'react';

import UserTable from '../../../components/users-table';
import useGetAllUsers from '../../../hooks/useGetAllUsers';

const AllUsers: FC = () => {
  const { data, loading, getCurrentPage } = useGetAllUsers();

  return <UserTable loading={loading} getCurrentPage={getCurrentPage} data={data} />;
};

export default AllUsers;
