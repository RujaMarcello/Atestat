import Table from 'antd/es/table';
import { ColumnsType } from 'antd/lib/table';
import React, { useState } from 'react';

import { DataDto, TableDataDto } from '../../generated/api';
import UserDataPopup from '../user-data-popup';
import styles from './index.module.scss';
interface TableProps {
  data: TableDataDto | undefined;
  loading: boolean;
  getCurrentPage: (currentPage: number) => void;
}

const UserTable: React.FC<TableProps> = ({ data, getCurrentPage, loading }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  console.log(data);
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
        onRow={() => {
          return {
            onClick: () => {
              showModal();
            },
          };
        }}
      ></Table>
      <UserDataPopup open={isModalOpen} onOk={handleOk} onCancel={handleCancel} />
    </>
  );
};

export default UserTable;
