import Table from 'antd/es/table';
import { ColumnsType } from 'antd/lib/table';
import React, { useState } from 'react';

import { DataDto, UserDto } from '../../generated/api';
import api from '../../utils/api';
import UserDataPopup from '../user-data-popup';
import styles from './index.module.scss';
import { TableProps } from './map';

const UserTable: React.FC<TableProps> = ({ data, getCurrentPage, loading }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clickedUser, setClickedUser] = useState<UserDto | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleRowClick = async (email: string) => {
    try {
      setIsLoading(true);
      await api.user
        .userGet({
          token: localStorage.getItem('token') || '',
          email: email,
        })

        .then((res) => {
          setIsLoading(false);
          setClickedUser(res.data);
        });
    } catch (error) {
      console.log(error);
    }
  };
  const columns: ColumnsType<DataDto> = [
    {
      title: 'First Name',
      dataIndex: 'firstName',
      key: 'firstName',
      sorter: (a, b) => a.firstName.localeCompare(b.firstName),
      sortDirections: ['descend', 'ascend'],
    },
    {
      title: 'Last Name',
      dataIndex: 'lastName',
      key: 'lastName',
      sorter: (a, b) => a.firstName.localeCompare(b.firstName),
      sortDirections: ['descend', 'ascend'],
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Register Date',
      dataIndex: 'created_at',
      key: 'created_at',
      sorter: (a, b) => a.firstName.localeCompare(b.firstName),
      sortDirections: ['descend', 'ascend'],
    },
  ];
  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <Table
        loading={loading}
        pagination={{ defaultCurrent: 1, total: data?.page }}
        className={styles.tableStyle}
        dataSource={data?.data}
        columns={columns}
        rowKey={(record) => record.id}
        onChange={(page) => {
          getCurrentPage(page.current || 1);
        }}
        onRow={(record, rowIndex) => {
          return {
            onClick: () => {
              handleRowClick(record.email);
              showModal();
            },
          };
        }}
      ></Table>
      <UserDataPopup
        isLoading={isLoading}
        dataUser={clickedUser}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      />
    </>
  );
};

export default UserTable;
