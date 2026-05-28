import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, ShieldAlert, Users, LogOut, BarChart3, AlertTriangle, FileText } from 'lucide-react';

export default function Sidebar() {
  const { user, can, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, permission: 'dashboard:read' },
    { name: 'Analítica', path: '/analytics', icon: BarChart3 },
    { name: 'Auditoría', path: '/audit', icon: ShieldAlert, permission: 'audit:read' },
    { name: 'Políticas ISO', path: '/policies', icon: FileText, permission: 'policies:read' },
    { name: 'Riesgos', path: '/risks', icon: AlertTriangle, permission: 'risks:read' },
    { name: 'Usuarios', path: '/users', icon: Users, role: 'admin' },
  ];

  return (
    <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col h-screen fixed top-0 left-0">
      <div className="h-16 flex items-center px-6 border-b border-gray-800">
        <h1 className="text-xl font-bold text-white tracking-wide">Sentinel</h1>
      </div>

      <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          // Check permissions and roles
          const hasAccess = item.role
            ? user?.role === item.role
            : item.permission
              ? can(item.permission)
              : true;

          if (!hasAccess) return null;

          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-500/10 text-blue-400 font-medium'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {item.name}
            </NavLink>
          );
        })}
      </div>

      <div className="p-4 border-t border-gray-800">
        <div className="flex flex-col gap-1 mb-4 px-2">
          <span className="text-sm font-medium text-gray-200 truncate">{user?.name}</span>
          <span className="text-xs text-gray-500 truncate">{user?.email}</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-red-400 hover:bg-red-400/10 transition-colors text-left"
        >
          <LogOut className="w-5 h-5" />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
