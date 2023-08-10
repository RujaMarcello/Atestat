import { TableDataDto } from '../../generated/api';

export interface TableProps {
  data: TableDataDto | undefined;
  loading: boolean;
  getCurrentPage: (currentPage: number) => void;
}
