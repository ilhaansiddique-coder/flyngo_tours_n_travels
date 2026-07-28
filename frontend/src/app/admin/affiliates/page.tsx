'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { useApi } from '@/hooks/use-api';
import { useEffect, useState } from 'react';
import { UserPlus } from 'lucide-react';

interface Affiliate {
  id: string;
  code: string;
  userId: string;
  commissionRate: number;
  totalEarnings: number;
  isActive: boolean;
  referrals: any[];
  commissions: any[];
}

export default function AffiliatesPage() {
  const { getAffiliates } = useApi();
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const result = await getAffiliates();
        setAffiliates(Array.isArray(result) ? result : []);
      } catch (err: any) {
        setError(err.message || 'Failed to load affiliates');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [getAffiliates]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-gray-500">Loading affiliates...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="font-display text-lg font-bold flex items-center gap-2">
        <UserPlus className="w-5 h-5 text-brand-600" /> Affiliate Partners
      </h2>

      <Card hover={false} padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 bg-gray-50 dark:bg-gray-800/50">
                <th className="p-4 font-medium">Referral Code</th>
                <th className="p-4 font-medium">User ID</th>
                <th className="p-4 font-medium">Commission Rate (%)</th>
                <th className="p-4 font-medium">Total Earnings</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Referrals</th>
                <th className="p-4 font-medium">Commissions</th>
              </tr>
            </thead>
            <tbody>
              {affiliates.map((a) => (
                <tr key={a.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                  <td className="p-4 font-mono text-xs font-bold text-brand-600">{a.code}</td>
                  <td className="p-4 font-mono text-xs">{a.userId}</td>
                  <td className="p-4">{a.commissionRate}%</td>
                  <td className="p-4 font-medium">{formatCurrency(a.totalEarnings)}</td>
                  <td className="p-4">
                    <Badge variant={a.isActive ? 'success' : 'danger'}>
                      {a.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="p-4">{a.referrals?.length ?? 0}</td>
                  <td className="p-4">{a.commissions?.length ?? 0}</td>
                </tr>
              ))}
              {affiliates.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">No affiliates found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
