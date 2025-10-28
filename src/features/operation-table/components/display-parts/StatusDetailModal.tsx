import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
} from '@mui/material';
import type { StatusPiece, Operation } from '@/lib/api/contracts/operationTable.contract';

interface StatusDetailModalProps {
  open: boolean;
  onClose: () => void;
  piece: StatusPiece | null;
  vehicle: Operation | null;
}

const formatDateTime = (date: Date) => {
  return new Date(date).toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getStatusTypeLabel = (statusType: string) => {
  const labels: Record<string, string> = {
    'rental': '貸渡中',
    'idle': 'アイドル',
    'maintenance': '整備中',
    'charter': 'チャーター',
    'reserved': '予約済み',
    'transfer': '移動中',
    'other': 'その他',
  };
  return labels[statusType] || statusType;
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <Box sx={{ mb: 1.5 }}>
    <Typography variant="caption" color="text.secondary" display="block">
      {label}
    </Typography>
    <Typography variant="body2" fontWeight="medium">
      {value}
    </Typography>
  </Box>
);

export function StatusDetailModal({ open, onClose, piece, vehicle }: StatusDetailModalProps) {
  if (!piece || !vehicle) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ bgcolor: piece.pieceColor, color: 'white', pb: 2 }}>
        <Typography variant="h6">ステータス詳細</Typography>
      </DialogTitle>
      <DialogContent dividers sx={{ pt: 3 }}>
        {/* Vehicle Information */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="primary" gutterBottom sx={{ mb: 2 }}>
            車両情報
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
            <InfoRow label="車両番号" value={vehicle.registNumber} />
            <InfoRow label="車名" value={vehicle.carName} />
            <InfoRow label="クラス" value={vehicle.classCode} />
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Status Information */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="primary" gutterBottom sx={{ mb: 2 }}>
            ステータス情報
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
            <InfoRow label="ステータス種別" value={getStatusTypeLabel(piece.statusType)} />
            <Box sx={{ mb: 1.5 }}>
              <Typography variant="caption" color="text.secondary" display="block">
                状態
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                <Box 
                  sx={{ 
                    width: 16, 
                    height: 16, 
                    bgcolor: piece.pieceColor, 
                    borderRadius: 1 
                  }} 
                />
                <Typography variant="body2" fontWeight="medium">
                  {piece.tooltipMessage.split('\n')[0]}
                </Typography>
              </Box>
            </Box>
            <InfoRow label="開始時刻" value={formatDateTime(piece.startTime)} />
            <InfoRow label="終了時刻" value={formatDateTime(piece.endTime)} />
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Additional Details */}
        {piece.details && Object.keys(piece.details).length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="primary" gutterBottom sx={{ mb: 2 }}>
              詳細情報
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
              {Object.entries(piece.details).map(([key, value]) => {
                if (value === undefined || value === null) return null;
                const labelMap: Record<string, string> = {
                  reservationNumber: '予約番号',
                  customerName: '顧客名',
                  pickupLocation: '出発地',
                  returnLocation: '返却地',
                  notes: '備考',
                };
                return (
                  <InfoRow 
                    key={key} 
                    label={labelMap[key] || key} 
                    value={String(value)} 
                  />
                );
              })}
            </Box>
          </Box>
        )}

        {/* Full Tooltip Message */}
        {piece.tooltipMessage && (
          <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
              メッセージ
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
              {piece.tooltipMessage}
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="contained">
          閉じる
        </Button>
      </DialogActions>
    </Dialog>
  );
}
