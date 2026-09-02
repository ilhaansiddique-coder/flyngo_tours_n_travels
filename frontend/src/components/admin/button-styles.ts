export const adminButtonStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '10px 20px',
  fontSize: '14px',
  fontWeight: 600,
  borderRadius: '12px',
  color: '#ffffff',
  border: 'none',
  cursor: 'pointer',
  background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-tertiary) 100%)',
  boxShadow:
    '0 14px 30px -12px color-mix(in oklab, var(--color-primary) 60%, transparent), inset 0 1px 0 color-mix(in oklab, #fff 25%, transparent)',
};

export const adminButtonSmStyle: React.CSSProperties = {
  ...adminButtonStyle,
  padding: '8px 16px',
  fontSize: '13px',
};

export const adminButtonDangerStyle: React.CSSProperties = {
  ...adminButtonStyle,
  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
};

export const adminButtonOutlineStyle: React.CSSProperties = {
  ...adminButtonStyle,
  background: 'transparent',
  color: 'var(--color-on-surface)',
  border: '1px solid var(--color-outline-variant)',
  boxShadow: 'none',
};
