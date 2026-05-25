import { useNavigate } from 'react-router-dom';
import { ShieldX } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Unauthorized() {
  const navigate = useNavigate();
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <ShieldX className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h1 className="text-2xl font-semibold text-white mb-2">Acceso denegado</h1>
        <p className="text-gray-400 mb-1">Tu rol <span className="text-red-400 font-medium">({user?.role})</span> no tiene permisos para esta sección.</p>
        <p className="text-gray-500 text-sm mb-6">Contacta al administrador del sistema.</p>
        <button onClick={() => navigate('/dashboard')}
          className="bg-teal-500 text-gray-950 font-medium px-6 py-2.5 rounded-lg hover:bg-teal-400 transition text-sm">
          Volver al Dashboard
        </button>
      </div>
    </div>
  );
}
