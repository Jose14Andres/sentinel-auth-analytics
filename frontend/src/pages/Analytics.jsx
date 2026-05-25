import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { analyticsService } from '../services/analyticsService';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Download, Plus, TrendingUp, TrendingDown, AlertTriangle, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const COLORS = ['#14b8a6', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

// ── KPI Card ──────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, icon: Icon, color }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="flex justify-between items-start mb-3">
        <p className="text-gray-400 text-sm">{label}</p>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <p className="text-2xl font-semibold text-white">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}

// ── Vista Analista / Admin ─────────────────────────────────────────────
function AnalystView({ summary, chartData, records, categories, can, from, setFrom, to, setTo, onFilter, activeCategory, setActiveCategory }) {
  const [filtered, setFiltered] = useState(chartData);

  useEffect(() => {
    setFiltered(chartData.map(d => ({ period: d.period, valor: parseFloat(d.value) })));
  }, [chartData]);

  const handleClearFilters = () => {
    setFrom('');
    setTo('');
    onFilter('', '');
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Reporte Analítico — Sentinel Analytics', 14, 20);
    doc.setFontSize(10);
    doc.text(`Generado: ${new Date().toLocaleString('es-EC')}`, 14, 28);

    // Sección de KPIs
    doc.setFontSize(12);
    doc.text('Resumen de KPIs:', 14, 40);
    doc.setFontSize(10);
    doc.text(`Total ingresos: $${(summary.total_ingresos ?? 0).toLocaleString()}`, 14, 48);
    doc.text(`Total gastos: $${(summary.total_gastos ?? 0).toLocaleString()}`, 14, 54);
    doc.text(`Utilidad neta: $${(summary.utilidad ?? 0).toLocaleString()}`, 14, 60);
    doc.text(`Incidentes TI: ${(summary.total_incidentes ?? 0).toLocaleString()}`, 14, 66);

    autoTable(doc, {
      startY: 75,
      head: [['#', 'Título', 'Categoría', 'Valor', 'Unidad', 'Período', 'Región']],
      body: records.map((r, i) => [i+1, r.title, r.category?.name, r.value, r.unit || '-', r.period, r.region || '-']),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [20, 184, 166] },
    });
    doc.save('reporte-sentinel.pdf');
    toast.success('PDF exportado');
  };

  const exportExcel = () => {
    const wsDatos = XLSX.utils.json_to_sheet(records.map(r => ({
      Título: r.title, Categoría: r.category?.name, Valor: r.value,
      Unidad: r.unit, Período: r.period, Región: r.region,
    })));

    const wsKPIs = XLSX.utils.json_to_sheet([
      { Métrica: 'Total ingresos', Valor: summary.total_ingresos ?? 0 },
      { Métrica: 'Total gastos', Valor: summary.total_gastos ?? 0 },
      { Métrica: 'Utilidad neta', Valor: summary.utilidad ?? 0 },
      { Métrica: 'Incidentes TI', Valor: summary.total_incidentes ?? 0 },
    ]);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsDatos, 'Datos');
    XLSX.utils.book_append_sheet(wb, wsKPIs, 'Resumen KPIs');
    XLSX.writeFile(wb, 'reporte-sentinel.xlsx');
    toast.success('Excel exportado');
  };

  const pieData = categories.map((c, i) => ({
    name: c.name,
    value: records.filter(r => r.category_id === c.id).length,
  })).filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Filtros de Fecha */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Período desde</label>
          <input type="month" value={from} onChange={e => setFrom(e.target.value)} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-teal-500" />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Período hasta</label>
          <input type="month" value={to} onChange={e => setTo(e.target.value)} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-teal-500" />
        </div>
        <button onClick={() => onFilter(from, to)} className="bg-teal-500 hover:bg-teal-400 text-gray-950 px-4 py-2 rounded-lg text-sm font-medium transition">
          Aplicar filtros
        </button>
        <button onClick={handleClearFilters} className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition border border-gray-700">
          Limpiar filtros
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total ingresos" value={`$${(summary.total_ingresos ?? 0).toLocaleString()}`} icon={TrendingUp} color="text-teal-400" sub="Acumulado" />
        <KpiCard label="Total gastos"   value={`$${(summary.total_gastos ?? 0).toLocaleString()}`}   icon={TrendingDown} color="text-red-400" sub="Acumulado" />
        <KpiCard label="Utilidad neta"  value={`$${(summary.utilidad ?? 0).toLocaleString()}`}        icon={Activity}     color="text-blue-400" sub="Ingresos - Gastos" />
        <KpiCard label="Incidentes TI"  value={(summary.total_incidentes ?? 0).toLocaleString()}                        icon={AlertTriangle} color="text-amber-400" sub="Total registrados" />
      </div>

      {/* Botones exportar — solo admin y analyst */}
      {can('reports:export') && (
        <div className="flex gap-3">
          <button onClick={exportPDF}   className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm hover:bg-red-500/20 transition">
            <Download className="w-4 h-4" /> Exportar PDF
          </button>
          <button onClick={exportExcel} className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-2 rounded-lg text-sm hover:bg-green-500/20 transition">
            <Download className="w-4 h-4" /> Exportar Excel
          </button>
        </div>
      )}

      {/* Gráfico de líneas */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white font-medium">Tendencia por período</h3>
          <select value={activeCategory} onChange={e => {
            setActiveCategory(e.target.value);
            analyticsService.getChartData(e.target.value, from, to)
              .then(r => setFiltered(r.data.data.map(d => ({ period: d.period, valor: parseFloat(d.value) }))));
          }}
            className="bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-1.5">
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={filtered}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="period" stroke="#6b7280" tick={{ fontSize: 12 }} />
            <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8 }} />
            <Line type="monotone" dataKey="valor" stroke="#14b8a6" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico de barras + pastel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-white font-medium mb-4">Ingresos vs Gastos</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={[
              { mes: 'Ene', ingresos: 45200, gastos: 31000 },
              { mes: 'Feb', ingresos: 48900, gastos: 33500 },
              { mes: 'Mar', ingresos: 52100, gastos: 30200 },
              { mes: 'Abr', ingresos: 49800, gastos: 35100 },
              { mes: 'May', ingresos: 55300, gastos: 32800 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="mes" stroke="#6b7280" tick={{ fontSize: 12 }} />
              <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8 }} />
              <Legend />
              <Bar dataKey="ingresos" fill="#14b8a6" radius={[4,4,0,0]} />
              <Bar dataKey="gastos"   fill="#ef4444" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-white font-medium mb-4">Registros por categoría</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabla de datos */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800">
          <h3 className="text-white font-medium">Registros de datos</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-800">
              <th className="px-5 py-3 text-left text-gray-400 font-medium">Título</th>
              <th className="px-5 py-3 text-left text-gray-400 font-medium">Categoría</th>
              <th className="px-5 py-3 text-left text-gray-400 font-medium">Valor</th>
              <th className="px-5 py-3 text-left text-gray-400 font-medium">Período</th>
              <th className="px-5 py-3 text-left text-gray-400 font-medium">Región</th>
            </tr></thead>
            <tbody>
              {records.map(r => (
                <tr key={r.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="px-5 py-3 text-gray-300">{r.title}</td>
                  <td className="px-5 py-3"><span className="bg-teal-500/10 text-teal-400 px-2 py-0.5 rounded text-xs">{r.category?.name}</span></td>
                  <td className="px-5 py-3 text-white font-medium">{parseFloat(r.value).toLocaleString()} {r.unit}</td>
                  <td className="px-5 py-3 text-gray-400">{r.period}</td>
                  <td className="px-5 py-3 text-gray-400">{r.region || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Vista Operador: solo formulario de ingreso ─────────────────────────
function OperatorView({ categories }) {
  const [form, setForm] = useState({ category_id: '', title: '', value: '', unit: '', period: '', region: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [myRecords, setMyRecords] = useState([]);

  const fetchMyRecords = () => {
    analyticsService.getMyRecords().then(res => setMyRecords(res.data.data)).catch(() => {});
  };

  useEffect(() => {
    fetchMyRecords();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category_id || !form.title || !form.value || !form.period) {
      toast.error('Completa los campos obligatorios');
      return;
    }
    setLoading(true);
    try {
      await analyticsService.createRecord(form);
      toast.success('Registro ingresado correctamente');
      setForm({ category_id: '', title: '', value: '', unit: '', period: '', region: '', notes: '' });
      fetchMyRecords();
    } catch { toast.error('Error al guardar'); }
    finally { setLoading(false); }
  };

  const Field = ({ label, required, children }) => (
    <div>
      <label className="block text-sm text-gray-400 mb-1.5">{label}{required && <span className="text-red-400 ml-1">*</span>}</label>
      {children}
    </div>
  );

  const inputCls = "w-full bg-gray-800 border border-gray-700 rounded-lg px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 transition";

  return (
    <div className="max-w-2xl">
      <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 mb-6">
        <p className="text-amber-400 text-sm font-medium">Modo Operador</p>
        <p className="text-gray-400 text-sm mt-1">Solo puedes ingresar datos. Los reportes y gráficos son accesibles para analistas y administradores.</p>
      </div>
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-white font-medium mb-5 flex items-center gap-2"><Plus className="w-5 h-5 text-teal-400" /> Ingresar nuevo registro</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Categoría" required>
              <select value={form.category_id} onChange={e => setForm(f=>({...f, category_id: e.target.value}))} className={inputCls}>
                <option value="">Seleccionar...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Período (YYYY-MM)" required>
              <input type="month" value={form.period} onChange={e => setForm(f=>({...f, period: e.target.value}))} className={inputCls} />
            </Field>
          </div>
          <Field label="Título del registro" required>
            <input type="text" value={form.title} onChange={e => setForm(f=>({...f, title: e.target.value}))} className={inputCls} placeholder="Ej: Ingresos Mayo 2026" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Valor" required>
              <input type="number" step="0.01" value={form.value} onChange={e => setForm(f=>({...f, value: e.target.value}))} className={inputCls} placeholder="0.00" />
            </Field>
            <Field label="Unidad">
              <input type="text" value={form.unit} onChange={e => setForm(f=>({...f, unit: e.target.value}))} className={inputCls} placeholder="USD, %, incidentes..." />
            </Field>
          </div>
          <Field label="Región">
            <input type="text" value={form.region} onChange={e => setForm(f=>({...f, region: e.target.value}))} className={inputCls} placeholder="Quito, Guayaquil, Nacional..." />
          </Field>
          <Field label="Notas">
            <textarea value={form.notes} onChange={e => setForm(f=>({...f, notes: e.target.value}))} className={inputCls} rows={3} placeholder="Observaciones adicionales..." />
          </Field>
          <button type="submit" disabled={loading}
            className="w-full bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-gray-950 font-medium rounded-lg py-2.5 text-sm transition">
            {loading ? 'Guardando...' : 'Guardar registro'}
          </button>
        </form>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden mt-6">
        <div className="px-5 py-4 border-b border-gray-800">
          <h3 className="text-white font-medium">Mis registros ingresados</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-800">
              <th className="px-5 py-3 text-left text-gray-400 font-medium">Título</th>
              <th className="px-5 py-3 text-left text-gray-400 font-medium">Categoría</th>
              <th className="px-5 py-3 text-left text-gray-400 font-medium">Valor</th>
              <th className="px-5 py-3 text-left text-gray-400 font-medium">Período</th>
              <th className="px-5 py-3 text-left text-gray-400 font-medium">Región</th>
            </tr></thead>
            <tbody>
              {myRecords.map(r => (
                <tr key={r.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="px-5 py-3 text-gray-300">{r.title}</td>
                  <td className="px-5 py-3"><span className="bg-teal-500/10 text-teal-400 px-2 py-0.5 rounded text-xs">{r.category?.name}</span></td>
                  <td className="px-5 py-3 text-white font-medium">{parseFloat(r.value).toLocaleString()} {r.unit}</td>
                  <td className="px-5 py-3 text-gray-400">{r.period}</td>
                  <td className="px-5 py-3 text-gray-400">{r.region || '—'}</td>
                </tr>
              ))}
              {myRecords.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-5 py-4 text-center text-gray-500">No has ingresado registros aún.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Página principal Analytics ─────────────────────────────────────────
export default function Analytics() {
  const { user, can } = useAuth();
  const [summary, setSummary]       = useState({});
  const [chartData, setChartData]   = useState([]);
  const [records, setRecords]       = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);

  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [activeChartCategory, setActiveChartCategory] = useState(1);

  const fetchAnalystData = (fromDate, toDate, categoryId = activeChartCategory) => {
    setLoading(true);
    Promise.all([
      analyticsService.getSummary(fromDate, toDate),
      analyticsService.getChartData(categoryId, fromDate, toDate),
      analyticsService.getRecords(fromDate, toDate),
    ]).then(([sum, chart, recs]) => {
      setSummary(sum.data.data);
      setChartData(chart.data.data);
      setRecords(recs.data.data);
    }).catch(() => toast.error('Error al cargar datos'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const isOperator = user?.role === 'operator';
    analyticsService.getCategories().then(cats => setCategories(cats.data.data));

    if (!isOperator) {
      fetchAnalystData(from, to, activeChartCategory);
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleFilter = (fromDate, toDate) => {
    fetchAnalystData(fromDate, toDate, activeChartCategory);
  };

  if (loading) return <div className="p-6 text-gray-400">Cargando datos...</div>;

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-white">Analítica de Datos</h1>
          {user?.role === 'auditor' && (
            <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded text-xs font-medium">
              Solo lectura
            </span>
          )}
        </div>
        <p className="text-gray-400 text-sm mt-1">
          {user?.role === 'operator' ? 'Ingreso de registros operativos' : 'Reportes y visualización de información'}
        </p>
      </div>

      {user?.role === 'operator'
        ? <OperatorView categories={categories} />
        : <AnalystView summary={summary} chartData={chartData} records={records} categories={categories} can={can} from={from} setFrom={setFrom} to={to} setTo={setTo} onFilter={handleFilter} activeCategory={activeChartCategory} setActiveCategory={setActiveChartCategory} />
      }
    </div>
  );
}
