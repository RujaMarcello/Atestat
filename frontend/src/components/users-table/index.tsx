import Table from 'antd/es/table';
import { ColumnsType } from 'antd/lib/table';
import React, { useState } from 'react';

import { DataDto } from '../../generated/api';
import UserDataPopup from '../user-data-popup';
import styles from './index.module.scss';
interface TableProps {
  data: DataDto[];
}

const UserTable: React.FC<TableProps> = (data) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

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
        pagination={{ defaultCurrent: 1, total: 20 }}
        className={styles.tableStyle}
        dataSource={data.data}
        columns={columns}
        rowKey={(record) => record.id}
        onRow={() => {
          return {
            onClick: () => {
              showModal();
            },
          };
        }}
      ></Table>
      <UserDataPopup open={isModalOpen} onOk={() => handleOk()} onCancel={() => handleCancel()} />
    </>
  );
};

export default UserTable;
