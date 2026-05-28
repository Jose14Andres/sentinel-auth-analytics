import { ShieldCheck, ArrowRight } from 'lucide-react';

export default function Policies() {
  const policies = [
    { num: 1, name: "Responsabilidad", status: "Implementado", evidence: "Sistema RBAC define quién decide qué en TI. 4 roles con permisos granulares en rbacMiddleware.js y AuthContext.jsx." },
    { num: 2, name: "Estrategia", status: "Implementado", evidence: "Dashboards analíticos alinean los datos operativos con la toma de decisiones organizacionales." },
    { num: 3, name: "Adquisición", status: "Implementado", evidence: "Stack tecnológico justificado: React, Node.js, Docker elegidos por eficiencia y costo-beneficio documentado en informe." },
    { num: 4, name: "Desempeño", status: "Implementado", evidence: "4 KPIs en tiempo real miden si el sistema aporta valor. Módulo EDA mide correlaciones y anomalías estadísticas." },
    { num: 5, name: "Conformidad", status: "Implementado", evidence: "audit_logs registra toda acción del sistema. Matriz de riesgos identifica incumplimientos. Token blacklist activa." },
    { num: 6, name: "Comportamiento Humano", status: "En progreso", evidence: "Rol Operador accede solo a las funciones de su función. Manual de usuario pendiente de documentar." }
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'Implementado': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'En progreso': return 'bg-amber-500/20 text-amber-400 border-amber-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <ShieldCheck className="w-8 h-8 text-teal-400" />
        <h2 className="text-2xl font-bold text-white">Políticas TI — ISO/IEC 38500:2015</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {policies.map((policy) => (
          <div key={policy.num} className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col h-full hover:border-teal-500/50 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-teal-500/20 text-teal-400 font-bold text-sm">
                  {policy.num}
                </span>
                <h3 className="text-lg font-bold text-white">{policy.name}</h3>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(policy.status)}`}>
                {policy.status}
              </span>
            </div>
            <p className="text-gray-400 text-sm flex-1">
              {policy.evidence}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800 bg-gray-800/50">
          <h3 className="text-lg font-bold text-white">Análisis de Brechas</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-gray-800/50 text-gray-400">
              <tr>
                <th className="px-6 py-4 font-medium">Principio</th>
                <th className="px-6 py-4 font-medium">Estado actual</th>
                <th className="px-6 py-4 font-medium">Estado objetivo</th>
                <th className="px-6 py-4 font-medium">Acción de mejora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {policies.map((p) => (
                <tr key={p.num} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-200">{p.num}. {p.name}</td>
                  <td className="px-6 py-4">{p.status}</td>
                  <td className="px-6 py-4">Implementado</td>
                  <td className="px-6 py-4 text-gray-400">
                    {p.status === 'Implementado' ? (
                      <span className="text-green-400/80">Mantener controles y revisar periódicamente.</span>
                    ) : (
                      <span className="flex items-center gap-2 text-amber-400/80">
                        Completar documentación manual de usuario. <ArrowRight className="w-3 h-3" />
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
