import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, BarChart3, AlertTriangle, Users } from 'lucide-react';

const ROLE_COLORS = {
  admin:    'text-red-400 bg-red-400/10 border-red-400/20',
  analyst:  'text-blue-400 bg-blue-400/10 border-blue-400/20',
  auditor:  'text-amber-400 bg-amber-400/10 border-amber-400/20',
  operator: 'text-gray-400 bg-gray-400/10 border-gray-400/20',
};

export default function Dashboard() {
  const { user, can } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Bienvenido, {user?.name}</p>
      </div>

      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium ${ROLE_COLORS[user?.role]}`}>
        <ShieldCheck className="w-4 h-4" />
        Rol: {user?.role?.toUpperCase()}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {can('dashboard:read') && (
          <div
            onClick={() => navigate('/dashboard')}
            className="bg-gray-900 border border-gray-800 rounded-xl p-5 cursor-pointer hover:bg-gray-800 transition-colors"
          >
            <BarChart3 className="w-6 h-6 text-blue-400 mb-3" />
            <h3 className="text-white font-medium mb-1">Analítica</h3>
            <p className="text-gray-400 text-sm">Reportes y dashboards de datos.</p>
          </div>
        )}
        {can('audit:read') && (
          <div
            onClick={() => navigate('/audit')}
            className="bg-gray-900 border border-gray-800 rounded-xl p-5 cursor-pointer hover:bg-gray-800 transition-colors"
          >
            <ShieldCheck className="w-6 h-6 text-teal-400 mb-3" />
            <h3 className="text-white font-medium mb-1">Auditoría</h3>
            <p className="text-gray-400 text-sm">Logs de acceso y actividad.</p>
          </div>
        )}
        {can('risks:read') && (
          <div
            onClick={() => {}} // Not implemented in this request
            className="bg-gray-900 border border-gray-800 rounded-xl p-5 cursor-pointer hover:bg-gray-800 transition-colors"
          >
            <AlertTriangle className="w-6 h-6 text-amber-400 mb-3" />
            <h3 className="text-white font-medium mb-1">Riesgos</h3>
            <p className="text-gray-400 text-sm">Matriz de riesgos identificados.</p>
          </div>
        )}
        {can('*') && (
          <div
            onClick={() => navigate('/users')}
            className="bg-gray-900 border border-gray-800 rounded-xl p-5 cursor-pointer hover:bg-gray-800 transition-colors"
          >
            <Users className="w-6 h-6 text-red-400 mb-3" />
            <h3 className="text-white font-medium mb-1">Usuarios</h3>
            <p className="text-gray-400 text-sm">Gestión de accesos y roles.</p>
          </div>
        )}
      </div>

      <div className="bg-teal-500/5 border border-teal-500/20 rounded-xl p-5">
        <h3 className="text-teal-400 font-medium mb-2">✅ Módulo 1 — Seguridad implementada</h3>
        <ul className="text-gray-400 text-sm space-y-1">
          <li>• Autenticación JWT con expiración de 8 horas</li>
          <li>• RBAC con 4 roles: Admin, Analista, Auditor, Operador</li>
          <li>• Auditoría automática de acciones (login/logout)</li>
          <li>• Rutas protegidas por permiso granular</li>
        </ul>
      </div>
    </div>
  );
}
