'use client';

import { useEffect, useState } from 'react';
import {
  Plus, Pencil, Trash2, LayoutGrid, ChevronUp, ChevronDown,
  GripVertical, Link2, Save, Globe,
} from 'lucide-react';
import { useApi } from '@/hooks/use-api';
import { Card } from '@/components/ui/card';
import {
  Modal, FormField, FormInput, ConfirmDialog,
} from '@/components/admin/ui';
import { adminButtonStyle, adminButtonSmStyle, adminButtonOutlineStyle } from '@/components/admin/button-styles';
import { toast } from 'sonner';

interface FooterLink {
  id: string;
  labelEn: string;
  labelBn?: string | null;
  translationKey?: string | null;
  href: string;
  linkType: 'INTERNAL' | 'EXTERNAL' | 'SECTION';
  openInNewTab?: boolean;
}

interface FooterColumn {
  id: string;
  headingEn: string;
  headingBn?: string | null;
  translationKey?: string | null;
  order: number;
  isVisible?: boolean;
  links: FooterLink[];
}

interface FooterState {
  taglineEn: string;
  taglineBn: string;
  accentLabelEn: string;
  accentLabelBn: string;
  contactEmail: string;
  contactPhone: string;
  contactNoteEn: string;
  contactNoteBn: string;
  copyrightTextEn: string;
  copyrightTextBn: string;
  showLanguageToggle: boolean;
  showShareButton: boolean;
  columns: FooterColumn[];
}

const blankLink: FooterLink = {
  id: '', labelEn: '', labelBn: '', translationKey: '',
  href: '', linkType: 'INTERNAL', openInNewTab: false,
};

const blankColumn: FooterColumn = {
  id: '', headingEn: '', headingBn: '', translationKey: '',
  order: 0, isVisible: true, links: [],
};

function genId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-4)}`;
}

const emptyFooter: FooterState = {
  taglineEn: '',
  taglineBn: '',
  accentLabelEn: '',
  accentLabelBn: '',
  contactEmail: '',
  contactPhone: '',
  contactNoteEn: '',
  contactNoteBn: '',
  copyrightTextEn: '',
  copyrightTextBn: '',
  showLanguageToggle: true,
  showShareButton: true,
  columns: [],
};

export default function AdminFooterPage() {
  const { getFooterAdmin, updateFooter } = useApi();
  const [footer, setFooter] = useState<FooterState>(emptyFooter);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [columnModalOpen, setColumnModalOpen] = useState(false);
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [columnForm, setColumnForm] = useState<FooterColumn>(blankColumn);

  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkColumnId, setLinkColumnId] = useState<string | null>(null);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [linkForm, setLinkForm] = useState<FooterLink>(blankLink);

  const [deleteColumnId, setDeleteColumnId] = useState<string | null>(null);
  const [deleteLinkId, setDeleteLinkId] = useState<string | null>(null);

  const fetchFooter = async () => {
    setLoading(true);
    try {
      const res = (await getFooterAdmin()) as any;
      if (!res) return;
      const cols = Array.isArray(res.columns) ? res.columns : [];
      setFooter({
        taglineEn: res.taglineEn || '',
        taglineBn: res.taglineBn || '',
        accentLabelEn: res.accentLabelEn || '',
        accentLabelBn: res.accentLabelBn || '',
        contactEmail: res.contactEmail || '',
        contactPhone: res.contactPhone || '',
        contactNoteEn: res.contactNoteEn || '',
        contactNoteBn: res.contactNoteBn || '',
        copyrightTextEn: res.copyrightTextEn || '',
        copyrightTextBn: res.copyrightTextBn || '',
        showLanguageToggle: res.showLanguageToggle !== false,
        showShareButton: res.showShareButton !== false,
        columns: cols
          .map((c: FooterColumn, i: number) => ({
            id: c.id || genId('col'),
            headingEn: c.headingEn || '',
            headingBn: c.headingBn || '',
            translationKey: c.translationKey || '',
            order: typeof c.order === 'number' ? c.order : i,
            isVisible: c.isVisible !== false,
            links: (c.links || []).map((l: FooterLink) => ({
              id: l.id || genId('lnk'),
              labelEn: l.labelEn || '',
              labelBn: l.labelBn || '',
              translationKey: l.translationKey || '',
              href: l.href || '',
              linkType: l.linkType || 'INTERNAL',
              openInNewTab: !!l.openInNewTab,
            })),
          }))
          .sort((a: FooterColumn, b: FooterColumn) => a.order - b.order),
      });
    } catch (err: any) {
      toast.error(err.message || 'Failed to load footer');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps

    fetchFooter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persist = async (next: FooterState) => {
    setSaving(true);
    try {
      await updateFooter({
        taglineEn: next.taglineEn,
        taglineBn: next.taglineBn,
        accentLabelEn: next.accentLabelEn,
        accentLabelBn: next.accentLabelBn,
        contactEmail: next.contactEmail,
        contactPhone: next.contactPhone,
        contactNoteEn: next.contactNoteEn,
        contactNoteBn: next.contactNoteBn,
        copyrightTextEn: next.copyrightTextEn,
        copyrightTextBn: next.copyrightTextBn,
        showLanguageToggle: next.showLanguageToggle,
        showShareButton: next.showShareButton,
        columns: next.columns,
      });
      toast.success('Footer saved');
    } catch (err: any) {
      toast.error(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const saveMain = async () => {
    await persist(footer);
  };

  // -------- column CRUD --------

  const openAddColumn = () => {
    setEditingColumnId(null);
    setColumnForm({
      ...blankColumn,
      id: genId('col'),
      order: footer.columns.length,
    });
    setColumnModalOpen(true);
  };

  const openEditColumn = (col: FooterColumn) => {
    setEditingColumnId(col.id);
    setColumnForm({ ...col });
    setColumnModalOpen(true);
  };

  const saveColumn = () => {
    if (!columnForm.headingEn.trim()) {
      toast.error('Column heading (EN) is required');
      return;
    }
    const next = { ...footer };
    const col = {
      ...columnForm,
      id: columnForm.id || genId('col'),
      headingEn: columnForm.headingEn.trim(),
    };
    if (editingColumnId) {
      next.columns = footer.columns.map((c) => (c.id === editingColumnId ? col : c));
    } else {
      next.columns = [...footer.columns, col];
    }
    setFooter(next);
    setColumnModalOpen(false);
    persist(next);
  };

  const deleteColumn = () => {
    if (!deleteColumnId) return;
    const next = {
      ...footer,
      columns: footer.columns
        .filter((c) => c.id !== deleteColumnId)
        .map((c, i) => ({ ...c, order: i })),
    };
    setFooter(next);
    setDeleteColumnId(null);
    persist(next);
  };

  const moveColumn = (id: string, dir: 'up' | 'down') => {
    const idx = footer.columns.findIndex((c) => c.id === id);
    if (idx === -1) return;
    const swap = dir === 'up' ? idx - 1 : idx + 1;
    if (swap < 0 || swap >= footer.columns.length) return;
    const cols = [...footer.columns];
    const a = cols[idx];
    const b = cols[swap];
    cols[idx] = { ...b, order: a.order };
    cols[swap] = { ...a, order: b.order };
    const next = { ...footer, columns: cols };
    setFooter(next);
    persist(next);
  };

  // -------- link CRUD --------

  const openAddLink = (columnId: string) => {
    setLinkColumnId(columnId);
    setEditingLinkId(null);
    setLinkForm({ ...blankLink, id: genId('lnk') });
    setLinkModalOpen(true);
  };

  const openEditLink = (columnId: string, link: FooterLink) => {
    setLinkColumnId(columnId);
    setEditingLinkId(link.id);
    setLinkForm({ ...link });
    setLinkModalOpen(true);
  };

  const saveLink = () => {
    if (!linkColumnId) return;
    if (!linkForm.labelEn.trim() || !linkForm.href.trim()) {
      toast.error('Label (EN) and URL are required');
      return;
    }
    const link = {
      ...linkForm,
      id: linkForm.id || genId('lnk'),
      labelEn: linkForm.labelEn.trim(),
      href: linkForm.href.trim(),
    };
    const next = { ...footer };
    next.columns = footer.columns.map((c) => {
      if (c.id !== linkColumnId) return c;
      const links = editingLinkId
        ? c.links.map((l) => (l.id === editingLinkId ? link : l))
        : [...c.links, link];
      return { ...c, links };
    });
    setFooter(next);
    setLinkModalOpen(false);
    persist(next);
  };

  const deleteLink = () => {
    if (!linkColumnId || !deleteLinkId) return;
    const next = { ...footer };
    next.columns = footer.columns.map((c) => {
      if (c.id !== linkColumnId) return c;
      return { ...c, links: c.links.filter((l) => l.id !== deleteLinkId) };
    });
    setFooter(next);
    setDeleteLinkId(null);
    persist(next);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-gray-500">Loading footer…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-brand-600" /> Footer
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage the brand block, link columns, contact info, and the bottom bar of the public site.
          </p>
        </div>
      </div>

      <Card hover={false}>
        <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
          <Globe className="w-4 h-4" /> Brand block
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Tagline (English)">
            <textarea
              value={footer.taglineEn}
              onChange={(e) => setFooter((f) => ({ ...f, taglineEn: e.target.value }))}
              rows={3}
              className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm bg-surface-container focus:ring-2 focus:ring-primary/50 outline-none resize-none"
              placeholder="Short brand statement shown under the logo…"
            />
          </FormField>
          <FormField label="Tagline (Bengali)">
            <textarea
              value={footer.taglineBn}
              onChange={(e) => setFooter((f) => ({ ...f, taglineBn: e.target.value }))}
              rows={3}
              className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm bg-surface-container focus:ring-2 focus:ring-primary/50 outline-none resize-none"
              placeholder="বাংলা ট্যাগলাইন (optional)…"
            />
          </FormField>
          <FormField label="Accent label (English)">
            <FormInput
              value={footer.accentLabelEn}
              onChange={(v) => setFooter((f) => ({ ...f, accentLabelEn: v }))}
              placeholder="High Velocity Luxury"
            />
          </FormField>
          <FormField label="Accent label (Bengali)">
            <FormInput
              value={footer.accentLabelBn}
              onChange={(v) => setFooter((f) => ({ ...f, accentLabelBn: v }))}
              placeholder="ঐচ্ছিক"
            />
          </FormField>
        </div>
      </Card>

      <Card hover={false}>
        <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
          <Link2 className="w-4 h-4" /> Link columns
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Add columns such as "Services" or "Company", then add individual links inside each.
        </p>

        <div className="flex justify-end mb-3">
          <button onClick={openAddColumn} style={adminButtonStyle} className="hover:opacity-95 active:scale-[0.98]">
            <Plus className="w-4 h-4" /> Add Column
          </button>
        </div>

        {footer.columns.length === 0 ? (
          <div className="text-center py-10 text-gray-500 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
            No columns yet. Click "Add Column" to create one.
          </div>
        ) : (
          <div className="space-y-4">
            {footer.columns.map((col, idx) => (
              <div key={col.id} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/40">
                  <GripVertical className="w-4 h-4 text-gray-400" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">{col.headingEn}</span>
                      {col.headingBn && (
                        <span className="text-xs text-gray-500">/ {col.headingBn}</span>
                      )}
                      {col.translationKey && (
                        <span className="text-xs px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                          {col.translationKey}
                        </span>
                      )}
                      <span className="text-xs text-gray-400">({col.links.length} links)</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-20"
                      disabled={idx === 0}
                      onClick={() => moveColumn(col.id, 'up')}
                      title="Move up"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-20"
                      disabled={idx === footer.columns.length - 1}
                      onClick={() => moveColumn(col.id, 'down')}
                      title="Move down"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 hover:text-brand-600"
                      title="Edit column"
                      onClick={() => openEditColumn(col)}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900 text-gray-500 hover:text-red-600"
                      title="Delete column"
                      onClick={() => setDeleteColumnId(col.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-3 space-y-2">
                  {col.links.length === 0 && (
                    <div className="text-sm text-gray-400 py-2">No links yet.</div>
                  )}
                  {col.links.map((link) => (
                    <div key={link.id} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/40 group">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium">{link.labelEn}</span>
                          {link.labelBn && (
                            <span className="text-xs text-gray-500">/ {link.labelBn}</span>
                          )}
                          {link.openInNewTab && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">new tab</span>
                          )}
                        </div>
                        <code className="text-xs text-gray-500">{link.href}</code>
                      </div>
                      <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100">
                        <button
                          className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 hover:text-brand-600"
                          onClick={() => openEditLink(col.id, link)}
                          title="Edit link"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900 text-gray-500 hover:text-red-600"
                          onClick={() => { setLinkColumnId(col.id); setDeleteLinkId(link.id); }}
                          title="Delete link"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => openAddLink(col.id)}
                    className="w-full text-sm text-gray-500 hover:text-brand-600 hover:bg-gray-50 dark:hover:bg-gray-800/40 rounded-lg py-2 flex items-center justify-center gap-1 border border-dashed border-gray-200 dark:border-gray-700"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add link
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card hover={false}>
        <h3 className="font-display text-lg font-bold mb-4">Contact + Bottom bar</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Contact email">
            <FormInput
              value={footer.contactEmail}
              onChange={(v) => setFooter((f) => ({ ...f, contactEmail: v }))}
              placeholder="contact@flyngo.com"
              type="email"
            />
          </FormField>
          <FormField label="Contact phone">
            <FormInput
              value={footer.contactPhone}
              onChange={(v) => setFooter((f) => ({ ...f, contactPhone: v }))}
              placeholder="+1-800-FLYNGO"
            />
          </FormField>
          <FormField label="Contact note (EN)">
            <FormInput
              value={footer.contactNoteEn}
              onChange={(v) => setFooter((f) => ({ ...f, contactNoteEn: v }))}
              placeholder="24/7 concierge · Multilingual support"
            />
          </FormField>
          <FormField label="Contact note (BN)">
            <FormInput
              value={footer.contactNoteBn}
              onChange={(v) => setFooter((f) => ({ ...f, contactNoteBn: v }))}
              placeholder="ঐচ্ছিক"
            />
          </FormField>
          <FormField label="Copyright text (EN)">
            <FormInput
              value={footer.copyrightTextEn}
              onChange={(v) => setFooter((f) => ({ ...f, copyrightTextEn: v }))}
              placeholder="Leave blank to use default '© YYYY FlynGo Travel. All rights reserved.'"
            />
          </FormField>
          <FormField label="Copyright text (BN)">
            <FormInput
              value={footer.copyrightTextBn}
              onChange={(v) => setFooter((f) => ({ ...f, copyrightTextBn: v }))}
              placeholder="ঐচ্ছিক"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={footer.showLanguageToggle}
              onChange={(e) => setFooter((f) => ({ ...f, showLanguageToggle: e.target.checked }))}
              className="w-4 h-4 rounded border-gray-300 dark:border-gray-700 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm font-medium">Show language toggle in bottom bar</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={footer.showShareButton}
              onChange={(e) => setFooter((f) => ({ ...f, showShareButton: e.target.checked }))}
              className="w-4 h-4 rounded border-gray-300 dark:border-gray-700 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm font-medium">Show share button in bottom bar</span>
          </label>
        </div>
      </Card>

      <div className="flex justify-end">
        <button
          onClick={saveMain}
          disabled={saving}
          style={adminButtonStyle}
          className="hover:opacity-95 disabled:opacity-50 active:scale-[0.98] transition-all"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving…' : 'Save Footer'}
        </button>
      </div>

      {/* -------- column modal -------- */}
      <Modal
        open={columnModalOpen}
        onClose={() => setColumnModalOpen(false)}
        title={editingColumnId ? 'Edit Column' : 'Add Column'}
      >
        <FormField label="Heading (English)" required>
          <FormInput
            value={columnForm.headingEn}
            onChange={(v) => setColumnForm((f) => ({ ...f, headingEn: v }))}
            placeholder="e.g. Services"
            required
          />
        </FormField>
        <FormField label="Heading (Bengali)">
          <FormInput
            value={columnForm.headingBn ?? ''}
            onChange={(v) => setColumnForm((f) => ({ ...f, headingBn: v }))}
            placeholder="সেবা"
          />
        </FormField>
        <FormField label="i18n key (optional)">
          <FormInput
            value={columnForm.translationKey ?? ''}
            onChange={(v) => setColumnForm((f) => ({ ...f, translationKey: v }))}
            placeholder="footer_services"
          />
        </FormField>
        <FormField label="Order">
          <input
            type="number"
            value={columnForm.order}
            onChange={(e) => setColumnForm((f) => ({ ...f, order: Math.max(0, Number(e.target.value) || 0) }))}
            className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm bg-surface-container focus:ring-2 focus:ring-primary/50 outline-none"
          />
        </FormField>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800 mt-2">
          <button onClick={() => setColumnModalOpen(false)} style={adminButtonOutlineStyle}>Cancel</button>
          <button onClick={saveColumn} style={adminButtonSmStyle} className="hover:opacity-95">
            {editingColumnId ? 'Update' : 'Create'}
          </button>
        </div>
      </Modal>

      {/* -------- link modal -------- */}
      <Modal
        open={linkModalOpen}
        onClose={() => setLinkModalOpen(false)}
        title={editingLinkId ? 'Edit Link' : 'Add Link'}
      >
        <FormField label="Label (English)" required>
          <FormInput
            value={linkForm.labelEn}
            onChange={(v) => setLinkForm((f) => ({ ...f, labelEn: v }))}
            placeholder="e.g. Tours"
            required
          />
        </FormField>
        <FormField label="Label (Bengali)">
          <FormInput
            value={linkForm.labelBn ?? ''}
            onChange={(v) => setLinkForm((f) => ({ ...f, labelBn: v }))}
            placeholder="ট্যুর"
          />
        </FormField>
        <FormField label="i18n key (optional)">
          <FormInput
            value={linkForm.translationKey ?? ''}
            onChange={(v) => setLinkForm((f) => ({ ...f, translationKey: v }))}
            placeholder="footer_link_tours"
          />
        </FormField>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="URL / Path" required>
            <FormInput
              value={linkForm.href}
              onChange={(v) => setLinkForm((f) => ({ ...f, href: v }))}
              placeholder="/tours"
              required
            />
          </FormField>
          <FormField label="Link type">
            <select
              value={linkForm.linkType}
              onChange={(e) => setLinkForm((f) => ({ ...f, linkType: e.target.value as any }))}
              className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm bg-surface-container focus:ring-2 focus:ring-primary/50 outline-none"
            >
              <option value="INTERNAL">Internal route</option>
              <option value="EXTERNAL">External URL</option>
              <option value="SECTION">In-page section</option>
            </select>
          </FormField>
        </div>
        <label className="flex items-center gap-2 cursor-pointer mt-2">
          <input
            type="checkbox"
            checked={!!linkForm.openInNewTab}
            onChange={(e) => setLinkForm((f) => ({ ...f, openInNewTab: e.target.checked }))}
            className="w-4 h-4 rounded border-gray-300 dark:border-gray-700 text-brand-600 focus:ring-brand-500"
          />
          <span className="text-sm font-medium">Open in new tab</span>
        </label>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800 mt-4">
          <button onClick={() => setLinkModalOpen(false)} style={adminButtonOutlineStyle}>Cancel</button>
          <button onClick={saveLink} style={adminButtonSmStyle} className="hover:opacity-95">
            {editingLinkId ? 'Update' : 'Create'}
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteColumnId !== null}
        onClose={() => setDeleteColumnId(null)}
        onConfirm={deleteColumn}
        title="Delete column"
        message="All links inside this column will be removed. This cannot be undone."
      />

      <ConfirmDialog
        open={deleteLinkId !== null}
        onClose={() => { setDeleteLinkId(null); setLinkColumnId(null); }}
        onConfirm={deleteLink}
        title="Delete link"
        message="This link will be removed from the column."
      />
    </div>
  );
}