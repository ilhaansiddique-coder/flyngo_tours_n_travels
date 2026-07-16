'use client';

import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Activity } from 'lucide-react';

const logs = [
  { id: '1', user: 'admin@flyngo.com', action: 'User login', entity: 'User', details: 'Successful login from 192.168.1.1', ip: '192.168.1.1', date: '2026-07-16 09:30:45' },
  { id: '2', user: 'manager@flyngo.com', action: 'Tour updated', entity: 'Tour', details: 'Updated "Bali Paradise Explorer" price from $1199 to $1299', ip: '192.168.1.2', date: '2026-07-16 08:15:22' },
  { id: '3', user: 'admin@flyngo.com', action: 'Booking confirmed', entity: 'Booking', details: 'Confirmed booking FLY-L5G7-X9K2', ip: '192.168.1.1', date: '2026-07-15 16:42:10' },
  { id: '4', user: 'agent@flyngo.com', action: 'Customer created', entity: 'User', details: 'Created new customer account for john@email.com', ip: '192.168.1.3', date: '2026-07-15 14:30:05' },
  { id: '5', user: 'admin@flyngo.com', action: 'Settings changed', entity: 'Settings', details: 'Updated company email to contact@flyngo.com', ip: '192.168.1.1', date: '2026-07-15 11:00:33' },
  { id: '6', user: 'manager@flyngo.com', action: 'Coupon created', entity: 'Coupon', details: 'Created coupon SUMMER25 (25% off)', ip: '192.168.1.2', date: '2026-07-14 09:20:18' },
  { id: '7', user: 'admin@flyngo.com', action: 'Role updated', entity: 'Role', details: 'Added "cms.delete" permission to Manager role', ip: '192.168.1.1', date: '2026-07-14 08:00:00' },
  { id: '8', user: 'agent@flyngo.com', action: 'Failed login attempt', entity: 'User', details: 'Failed login for user agent@flyngo.com from 10.0.0.5', ip: '10.0.0.5', date: '2026-07-13 22:15:40' },
];

export default function AuditLogsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold flex items-center gap-2">
          <Activity className="w-5 h-5 text-brand-600" /> Audit Logs
        </h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search audit logs..." className="pl-9 w-64" />
        </div>
      </div>

      <Card hover={false} padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 bg-gray-50 dark:bg-gray-800/50">
                <th className="p-4 font-medium">Timestamp</th>
                <th className="p-4 font-medium">User</th>
                <th className="p-4 font-medium">Action</th>
                <th className="p-4 font-medium">Entity</th>
                <th className="p-4 font-medium">Details</th>
                <th className="p-4 font-medium">IP</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                  <td className="p-4 text-xs text-gray-500 font-mono">{l.date}</td>
                  <td className="p-4 text-sm">{l.user}</td>
                  <td className="p-4">
                    <Badge variant={l.action.includes('Failed') ? 'danger' : l.action.includes('created') ? 'success' : 'info'}>
                      {l.action}
                    </Badge>
                  </td>
                  <td className="p-4">{l.entity}</td>
                  <td className="p-4 text-gray-500 text-xs max-w-xs truncate">{l.details}</td>
                  <td className="p-4 font-mono text-xs text-gray-500">{l.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-500">Showing {logs.length} entries</p>
          <div className="flex gap-1">
            <button className="px-3 py-1 rounded-lg text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700">Prev</button>
            <button className="px-3 py-1 rounded-lg text-sm bg-brand-600 text-white">1</button>
            <button className="px-3 py-1 rounded-lg text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700">2</button>
            <button className="px-3 py-1 rounded-lg text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700">Next</button>
          </div>
        </div>
      </Card>
    </div>
  );
}
