import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import type { Alert } from '../types';

interface AlertPanelProps {
  alerts: Alert[];
  allNormal: boolean;
}

export default function AlertPanel({ alerts, allNormal }: AlertPanelProps) {
  const criticalAlerts = alerts.filter(a => a.type === 'danger');
  const warningAlerts = alerts.filter(a => a.type === 'warning');
  const successAlerts = alerts.filter(a => a.type === 'success');

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {criticalAlerts.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-red-50 border-2 border-red-300 rounded-2xl p-4 shadow-lg"
          >
            <div className="flex items-start gap-3">
              <div className="bg-red-500 p-2 rounded-xl text-white shadow-md flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-red-500 text-white px-2 py-0.5 rounded-md text-xs font-bold">
                    {alert.case}
                  </span>
                  <h3 className="font-semibold text-red-900">{alert.message}</h3>
                </div>
                <p className="text-sm text-red-700">{alert.action}</p>
              </div>
            </div>
          </motion.div>
        ))}

        {warningAlerts.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 shadow-md"
          >
            <div className="flex items-start gap-3">
              <div className="bg-amber-500 p-2 rounded-xl text-white shadow-md flex-shrink-0">
                <Info className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-amber-500 text-white px-2 py-0.5 rounded-md text-xs font-bold">
                    {alert.case}
                  </span>
                  <h3 className="font-semibold text-amber-900">{alert.message}</h3>
                </div>
                <p className="text-sm text-amber-700">{alert.action}</p>
              </div>
            </div>
          </motion.div>
        ))}

        {allNormal && successAlerts.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-4 shadow-md"
          >
            <div className="flex items-start gap-3">
              <div className="bg-green-500 p-2 rounded-xl text-white shadow-md flex-shrink-0">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-green-500 text-white px-2 py-0.5 rounded-md text-xs font-bold">
                    {alert.case}
                  </span>
                  <h3 className="font-semibold text-green-900">{alert.message}</h3>
                </div>
                <p className="text-sm text-green-700">{alert.action}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
