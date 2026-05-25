import { useState, useEffect } from 'react';
import API from '../services/api';
import { ShieldCheck, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Audit() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/audit/logs');
      if (data.success) {
        setLogs(data.data);
      }
    } catch (error) {
      toast.error('Error al cargar logs de auditoría');
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    if (statusFilter !== 'all' && log.status !== statusFilter) return false;

    if (dateFilter) {
      const logDate = new Date(log.created_at).toISOString().split('T')[0];
      if (logDate !== dateFilter) return false;
    }

    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'success':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-500/10 text-green-400 border border-green-500/20">Éxito</span>;
      case 'failed':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-500/10 text-red-400 border border-red-500/20">Fallido</span>;
      case 'warning':
        return <span className="px-2 py-1 text-xs rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">Advertencia</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-500/10 text-gray-400 border border-gray-500/20">{status}</span>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-teal-400" />
            Auditoría
          </h1>
          <p className="text-gray-400 text-sm mt-1">Logs de acceso y actividad del sistema.</p>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Estado</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          >
            <option value="all">Todos los estados</option>
            <option value="success">Éxito</option>
            <option value="failed">Fallido</option>
            <option value="warning">Advertencia</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Fecha</label>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          />
        </div>

        <button
          onClick={() => { setStatusFilter('all'); setDateFilter(''); }}
          className="text-sm text-gray-400 hover:text-white px-3 py-2.5 flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Limpiar filtros
        </button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-400">
            <thead className="text-xs text-gray-300 uppercase bg-gray-800 border-b border-gray-700">
              <tr>
                <th className="px-6 py-3">Fecha y Hora</th>
                <th className="px-6 py-3">Usuario (Email)</th>
                <th className="px-6 py-3">Acción</th>
                <th className="px-6 py-3">Recurso</th>
                <th className="px-6 py-3">IP</th>
                <th className="px-6 py-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center">Cargando...</td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center">No se encontraron registros.</td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">{log.user_email || 'Sistema'}</td>
                    <td className="px-6 py-4 font-medium text-gray-300">{log.action}</td>
                    <td className="px-6 py-4">{log.resource}</td>
                    <td className="px-6 py-4">{log.ip_address}</td>
                    <td className="px-6 py-4">{getStatusBadge(log.status)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}