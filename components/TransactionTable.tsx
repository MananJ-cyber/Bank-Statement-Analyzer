import React from 'react';
import { Transaction } from '../types';

interface TransactionTableProps {
  transactions: Transaction[];
}

const TransactionTable: React.FC<TransactionTableProps> = ({ transactions }) => {
  const downloadCSV = () => {
    const headers = ['date', 'time', 'transaction_type', 'party', 'description', 'amount', 'status', 'balance'];
    const csvContent = [
      headers.join(','),
      ...transactions.map(t => [
        t.date,
        t.time || '',
        t.transaction_type,
        `"${t.party.replace(/"/g, '""')}"`, // Escape quotes
        `"${t.description.replace(/"/g, '""')}"`,
        t.amount,
        t.status,
        t.balance !== null ? t.balance : ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'bank_statement_analysis.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
      <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
        <h3 className="font-semibold text-slate-800">Transactions ({transactions.length})</h3>
        <button
          onClick={downloadCSV}
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors shadow-sm"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download CSV
        </button>
      </div>
      
      <div className="overflow-auto custom-scrollbar flex-1">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50 sticky top-0 z-10">
            <tr>
              {['Date', 'Time', 'Type', 'Party', 'Description', 'Amount', 'Status', 'Balance'].map((header) => (
                <th key={header} className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap bg-slate-50">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {transactions.map((t, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-3 whitespace-nowrap text-sm text-slate-900 font-medium">{t.date}</td>
                <td className="px-6 py-3 whitespace-nowrap text-sm text-slate-500">{t.time || '-'}</td>
                <td className="px-6 py-3 whitespace-nowrap text-sm">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium 
                    ${t.transaction_type.toLowerCase().includes('credit') ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}>
                    {t.transaction_type}
                  </span>
                </td>
                <td className="px-6 py-3 text-sm text-slate-700 max-w-xs truncate" title={t.party}>{t.party}</td>
                <td className="px-6 py-3 text-sm text-slate-500 max-w-xs truncate" title={t.description}>{t.description}</td>
                <td className={`px-6 py-3 whitespace-nowrap text-sm font-medium ${t.transaction_type.toLowerCase().includes('credit') ? 'text-emerald-600' : 'text-slate-900'}`}>
                  {t.amount.toLocaleString()}
                </td>
                <td className="px-6 py-3 whitespace-nowrap text-sm text-slate-500">
                  <span className={`inline-flex items-center gap-1.5
                    ${t.status.toLowerCase() === 'failed' ? 'text-red-500' : 
                      t.status.toLowerCase() === 'pending' ? 'text-amber-500' : 'text-emerald-600'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${t.status.toLowerCase() === 'failed' ? 'bg-red-500' : t.status.toLowerCase() === 'pending' ? 'bg-amber-500' : 'bg-emerald-600'}`}></span>
                    {t.status}
                  </span>
                </td>
                <td className="px-6 py-3 whitespace-nowrap text-sm text-slate-500 font-mono">
                  {t.balance !== null ? t.balance.toLocaleString() : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionTable;