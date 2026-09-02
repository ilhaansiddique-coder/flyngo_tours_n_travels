import { MapPin, Plus } from 'lucide-react';

interface DestItem {
  name?: string;
  country?: string;
}

interface Props {
  primary?: DestItem | null;
  additions?: Array<{ destination?: DestItem | null } | DestItem | null> | null;
  className?: string;
  emptyLabel?: string;
}

export function DestinationList({ primary, additions, className = '', emptyLabel = 'Explore destination' }: Props) {
  const extra =
    (additions || [])
      .map((a) => (a && 'destination' in (a as any) ? (a as { destination?: DestItem | null }).destination : (a as DestItem)))
      .filter((d): d is DestItem => !!d && !!d.name);

  if (!primary?.name && extra.length === 0) {
    return <span className={className}>{emptyLabel}</span>;
  }

  const labels = [
    primary?.name ? (primary.country ? `${primary.name}, ${primary.country}` : primary.name) : null,
    ...extra.map((d) => d.name),
  ].filter((x): x is string => !!x);

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <MapPin className="w-3 h-3 shrink-0" />
      <span>{labels.join(' · ')}</span>
    </span>
  );
}
