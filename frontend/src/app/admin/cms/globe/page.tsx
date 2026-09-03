'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Modal, FormField, FormInput, FormSelect, ConfirmDialog } from '@/components/admin/ui';
import { useApi } from '@/hooks/use-api';
import { Globe, Plus, Pencil, Trash2, ArrowRight, RefreshCw } from 'lucide-react';

interface GlobeCity {
  id: string;
  nameEn: string;
  nameBn?: string;
  lat: number;
  lon: number;
  isActive: boolean;
  sortOrder: number;
}

interface GlobeRoute {
  id: string;
  fromCityId: string;
  toCityId: string;
  fromCity: GlobeCity;
  toCity: GlobeCity;
  isActive: boolean;
  sortOrder: number;
}

const emptyCity = { nameEn: '', nameBn: '', lat: 0, lon: 0, isActive: true, sortOrder: 0 };

export default function AdminGlobePage() {
  const { listGlobeCities, createGlobeCity, updateGlobeCity, deleteGlobeCity, listGlobeRoutes, createGlobeRoute, updateGlobeRoute, deleteGlobeRoute } = useApi();
  const [cities, setCities] = useState<GlobeCity[]>([]);
  const [routes, setRoutes] = useState<GlobeRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [cityModalOpen, setCityModalOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<GlobeCity | null>(null);
  const [cityForm, setCityForm] = useState({ ...emptyCity });
  const [citySaving, setCitySaving] = useState(false);

  const [routeModalOpen, setRouteModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<GlobeRoute | null>(null);
  const [routeForm, setRouteForm] = useState({ fromCityId: '', toCityId: '', isActive: true, sortOrder: 0 });
  const [routeSaving, setRouteSaving] = useState(false);

  const [cityDelete, setCityDelete] = useState<GlobeCity | null>(null);
  const [routeDelete, setRouteDelete] = useState<GlobeRoute | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [c, r] = await Promise.all([
        listGlobeCities() as Promise<GlobeCity[]>,
        listGlobeRoutes() as Promise<GlobeRoute[]>,
      ]);
      setCities(c ?? []);
      setRoutes(r ?? []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load globe data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ------------------ city CRUD ------------------ */

  const openNewCity = () => {
    setEditingCity(null);
    setCityForm({ ...emptyCity, sortOrder: cities.length });
    setCityModalOpen(true);
  };

  const openEditCity = (city: GlobeCity) => {
    setEditingCity(city);
    setCityForm({
      nameEn: city.nameEn,
      nameBn: city.nameBn ?? '',
      lat: city.lat,
      lon: city.lon,
      isActive: city.isActive,
      sortOrder: city.sortOrder,
    });
    setCityModalOpen(true);
  };

  const saveCity = async () => {
    if (!cityForm.nameEn.trim()) return;
    setCitySaving(true);
    try {
      const body = {
        nameEn: cityForm.nameEn.trim(),
        nameBn: cityForm.nameBn.trim() || undefined,
        lat: Number(cityForm.lat),
        lon: Number(cityForm.lon),
        isActive: cityForm.isActive,
        sortOrder: Number(cityForm.sortOrder) || 0,
      };
      if (editingCity) {
        await updateGlobeCity(editingCity.id, body);
      } else {
        await createGlobeCity(body);
      }
      setCityModalOpen(false);
      await load();
    } catch (err: any) {
      setError(err?.message || 'Failed to save city');
    } finally {
      setCitySaving(false);
    }
  };

  const confirmDeleteCity = async () => {
    if (!cityDelete) return;
    try {
      await deleteGlobeCity(cityDelete.id);
      setCityDelete(null);
      await load();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete city');
    }
  };

  /* ------------------ route CRUD ------------------ */

  const openNewRoute = () => {
    setEditingRoute(null);
    setRouteForm({ fromCityId: cities[0]?.id ?? '', toCityId: cities[1]?.id ?? cities[0]?.id ?? '', isActive: true, sortOrder: routes.length });
    setRouteModalOpen(true);
  };

  const openEditRoute = (route: GlobeRoute) => {
    setEditingRoute(route);
    setRouteForm({
      fromCityId: route.fromCityId,
      toCityId: route.toCityId,
      isActive: route.isActive,
      sortOrder: route.sortOrder,
    });
    setRouteModalOpen(true);
  };

  const saveRoute = async () => {
    if (!routeForm.fromCityId || !routeForm.toCityId) return;
    setRouteSaving(true);
    try {
      const body = {
        fromCityId: routeForm.fromCityId,
        toCityId: routeForm.toCityId,
        isActive: routeForm.isActive,
        sortOrder: Number(routeForm.sortOrder) || 0,
      };
      if (editingRoute) {
        await updateGlobeRoute(editingRoute.id, body);
      } else {
        await createGlobeRoute(body);
      }
      setRouteModalOpen(false);
      await load();
    } catch (err: any) {
      setError(err?.message || 'Failed to save route');
    } finally {
      setRouteSaving(false);
    }
  };

  const confirmDeleteRoute = async () => {
    if (!routeDelete) return;
    try {
      await deleteGlobeRoute(routeDelete.id);
      setRouteDelete(null);
      await load();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete route');
    }
  };

  const cityOptions = cities.map((c) => ({ label: c.nameEn, value: c.id }));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            Globe Cities & Routes
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Markers and flight arcs displayed on the homepage globe animation.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={load}>
            <RefreshCw className="w-4 h-4 mr-1" /> Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Card hover={false}>
          <p className="text-error text-sm">{error}</p>
        </Card>
      )}

      {/* Cities */}
      <Card hover={false}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Cities ({cities.length})</h2>
            <p className="text-xs text-on-surface-variant">Each city appears as a pulsing marker on the globe.</p>
          </div>
          <Button onClick={openNewCity}>
            <Plus className="w-4 h-4 mr-1" /> Add city
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-on-surface-variant bg-surface-container-low">
                <th className="p-3 font-medium">Name</th>
                <th className="p-3 font-medium">বাংলা</th>
                <th className="p-3 font-medium">Latitude</th>
                <th className="p-3 font-medium">Longitude</th>
                <th className="p-3 font-medium">Order</th>
                <th className="p-3 font-medium">Active</th>
                <th className="p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {cities.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-on-surface-variant">No cities yet.</td></tr>
              ) : (
                cities.map((c) => (
                  <tr key={c.id} className="border-b border-outline-variant">
                    <td className="p-3 font-medium">{c.nameEn}</td>
                    <td className="p-3 text-on-surface-variant">{c.nameBn ?? '—'}</td>
                    <td className="p-3 font-mono text-xs">{c.lat.toFixed(2)}</td>
                    <td className="p-3 font-mono text-xs">{c.lon.toFixed(2)}</td>
                    <td className="p-3">{c.sortOrder}</td>
                    <td className="p-3">{c.isActive ? '✓' : '—'}</td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <button
                          className="p-1.5 rounded hover:bg-surface-container-high"
                          onClick={() => openEditCity(c)}
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          className="p-1.5 rounded hover:bg-error/10 text-error"
                          onClick={() => setCityDelete(c)}
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Routes */}
      <Card hover={false}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Routes ({routes.length})</h2>
            <p className="text-xs text-on-surface-variant">Each route appears as a flight arc on the globe.</p>
          </div>
          <Button onClick={openNewRoute} disabled={cities.length < 2}>
            <Plus className="w-4 h-4 mr-1" /> Add route
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-on-surface-variant bg-surface-container-low">
                <th className="p-3 font-medium">From</th>
                <th className="p-3 font-medium"></th>
                <th className="p-3 font-medium">To</th>
                <th className="p-3 font-medium">Order</th>
                <th className="p-3 font-medium">Active</th>
                <th className="p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {routes.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-on-surface-variant">No routes yet.</td></tr>
              ) : (
                routes.map((r) => (
                  <tr key={r.id} className="border-b border-outline-variant">
                    <td className="p-3 font-medium">{r.fromCity?.nameEn ?? '—'}</td>
                    <td className="p-3"><ArrowRight className="w-3 h-3 text-on-surface-variant" /></td>
                    <td className="p-3 font-medium">{r.toCity?.nameEn ?? '—'}</td>
                    <td className="p-3">{r.sortOrder}</td>
                    <td className="p-3">{r.isActive ? '✓' : '—'}</td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <button
                          className="p-1.5 rounded hover:bg-surface-container-high"
                          onClick={() => openEditRoute(r)}
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          className="p-1.5 rounded hover:bg-error/10 text-error"
                          onClick={() => setRouteDelete(r)}
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* City modal */}
      <Modal
        open={cityModalOpen}
        onClose={() => setCityModalOpen(false)}
        title={editingCity ? 'Edit city' : 'New city'}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField label="Name (English)">
            <FormInput value={cityForm.nameEn} onChange={(v) => setCityForm({ ...cityForm, nameEn: v })} />
          </FormField>
          <FormField label="Name (বাংলা)">
            <FormInput value={cityForm.nameBn} onChange={(v) => setCityForm({ ...cityForm, nameBn: v })} />
          </FormField>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField label="Latitude">
            <FormInput
              type="number"
              value={String(cityForm.lat)}
              onChange={(v) => setCityForm({ ...cityForm, lat: Number(v) as any })}
              placeholder="40.71"
            />
          </FormField>
          <FormField label="Longitude">
            <FormInput
              type="number"
              value={String(cityForm.lon)}
              onChange={(v) => setCityForm({ ...cityForm, lon: Number(v) as any })}
              placeholder="-74.01"
            />
          </FormField>
        </div>
        <FormField label="Sort order">
          <FormInput
            type="number"
            value={String(cityForm.sortOrder)}
            onChange={(v) => setCityForm({ ...cityForm, sortOrder: Number(v) as any })}
          />
        </FormField>
        <label className="flex items-center gap-2 text-sm mb-4">
          <input
            type="checkbox"
            checked={cityForm.isActive}
            onChange={(e) => setCityForm({ ...cityForm, isActive: e.target.checked })}
            className="rounded border-outline-variant text-primary focus:ring-primary/50"
          />
          Active (visible on the globe)
        </label>
        <div className="flex justify-end gap-2 pt-2 border-t border-outline-variant">
          <Button variant="outline" onClick={() => setCityModalOpen(false)}>Cancel</Button>
          <Button onClick={saveCity} loading={citySaving}>
            {editingCity ? 'Update' : 'Create'}
          </Button>
        </div>
      </Modal>

      {/* Route modal */}
      <Modal
        open={routeModalOpen}
        onClose={() => setRouteModalOpen(false)}
        title={editingRoute ? 'Edit route' : 'New route'}
      >
        <FormField label="From city">
          <FormSelect
            value={routeForm.fromCityId}
            onChange={(v) => setRouteForm({ ...routeForm, fromCityId: v })}
            options={cityOptions}
            placeholder="Select origin"
          />
        </FormField>
        <FormField label="To city">
          <FormSelect
            value={routeForm.toCityId}
            onChange={(v) => setRouteForm({ ...routeForm, toCityId: v })}
            options={cityOptions}
            placeholder="Select destination"
          />
        </FormField>
        <FormField label="Sort order">
          <FormInput
            type="number"
            value={String(routeForm.sortOrder)}
            onChange={(v) => setRouteForm({ ...routeForm, sortOrder: Number(v) as any })}
          />
        </FormField>
        <label className="flex items-center gap-2 text-sm mb-4">
          <input
            type="checkbox"
            checked={routeForm.isActive}
            onChange={(e) => setRouteForm({ ...routeForm, isActive: e.target.checked })}
            className="rounded border-outline-variant text-primary focus:ring-primary/50"
          />
          Active (visible on the globe)
        </label>
        <div className="flex justify-end gap-2 pt-2 border-t border-outline-variant">
          <Button variant="outline" onClick={() => setRouteModalOpen(false)}>Cancel</Button>
          <Button onClick={saveRoute} loading={routeSaving}>
            {editingRoute ? 'Update' : 'Create'}
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={cityDelete !== null}
        onClose={() => setCityDelete(null)}
        onConfirm={confirmDeleteCity}
        title="Delete city?"
        message={`This will remove "${cityDelete?.nameEn}". Routes that reference it will also be removed.`}
      />
      <ConfirmDialog
        open={routeDelete !== null}
        onClose={() => setRouteDelete(null)}
        onConfirm={confirmDeleteRoute}
        title="Delete route?"
        message="This flight arc will be removed from the globe animation."
      />
    </div>
  );
}
