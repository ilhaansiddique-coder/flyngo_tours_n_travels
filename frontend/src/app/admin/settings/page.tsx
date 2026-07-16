'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <Card hover={false}>
        <h3 className="font-display text-lg font-bold mb-6">General Settings</h3>
        <div className="space-y-4">
          <Input label="Company Name" defaultValue="Flyngo Tours & Travels" />
          <Input label="Company Email" type="email" defaultValue="contact@flyngo.com" />
          <Input label="Company Phone" defaultValue="+1-800-FLYNGO" />
          <Input label="Address" defaultValue="123 Travel Street, New York, NY 10001" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Default Currency" defaultValue="USD" />
            <Input label="Default Language" defaultValue="en" />
          </div>
        </div>
      </Card>

      <Card hover={false}>
        <h3 className="font-display text-lg font-bold mb-6">Payment Gateways</h3>
        <div className="space-y-4">
          <Input label="Stripe Public Key" type="password" placeholder="pk_test_..." />
          <Input label="Stripe Secret Key" type="password" placeholder="sk_test_..." />
          <Input label="bKash API Key" type="password" placeholder="Enter key..." />
          <Input label="SSLCommerz Store ID" placeholder="Enter store ID..." />
        </div>
      </Card>

      <Card hover={false}>
        <h3 className="font-display text-lg font-bold mb-6">Analytics</h3>
        <div className="space-y-4">
          <Input label="Google Analytics ID (GA4)" placeholder="G-XXXXXXXXXX" />
          <Input label="Google Tag Manager ID" placeholder="GTM-XXXXXXX" />
          <Input label="Meta Pixel ID" placeholder="Enter pixel ID..." />
          <Input label="Microsoft Clarity ID" placeholder="Enter clarity ID..." />
        </div>
      </Card>

      <div className="flex justify-end">
        <Button size="lg" className="gap-2"><Save className="w-5 h-5" /> Save Settings</Button>
      </div>
    </div>
  );
}
