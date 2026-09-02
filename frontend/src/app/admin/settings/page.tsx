'use client';

import { useEffect, useState } from 'react';
import { useApi } from '@/hooks/use-api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormField, FormInput, FormSelect, FormTextarea } from '@/components/admin/ui';
import { Settings, Save } from 'lucide-react';
import { toast } from 'sonner';

type TenantSettings = Record<string, string>;

const CURRENCIES = [
  { label: 'BDT (৳)', value: 'BDT' },
];

const LANGUAGES = [
  { label: 'English', value: 'en' },
  { label: 'Bengali', value: 'bn' },
  { label: 'Spanish', value: 'es' },
  { label: 'French', value: 'fr' },
  { label: 'German', value: 'de' },
  { label: 'Arabic', value: 'ar' },
  { label: 'Chinese', value: 'zh' },
  { label: 'Japanese', value: 'ja' },
  { label: 'Russian', value: 'ru' },
  { label: 'Portuguese', value: 'pt' },
];

const TIMEZONES = [
  { label: 'UTC', value: 'UTC' },
  { label: 'US Eastern (UTC-5)', value: 'America/New_York' },
  { label: 'US Central (UTC-6)', value: 'America/Chicago' },
  { label: 'US Pacific (UTC-8)', value: 'America/Los_Angeles' },
  { label: 'London (UTC+0)', value: 'Europe/London' },
  { label: 'Berlin (UTC+1)', value: 'Europe/Berlin' },
  { label: 'Dubai (UTC+4)', value: 'Asia/Dubai' },
  { label: 'Dhaka (UTC+6)', value: 'Asia/Dhaka' },
  { label: 'Bangkok (UTC+7)', value: 'Asia/Bangkok' },
  { label: 'Singapore (UTC+8)', value: 'Asia/Singapore' },
  { label: 'Tokyo (UTC+9)', value: 'Asia/Tokyo' },
  { label: 'Sydney (UTC+10)', value: 'Australia/Sydney' },
];

const INITIAL: TenantSettings = {
  companyName: '',
  companyEmail: '',
  companyPhone: '',
  companyAddress: '',
  defaultCurrency: 'BDT',
  defaultLanguage: 'en',
  timezone: 'UTC',
  logoUrl: '',
  faviconUrl: '',
  primaryColor: '',
  secondaryColor: '',
  stripePublicKey: '',
  stripeSecretKey: '',
  bkashApiKey: '',
  nagadMerchantId: '',
  sslcStoreId: '',
  ga4Id: '',
  gtmId: '',
  metaPixelId: '',
  facebookUrl: '',
  instagramUrl: '',
  twitterUrl: '',
  youtubeUrl: '',
  bkashWalletNumber: '',
  bkashMerchantName: '',
  paymentInstructions: '',
};

export default function SettingsPage() {
  const { getTenantSettings, updateTenantSettings } = useApi();
  const [settings, setSettings] = useState<TenantSettings>(INITIAL);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: string, value: string) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = (await getTenantSettings()) as TenantSettings;
        if (data) setSettings((prev) => ({ ...prev, ...data }));
      } catch (err: any) {
        setError(err.message || 'Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [getTenantSettings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateTenantSettings(settings);
      toast.success('Settings saved successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-gray-500">Loading settings...</p>
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
    <div className="space-y-6 max-w-3xl">
      <Card hover={false}>
        <div className="flex items-center gap-2 mb-6">
          <Settings className="w-5 h-5" />
          <h3 className="font-display text-lg font-bold">General</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Company Name">
            <FormInput value={settings.companyName} onChange={(v) => set('companyName', v)} placeholder="Flyngo Tours & Travels" />
          </FormField>
          <FormField label="Company Email">
            <FormInput value={settings.companyEmail} onChange={(v) => set('companyEmail', v)} type="email" placeholder="contact@flyngo.com" />
          </FormField>
          <FormField label="Company Phone">
            <FormInput value={settings.companyPhone} onChange={(v) => set('companyPhone', v)} placeholder="+1-800-FLYNGO" />
          </FormField>
          <FormField label="Company Address">
            <FormInput value={settings.companyAddress} onChange={(v) => set('companyAddress', v)} placeholder="123 Travel Street, New York" />
          </FormField>
          <FormField label="Default Currency">
            <FormSelect value={settings.defaultCurrency} onChange={(v) => set('defaultCurrency', v)} options={CURRENCIES} />
          </FormField>
          <FormField label="Default Language">
            <FormSelect value={settings.defaultLanguage} onChange={(v) => set('defaultLanguage', v)} options={LANGUAGES} />
          </FormField>
          <FormField label="Timezone">
            <FormSelect value={settings.timezone} onChange={(v) => set('timezone', v)} options={TIMEZONES} />
          </FormField>
          <div />
          <FormField label="Logo URL">
            <FormInput value={settings.logoUrl} onChange={(v) => set('logoUrl', v)} placeholder="https://..." />
          </FormField>
          <FormField label="Favicon URL">
            <FormInput value={settings.faviconUrl} onChange={(v) => set('faviconUrl', v)} placeholder="https://..." />
          </FormField>
          <FormField label="Primary Color">
            <FormInput value={settings.primaryColor} onChange={(v) => set('primaryColor', v)} placeholder="#2563EB" />
          </FormField>
          <FormField label="Secondary Color">
            <FormInput value={settings.secondaryColor} onChange={(v) => set('secondaryColor', v)} placeholder="#F59E0B" />
          </FormField>
        </div>
      </Card>

      <Card hover={false}>
        <h3 className="font-display text-lg font-bold mb-6">Payment Gateways</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Stripe Public Key">
            <FormInput value={settings.stripePublicKey} onChange={(v) => set('stripePublicKey', v)} type="password" placeholder="pk_test_..." />
          </FormField>
          <FormField label="Stripe Secret Key">
            <FormInput value={settings.stripeSecretKey} onChange={(v) => set('stripeSecretKey', v)} type="password" placeholder="sk_test_..." />
          </FormField>
          <FormField label="bKash API Key">
            <FormInput value={settings.bkashApiKey} onChange={(v) => set('bkashApiKey', v)} type="password" placeholder="Enter key..." />
          </FormField>
          <FormField label="Nagad Merchant ID">
            <FormInput value={settings.nagadMerchantId} onChange={(v) => set('nagadMerchantId', v)} placeholder="Enter merchant ID..." />
          </FormField>
          <FormField label="SSLCommerz Store ID">
            <FormInput value={settings.sslcStoreId} onChange={(v) => set('sslcStoreId', v)} placeholder="Enter store ID..." />
          </FormField>
        </div>
      </Card>

      <Card hover={false}>
        <h3 className="font-display text-lg font-bold mb-6">Offline payments (bKash & bank)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="bKash wallet number">
            <FormInput value={settings.bkashWalletNumber} onChange={(v) => set('bkashWalletNumber', v)} placeholder="01XXXXXXXXX" />
          </FormField>
          <FormField label="bKash merchant name">
            <FormInput value={settings.bkashMerchantName} onChange={(v) => set('bkashMerchantName', v)} placeholder="Flyngo Tours" />
          </FormField>
          <div className="sm:col-span-2">
            <FormField label="Payment instructions">
              <FormTextarea value={settings.paymentInstructions} onChange={(v) => set('paymentInstructions', v)} placeholder="Use your booking code as the payment reference." />
            </FormField>
          </div>
        </div>
      </Card>

      <Card hover={false}>
        <h3 className="font-display text-lg font-bold mb-6">Analytics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Google Analytics ID (GA4)">
            <FormInput value={settings.ga4Id} onChange={(v) => set('ga4Id', v)} placeholder="G-XXXXXXXXXX" />
          </FormField>
          <FormField label="Google Tag Manager ID">
            <FormInput value={settings.gtmId} onChange={(v) => set('gtmId', v)} placeholder="GTM-XXXXXXX" />
          </FormField>
          <FormField label="Meta Pixel ID">
            <FormInput value={settings.metaPixelId} onChange={(v) => set('metaPixelId', v)} placeholder="Enter pixel ID..." />
          </FormField>
        </div>
      </Card>

      <Card hover={false}>
        <h3 className="font-display text-lg font-bold mb-6">Social Links</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Facebook URL">
            <FormInput value={settings.facebookUrl} onChange={(v) => set('facebookUrl', v)} placeholder="https://facebook.com/..." />
          </FormField>
          <FormField label="Instagram URL">
            <FormInput value={settings.instagramUrl} onChange={(v) => set('instagramUrl', v)} placeholder="https://instagram.com/..." />
          </FormField>
          <FormField label="Twitter URL">
            <FormInput value={settings.twitterUrl} onChange={(v) => set('twitterUrl', v)} placeholder="https://twitter.com/..." />
          </FormField>
          <FormField label="YouTube URL">
            <FormInput value={settings.youtubeUrl} onChange={(v) => set('youtubeUrl', v)} placeholder="https://youtube.com/..." />
          </FormField>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button size="lg" loading={saving} onClick={handleSave} className="gap-2">
          <Save className="w-5 h-5" /> Save Settings
        </Button>
      </div>
    </div>
  );
}
