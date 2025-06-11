import Badge from '../ui/Badge';

type StatusType = 'success' | 'failed' | 'pending' | 'unknown' | 'failure';

interface StatusBadgeProps {
  status: StatusType;
  confirmations?: number;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const getVariant = (status: StatusType) => {
    switch (status) {
      case 'success':
        return 'success';
      case 'failed':
      case 'failure':
        return 'error';
      case 'pending':
        return 'warning';
      case 'unknown':
      default:
        return 'neutral';
    }
  };

  const getLabel = (status: StatusType) => {
    switch (status) {
      case 'success':
        return 'Success';
      case 'failed':
      case 'failure':
        return 'Failed';
      case 'pending':
        return 'Pending';
      case 'unknown':
      default:
        return 'Unknown';
    }
  };

  return (
    <Badge variant={getVariant(status)} size="sm">
      {getLabel(status)}
    </Badge>
  );
};

export default StatusBadge; 