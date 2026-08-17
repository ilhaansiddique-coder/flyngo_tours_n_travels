'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Plus, Pencil, Trash2, Menu as MenuIcon, Eye, EyeOff,
  ChevronUp, ChevronDown, ExternalLink, Star, ArrowUp, ArrowDown,
} from 'lucide-react';
import { useApi } from '@/hooks/use-api';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Modal, FormField, FormInput, FormSelect, ConfirmDialog,
} from '@/components/admin/ui';
import { adminButtonStyle, adminButtonSmStyle, adminButtonOutlineStyle } from '@/components/admin/button-styles';
import { toast } from 'sonner';

interface NavItem {
  id: string;
  labelEn: string;
  labelBn?: string | null;
  translationKey?: string | null;
  href: string;
  linkType: 'INTERNAL' | 'EXTERNAL' | 'SECTION';
  iconName?: string | null;
  isVisible: boolean;
  openInNewTab: boolean;
  highlight: boolean;
  order: number;
  parentId?: string | null;
  children?: NavItem[];
}

const LINK_TYPE_OPTIONS = [
  { label: 'Internal route (/about)', value: 'INTERNAL' },
  { label: 'External URL (https://...)', value: 'EXTERNAL' },
  { label: 'In-page section (#anchor)', value: 'SECTION' },
];

const emptyForm = {
  labelEn: '',
  labelBn: '',
  translationKey: '',
  href: '/',
  linkType: 'INTERNAL',
  iconName: '',
  isVisible: true,
  openInNewTab: false,
  highlight: false,
  parentId: '' as string,
};

function flatten(items: NavItem[]): NavItem[] {
  const out: NavItem[] = [];
  const walk = (arr: NavItem[]) => {
    for (const i of arr) {
      out.push({ ...i, children: undefined });
      if (i.children?.length) walk(i.children);
    }
  };
  walk(items);
  return out;
}

function sortByOrder(items: NavItem[]): NavItem[] {
  return [...items].sort((a, b) => a.order - b.order);
}

export default function AdminNavbarPage() {
  const {
    listNavMenuAdmin, createNavMenu, updateNavMenu, deleteNavMenu, reorderNavMenu,
  } = useApi();

  const [tree, setTree] = useState<NavItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchNav = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = (await listNavMenuAdmin()) as NavItem[];
      setTree(Array.isArray(res) ? res : []);
    } catch (err: any) {
      setError(err.message || 'Failed to load navigation');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps

    fetchNav();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const flatParents = useMemo(() => {
    return sortByOrder(flatten(tree)).filter((i) => !i.parentId);
  }, [tree]);

  const openAddModal = (parentId: string = '') => {
    setEditingId(null);
    setForm({ ...emptyForm, parentId });
    setModalOpen(true);
  };

  const openEditModal = (item: NavItem) => {
    setEditingId(item.id);
    setForm({
      labelEn: item.labelEn || '',
      labelBn: item.labelBn || '',
      translationKey: item.translationKey || '',
      href: item.href || '/',
      linkType: item.linkType || 'INTERNAL',
      iconName: item.iconName || '',
      isVisible: item.isVisible !== false,
      openInNewTab: !!item.openInNewTab,
      highlight: !!item.highlight,
      parentId: item.parentId || '',
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.labelEn.trim() || !form.href.trim()) {
      toast.error('Label (EN) and URL are required');
      return;
    }
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        labelEn: form.labelEn.trim(),
        labelBn: form.labelBn.trim() || null,
        translationKey: form.translationKey.trim() || null,
        href: form.href.trim(),
        linkType: form.linkType,
        iconName: form.iconName.trim() || null,
        isVisible: form.isVisible,
        openInNewTab: form.openInNewTab,
        highlight: form.highlight,
        parentId: form.parentId || null,
      };
      if (editingId) {
        await updateNavMenu(editingId, body);
        toast.success('Menu item updated');
      } else {
        await createNavMenu(body);
        toast.success('Menu item created');
      }
      setModalOpen(false);
      fetchNav();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteNavMenu(deleteId);
      toast.success('Menu item deleted');
      setDeleteId(null);
      fetchNav();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  const moveItem = async (id: string, direction: 'up' | 'down', siblings: NavItem[]) => {
    const idx = siblings.findIndex((s) => s.id === id);
    if (idx === -1) return;
    const swap = direction === 'up' ? idx - 1 : idx + 1;
    if (swap < 0 || swap >= siblings.length) return;
    const a = siblings[idx];
    const b = siblings[swap];
    const items = [
      { id: a.id, order: b.order, parentId: a.parentId ?? null },
      { id: b.id, order: a.order, parentId: b.parentId ?? null },
    ];
    try {
      await reorderNavMenu(items);
      fetchNav();
    } catch (err: any) {
      toast.error(err.message || 'Reorder failed');
    }
  };

  const toggleVisible = async (item: NavItem) => {
    try {
      await updateNavMenu(item.id, { isVisible: !item.isVisible });
      fetchNav();
    } catch (err: any) {
      toast.error(err.message || 'Failed to toggle');
    }
  };

  const renderRow = (item: NavItem, siblings: NavItem[], depth: number) => {
    const idx = siblings.findIndex((s) => s.id === item.id);
    return (
      <div key={item.id} className="border-b border-gray-100 dark:border-gray-800 last:border-b-0">
        <div
          className="flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/30"
          style={{ paddingLeft: 16 + depth * 24 }}
        >
          <div className="flex flex-col">
            <button
              className="p-0.5 text-gray-400 hover:text-brand-600 disabled:opacity-20"
              disabled={idx === 0}
              onClick={() => moveItem(item.id, 'up', siblings)}
              title="Move up"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <button
              className="p-0.5 text-gray-400 hover:text-brand-600 disabled:opacity-20"
              disabled={idx === siblings.length - 1}
              onClick={() => moveItem(item.id, 'down', siblings)}
              title="Move down"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm">
                {item.labelEn || <span className="text-gray-400">(no label)</span>}
              </span>
              {item.labelBn && (
                <span className="text-xs text-gray-500">/ {item.labelBn}</span>
              )}
              {item.translationKey && (
                <Badge variant="info" >{item.translationKey}</Badge>
              )}
              {item.highlight && (
                <Badge variant="warning">
                  <Star className="w-3 h-3 mr-1" /> Highlighted
                </Badge>
              )}
              {!item.isVisible && (
                <Badge variant="default">
                  <EyeOff className="w-3 h-3 mr-1" /> Hidden
                </Badge>
              )}
              {item.linkType === 'EXTERNAL' && (
                <Badge variant="info">
                  <ExternalLink className="w-3 h-3 mr-1" /> External
                </Badge>
              )}
              {item.openInNewTab && (
                <Badge variant="info">New tab</Badge>
              )}
            </div>
            <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
              <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">{item.href}</code>
              <span className="text-gray-400">order: {item.order}</span>
              <span className="text-gray-400 capitalize">{item.linkType.toLowerCase()}</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-brand-600"
              title={item.isVisible ? 'Hide' : 'Show'}
              onClick={() => toggleVisible(item)}
            >
              {item.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
            {depth === 0 && (
              <button
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-brand-600"
                title="Add sub-item"
                onClick={() => openAddModal(item.id)}
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
            <button
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-brand-600"
              title="Edit"
              onClick={() => openEditModal(item)}
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900 text-gray-500 hover:text-red-600"
              title="Delete"
              onClick={() => setDeleteId(item.id)}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        {item.children?.map((child) => renderRow(child, sortByOrder(item.children ?? []), depth + 1))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-gray-500">Loading navigation…</p>
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

  const topLevel = sortByOrder(tree);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <MenuIcon className="w-5 h-5 text-brand-600" /> Navbar / Menu
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Top-level items appear in the header. Sub-items appear in dropdowns. Reorder with arrows.
          </p>
        </div>
        <button onClick={() => openAddModal('')} style={adminButtonStyle} className="hover:opacity-95 active:scale-[0.98] transition-all">
          <Plus className="w-4 h-4" /> Add Menu Item
        </button>
      </div>

      <Card hover={false} padding="none">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-wrap items-center gap-3 text-xs text-gray-500">
          <span className="font-semibold text-gray-700 dark:text-gray-200 text-sm">{flatParents.length} top-level</span>
          <span>·</span>
          <span>{flatten(tree).length} total</span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <ArrowUp className="w-3 h-3" /><ArrowDown className="w-3 h-3" /> Use arrows to reorder
          </span>
        </div>
        {topLevel.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <MenuIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p>No menu items yet. Click "Add Menu Item" to create the first one.</p>
          </div>
        ) : (
          <div>
            {topLevel.map((item) => renderRow(item, topLevel, 0))}
          </div>
        )}
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Menu Item' : 'Add Menu Item'}
      >
        <FormField label="Label (English)" required>
          <FormInput
            value={form.labelEn}
            onChange={(v) => setForm((f) => ({ ...f, labelEn: v }))}
            placeholder="e.g. Tours"
            required
          />
        </FormField>

        <FormField label="Label (Bengali)">
          <FormInput
            value={form.labelBn}
            onChange={(v) => setForm((f) => ({ ...f, labelBn: v }))}
            placeholder="ট্যুর (optional)"
          />
        </FormField>

        <FormField label="i18n key (optional)">
          <FormInput
            value={form.translationKey}
            onChange={(v) => setForm((f) => ({ ...f, translationKey: v }))}
            placeholder="nav_tours"
          />
          <p className="text-xs text-gray-500 mt-1">
            When set, the public site uses this key from the translation catalog instead of the labels above.
          </p>
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="URL / Path" required>
            <FormInput
              value={form.href}
              onChange={(v) => setForm((f) => ({ ...f, href: v }))}
              placeholder="/tours"
              required
            />
          </FormField>
          <FormField label="Link type">
            <FormSelect
              value={form.linkType}
              onChange={(v) => setForm((f) => ({ ...f, linkType: v as any }))}
              options={LINK_TYPE_OPTIONS}
            />
          </FormField>
        </div>

        <FormField label="Icon name (optional)">
          <FormInput
            value={form.iconName}
            onChange={(v) => setForm((f) => ({ ...f, iconName: v }))}
            placeholder="e.g. Plane"
          />
          <p className="text-xs text-gray-500 mt-1">
            Lucide icon name (kept as a string so the public site can resolve it).
          </p>
        </FormField>

        <FormField label="Parent (sub-menu)">
          <FormSelect
            value={form.parentId}
            onChange={(v) => setForm((f) => ({ ...f, parentId: v }))}
            placeholder="— Top level —"
            options={flatParents
              .filter((p) => p.id !== editingId)
              .map((p) => ({ label: p.labelEn, value: p.id }))}
          />
          <p className="text-xs text-gray-500 mt-1">
            Picking a parent nests this item as a dropdown sub-link.
          </p>
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isVisible}
              onChange={(e) => setForm((f) => ({ ...f, isVisible: e.target.checked }))}
              className="w-4 h-4 rounded border-gray-300 dark:border-gray-700 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm font-medium">Visible</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.openInNewTab}
              onChange={(e) => setForm((f) => ({ ...f, openInNewTab: e.target.checked }))}
              className="w-4 h-4 rounded border-gray-300 dark:border-gray-700 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm font-medium">Open in new tab</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.highlight}
              onChange={(e) => setForm((f) => ({ ...f, highlight: e.target.checked }))}
              className="w-4 h-4 rounded border-gray-300 dark:border-gray-700 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm font-medium">Highlight</span>
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800 mt-6">
          <button onClick={() => setModalOpen(false)} style={adminButtonOutlineStyle}>Cancel</button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={adminButtonSmStyle}
            className="hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving…' : editingId ? 'Update' : 'Create'}
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete menu item"
        message="This will remove the menu item and any sub-items under it. The page URL is unaffected."
      />
    </div>
  );
}