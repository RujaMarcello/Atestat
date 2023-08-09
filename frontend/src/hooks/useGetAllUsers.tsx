import React, { useEffect, useState } from 'react';

import { TableDataDto } from '../generated/api';
import api from '../utils/api';
const useGetAllUsers = () => {
  const [data, setData] = useState<TableDataDto | undefined>();
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);

  useEffect(() => {
    const fetcher = async () => {
      setLoading(true);
      const response = await api.user
        .usersGet({ token: localStorage.getItem('token') || '', page: page })
        .finally(() => setLoading(false));
      setData(response.data);
    };
    fetcher();
  }, [page]);

  const getCurrentPage = (currentPage: number) => {
    setPage(currentPage);
  };

  return { data, loading, getCurrentPage };
};

export default useGetAllUsers;
