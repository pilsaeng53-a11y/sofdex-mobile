import React from 'react';
import { Download } from 'lucide-react';

function toCSV(records) {
  const headers = [
    '고객명', '고객지갑', '매입금액(USDT)', 'SOF단가', '프로모션(%)',
    '기본수량', '최종수량', '추천인수량', '센터피수량', '상태', '제출일'
  ];
  const rows = records.map(r => [
    r.customer_name || '',
    r.customer_wallet || '',
    r.purchase_amount || 0,
    r.sof_unit_price || 0,
    r.promotion_percent || 0,
    r.sof_unit_price ? ((r.purchase_amount || 0) / r.sof_unit_price).toFixed(4) : 0,
    r.sof_quantity || 0,
    r.recommender_quantity || 0,
    r.center_fee_quantity || 0,
    r.status || '',
    r.submitted_at ? new Date(r.submitted_at).toLocaleString('ko-KR') : '',
  ]);
  const escape = v => `"${String(v).replace(/"/g, '""')}"`;
  return [headers, ...rows].map(row => row.map(escape).join(',')).join('\n');
}

export default function ExportTools({ records = [] }) {
  function downloadCSV() {
    const csv = toCSV(records);
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SOF_판매내역_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button onClick={downloadCSV} disabled={records.length === 0}
      className="flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-bold transition-all disabled:opacity-40"
      style={{ background: 'rgba(0,212,170,0.08)', border: '1px solid rgba(0,212,170,0.2)', color: '#00d4aa' }}>
      <Download className="w-3.5 h-3.5" />
      CSV 내보내기 ({records.length}건)
    </button>
  );
}