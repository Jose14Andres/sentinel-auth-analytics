import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { risksService } from '../services/risksService';
import { ShieldAlert, Plus, Edit2, Trash2, X, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Risks() {
  const { can } = useAuth();
  const [risks, setRisks] = useState([]);
  const [summary, setSummary] = useState({ bajo: 0, medio: 0, alto: 0, critico: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRisk, setEditingRisk] = useState(null);
  const [formData, setFormData] = useState({
    title: '', description: '', category: '', probability: 'baja', impact: 'bajo', mitigation: '', responsible: '', status: 'activo'
  });

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    try {
      const [risksRes, summaryRes] = await Promise.all([
        risksService.getAll(),
        risksService.getSummary()
      ]);
      setRisks(risksRes.data.data);
      setSummary(summaryRes.data.data);
    } catch (err) {
      toast.error('Error al cargar riesgos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (risk = null) => {
    if (risk) {
      setEditingRisk(risk);
      setFormData({
        title: risk.title,
        description: risk.description,
        category: risk.category,
        probability: risk.probability,
        impact: risk.impact,
        mitigation: risk.mitigation,
        responsible: risk.responsible,
        status: risk.status
      });
    } else {
      setEditingRisk(null);
      setFormData({
        title: '', description: '', category: '', probability: 'baja', impact: 'bajo', mitigation: '', responsible: '', status: 'activo'
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRisk(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRisk) {
        await risksService.update(editingRisk.id, formData);
        toast.success('Riesgo actualizado');
      } else {
        await risksService.create(formData);
        toast.success('Riesgo creado');
      }
      handleCloseModal();
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al guardar');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar riesgo?')) return;
    try {
      await risksService.remove(id);
      toast.success('Riesgo eliminado');
      fetchData();
    } catch (err) {
      toast.error('Error al eliminar');
    }
  };

  const getLevelBadge = (level) => {
    const colors = {
      critico: 'bg-red-500/20 text-red-400',
      alto: 'bg-red-400/20 text-red-400',
      medio: 'bg-amber-500/20 text-amber-400',
      bajo: 'bg-green-500/20 text-green-400'
    };
    return colors[level] || 'bg-gray-500/20 text-gray-400';
  };

  const filteredRisks = risks.filter(risk => {
    const search = searchTerm.toLowerCase();
    return (
      risk.id.toString().includes(search) ||
      risk.title.toLowerCase().includes(search) ||
      (risk.description || '').toLowerCase().includes(search) ||
      (risk.category || '').toLowerCase().includes(search) ||
      risk.probability.toLowerCase().includes(search) ||
      risk.impact.toLowerCase().includes(search) ||
      risk.level.toLowerCase().includes(search) ||
      (risk.mitigation || '').toLowerCase().includes(search) ||
      (risk.responsible || '').toLowerCase().includes(search) ||
      risk.status.toLowerCase().includes(search)
    );
  });

  if (loading) return <div className="p-8 text-center text-gray-400">Cargando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-teal-400" />
          Matriz de Riesgos
        </h2>
        {can('risks:write') && (
          <button onClick={() => handleOpenModal()} className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
            <Plus className="w-4 h-4" /> Nuevo Riesgo
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Bajo', count: summary.bajo, color: 'text-green-400', bg: 'bg-gray-900' },
          { label: 'Medio', count: summary.medio, color: 'text-amber-400', bg: 'bg-gray-900' },
          { label: 'Alto', count: summary.alto, color: 'text-red-400', bg: 'bg-gray-900' },
          { label: 'Crítico', count: summary.critico, color: 'text-red-500', bg: 'bg-gray-900' }
        ].map((kpi) => (
          <div key={kpi.label} className={`p-6 rounded-xl border border-gray-800 ${kpi.bg}`}>
            <div className="text-gray-400 text-sm font-medium">{kpi.label}</div>
            <div className={`text-3xl font-bold mt-2 ${kpi.color}`}>{kpi.count}</div>
          </div>
        ))}
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-800 flex justify-between items-center">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Filtrar en todas las columnas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-teal-500 transition-colors"
            />
            <Search className="w-5 h-5 text-gray-500 absolute left-3 top-2.5" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-gray-800/50 text-gray-400">
              <tr>
                <th className="px-6 py-4 font-medium">ID</th>
                <th className="px-6 py-4 font-medium">Título</th>
                <th className="px-6 py-4 font-medium">Categoría</th>
                <th className="px-6 py-4 font-medium">Probabilidad</th>
                <th className="px-6 py-4 font-medium">Impacto</th>
                <th className="px-6 py-4 font-medium">Nivel</th>
                <th className="px-6 py-4 font-medium">Responsable</th>
                <th className="px-6 py-4 font-medium">Estado</th>
                {can('risks:write') && <th className="px-6 py-4 font-medium text-right">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredRisks.map((risk) => (
                <tr key={risk.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4 text-gray-500">#{risk.id}</td>
                  <td className="px-6 py-4 font-medium text-gray-200">{risk.title}</td>
                  <td className="px-6 py-4">{risk.category}</td>
                  <td className="px-6 py-4 capitalize">{risk.probability.replace('_', ' ')}</td>
                  <td className="px-6 py-4 capitalize">{risk.impact}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase ${getLevelBadge(risk.level)}`}>
                      {risk.level}
                    </span>
                  </td>
                  <td className="px-6 py-4">{risk.responsible}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase ${
                      risk.status === 'activo' ? 'bg-blue-500/20 text-blue-400' :
                      risk.status === 'mitigado' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {risk.status}
                    </span>
                  </td>
                  {can('risks:write') && (
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleOpenModal(risk)} className="p-1 text-gray-400 hover:text-teal-400 transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(risk.id)} className="p-1 text-gray-400 hover:text-red-400 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {filteredRisks.length === 0 && (
                <tr>
                  <td colSpan={can('risks:write') ? 9 : 8} className="px-6 py-8 text-center text-gray-500">
                    No se encontraron riesgos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-gray-800">
              <h3 className="text-xl font-bold text-white">
                {editingRisk ? 'Editar Riesgo' : 'Nuevo Riesgo'}
              </h3>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-1">Título</label>
                  <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500 transition-colors" />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-1">Descripción</label>
                  <textarea rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500 transition-colors"></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Categoría</label>
                  <input type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500 transition-colors" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Responsable</label>
                  <input type="text" value={formData.responsible} onChange={e => setFormData({...formData, responsible: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500 transition-colors" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Probabilidad</label>
                  <select value={formData.probability} onChange={e => setFormData({...formData, probability: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500 transition-colors">
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                    <option value="muy_alta">Muy Alta</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Impacto</label>
                  <select value={formData.impact} onChange={e => setFormData({...formData, impact: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500 transition-colors">
                    <option value="bajo">Bajo</option>
                    <option value="medio">Medio</option>
                    <option value="alto">Alto</option>
                    <option value="critico">Crítico</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-1">Mitigación</label>
                  <textarea rows="2" value={formData.mitigation} onChange={e => setFormData({...formData, mitigation: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500 transition-colors"></textarea>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-1">Estado</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500 transition-colors">
                    <option value="activo">Activo</option>
                    <option value="mitigado">Mitigado</option>
                    <option value="aceptado">Aceptado</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-800">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-gray-400 hover:text-white transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-lg transition-colors">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
