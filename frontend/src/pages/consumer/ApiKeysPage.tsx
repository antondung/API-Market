import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { useLanguage } from '../../i18n';

export const ApiKeysPage: React.FC = () => {
  const { apiKeys, apis, createApiKey, rotateApiKey, revokeApiKey } = useApp();
  const { t } = useLanguage();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [selectedApiId, setSelectedApiId] = useState(apis[0]?.id || '');
  
  // Show once reveal modal
  const [revealedKeySecret, setRevealedKeySecret] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    const { secretPlainText } = createApiKey(newKeyName, selectedApiId);
    setCreateModalOpen(false);
    setNewKeyName('');
    setRevealedKeySecret(secretPlainText);
  };

  const handleRotateKey = (keyId: string) => {
    if (confirm(t('Rotating this API key will immediately invalidate the previous secret. Continue?') || 'Rotating this API key will immediately invalidate the previous secret. Continue?')) {
      const { newSecretPlainText } = rotateApiKey(keyId);
      setRevealedKeySecret(newSecretPlainText);
    }
  };

  const handleCopySecret = () => {
    if (revealedKeySecret) {
      navigator.clipboard.writeText(revealedKeySecret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-outline-variant/30">
        <div>
          <h1 className="text-headline-lg font-bold text-on-surface">{t('API Keys & Credentials Vault')}</h1>
          <p className="text-body-md text-on-surface-variant">
            {t('Manage your cryptographic access tokens. Plaintext is only exposed once upon creation pursuant to US-21 security policy.')}
          </p>
        </div>
        <Button
          variant="primary"
          icon="add"
          onClick={() => setCreateModalOpen(true)}
        >
          {t('Create New API Key')}
        </Button>
      </div>

      {/* Security Info Card */}
      <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-start gap-3">
        <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">lock</span>
        <div className="text-body-sm text-on-surface-variant leading-relaxed">
          <strong className="text-on-surface">{t('Zero Plaintext Policy:')} </strong>
          {t('The Control Plane stores SHA-256 hashes of your secrets. If you lose a key, rotate it immediately to issue a new secret.')}
        </div>
      </div>

      {/* Keys Table */}
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-body-sm">
          <thead className="bg-surface-container text-on-surface-variant text-[11px] uppercase font-semibold border-b border-outline-variant/20">
            <tr>
              <th className="px-5 py-3.5">{t('Key Name & Target API')}</th>
              <th className="px-5 py-3.5">{t('Masked Prefix')}</th>
              <th className="px-5 py-3.5">{t('Status')}</th>
              <th className="px-5 py-3.5">{t('Created')}</th>
              <th className="px-5 py-3.5">{t('Last Used')}</th>
              <th className="px-5 py-3.5 text-right">{t('Actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/15 text-on-surface">
            {apiKeys.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-on-surface-variant">
                  <div className="flex flex-col items-center justify-center">
                    <span className="material-symbols-outlined text-[36px] text-on-surface-variant/40 mb-2">key_off</span>
                    <p className="font-semibold text-on-surface">{t('No API keys generated yet')}</p>
                    <p className="text-body-sm text-on-surface-variant max-w-sm mt-1">{t('Generate your first API key to authenticate requests with the API Gateway.')}</p>
                    <Button variant="primary" size="sm" icon="add" className="mt-4" onClick={() => setCreateModalOpen(true)}>
                      {t('Create API Key')}
                    </Button>
                  </div>
                </td>
              </tr>
            ) : (
              apiKeys.map(k => (
                <tr key={k.id} className="hover:bg-surface-container/40 transition-colors">
                  <td className="px-5 py-4">
                    <span className="font-semibold text-on-surface block">{k.name}</span>
                    <span className="text-[12px] text-on-surface-variant">{k.apiName ? t(k.apiName) : t('General Access')}</span>
                  </td>
                  <td className="px-5 py-4 font-code-md text-code-sm text-primary font-semibold">
                    {k.keyPrefix}
                  </td>
                  <td className="px-5 py-4">
                    {k.isRevoked ? (
                      <Badge variant="danger" size="sm">{t('Revoked')}</Badge>
                    ) : (
                      <Badge variant="success" size="sm">{t('Active')}</Badge>
                    )}
                  </td>
                  <td className="px-5 py-4 text-on-surface-variant font-code-sm">
                    {new Date(k.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4 text-on-surface-variant font-code-sm">
                    {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleTimeString() : t('Never')}
                  </td>
                  <td className="px-5 py-4 text-right">
                    {!k.isRevoked && (
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          icon="sync"
                          onClick={() => handleRotateKey(k.id)}
                        >
                          {t('Rotate')}
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          icon="delete"
                          onClick={() => {
                            if (confirm(`Revoke key "${k.name}"? Applications using this key will immediately fail with 401.`)) {
                              revokeApiKey(k.id);
                            }
                          }}
                        >
                          {t('Revoke')}
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Key Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title={t('Create New API Key')}
        description={t('Issue an authentication token for upstream Gateway requests')}
      >
        <form onSubmit={handleCreateKey} className="space-y-4">
          <div>
            <label className="text-body-sm font-medium text-on-surface block mb-1">{t('Key Name / Environment Label')}</label>
            <input
              type="text"
              required
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder={t('e.g. Production Cluster v4, CI Test Runner')}
              className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface-container-low text-on-surface text-body-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="text-body-sm font-medium text-on-surface block mb-1">{t('Target API Scope')}</label>
            <select
              value={selectedApiId}
              onChange={(e) => setSelectedApiId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface-container-low text-on-surface text-body-sm outline-none"
            >
              <option value="">{t('Universal / All APIs')}</option>
              {apis.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="outline" onClick={() => setCreateModalOpen(false)}>
              {t('Cancel')}
            </Button>
            <Button type="submit" variant="primary">
              {t('Generate Secret Key')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Show Once Key Reveal Modal */}
      <Modal
        isOpen={!!revealedKeySecret}
        onClose={() => setRevealedKeySecret(null)}
        title={t('Copy Your New API Secret')}
        description={t('This secret token will NEVER be shown again. Store it securely in your secret manager.')}
      >
        <div className="space-y-4">
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-body-sm text-amber-800 flex items-start gap-2">
            <span className="material-symbols-outlined text-amber-600 text-[20px] flex-shrink-0">warning</span>
            <span>
              {t('If you close this modal without copying, you will need to rotate the key to generate a new one.')}
            </span>
          </div>

          <div className="p-4 bg-[#111625] rounded-xl border border-outline-variant/40 text-emerald-400 font-code-md text-code-sm break-all flex items-center justify-between gap-3">
            <span>{revealedKeySecret}</span>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleCopySecret}
              icon={copied ? 'check' : 'content_copy'}
            >
              {copied ? t('Copied') : t('Copy')}
            </Button>
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="primary" onClick={() => setRevealedKeySecret(null)}>
              {t('I Have Saved This Key Securely')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
