'use client';
import { Globe, Map, Headphones, Plane } from 'lucide-react';
const SERVICES = [
  { icon: Globe, label: 'Destinations', text: 'Explore available destinations' },
  { icon: Map, label: 'Tours', text: 'Browse listed travel packages' },
  { icon: Plane, label: 'Flights', text: 'Request flight options' },
  { icon: Headphones, label: 'Support', text: 'Contact our travel team' },
];
export function StatsSection() {
  return <section className="my-24 px-4 sm:px-6 lg:px-16 max-w-[1600px] mx-auto">
    <div className="rounded-3xl border border-hairline card-elevated p-8 grid grid-cols-2 lg:grid-cols-4 gap-6">
      {SERVICES.map(({ icon: Icon, label, text }) => <div key={label}><Icon className="w-7 h-7 text-accent mb-3" /><h2 className="font-semibold">{label}</h2><p className="text-sm text-muted mt-2">{text}</p></div>)}
    </div>
  </section>;
}
