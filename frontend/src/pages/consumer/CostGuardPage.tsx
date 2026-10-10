import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import { useLanguage } from '../../i18n';

export const CostGuardPage: React.FC = () => {
  const { budget, updateBudget, notifications, markNotificationRead, markAllNotificationsRead } = useApp();
  const { t } = useLanguage();

  const [budgetCap, setBudgetCap] = useState(budget.monthlyBudgetUsd.toString());
  const [hardCutoff, setHardCutoff] = useState(budget.hardCutoffAt100);
  const [filterType, setFilterType] = useState<'all' | 'warning' | 'critical'>('all');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const spentPercent = Math.min(100, Math.round((budget.spentUsd / budget.monthlyBudgetUsd) * 100));

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(budgetCap);
    if (!isNaN(val) && val > 0) {
      updateBudget({
        monthlyBudgetUsd: val,
        hardCutoffAt100: hardCutoff
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    }
  };

  const filteredNotifs = notifications.filter(n => {
    if (filterType === 'all') return true;
    return n.type === filterType;
  });

  return (
    <div className="space-y-8">
      <div className="pb-6 border-b border-outline-variant/30">
        <h1 className="text-headline-lg font-bold text-on-surface">{t('API Cost Guard & Notification Center')}</h1>
        <p className="text-body-md text-on-surface-variant">
          {t('Set proactive spending thresholds, automate hard cutoffs, and monitor real-time rate limit alerts.')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 1 Col: Budget & Guard Controls */}
        <div className="space-y-6">
          <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
            <h3 className="text-headline-sm font-bold text-on-surface mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[22px]">shield_with_heart</span>
              {t('Cost Guard Policy')}
            </h3>
            <p className="text-body-sm text-on-surface-variant mb-5">
              {t('Safeguard against runaway API loop scripts or unexpected invoice spikes.')}
            </p>

            <form onSubmit={handleSaveBudget} className="space-y-4">
              <div>
                <label className="text-body-sm font-medium text-on-surface block mb-1">
                  {t('Monthly Spend Limit ($ USD)')}
                </label>
                <div className="flex items-center bg-surface-container rounded-xl border border-outline-variant/40 px-3 py-2">
                  <span className="text-body-md text-on-surface-variant font-bold mr-1.5">$</span>
                  <input
                    type="number"
                    min="10"
                    step="5"
                    value={budgetCap}
                    onChange={(e) => setBudgetCap(e.target.value)}
                    className="w-full bg-transparent text-body-md font-bold text-on-surface outline-none"
                  />
                </div>
              </div>

              {/* Hard Cutoff Toggle */}
              <div className="p-3.5 rounded-xl bg-surface-container border border-outline-variant/30 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="hardCutoff"
                  checked={hardCutoff}
                  onChange={(e) => setHardCutoff(e.target.checked)}
                  className="rounded accent-primary w-4 h-4 mt-0.5 cursor-pointer"
                />
                <label htmlFor="hardCutoff" className="cursor-pointer select-none text-body-sm">
                  <strong className="text-on-surface font-semibold block">{t('100% Hard Cutoff')}</strong>
                  <span className="text-on-surface-variant text-[12px] leading-relaxed block mt-0.5">
                    {t('API Gateway will immediately reject subsequent calls with HTTP 429 when budget cap is exhausted.')}
                  </span>
                </label>
              </div>

              <div className="space-y-2 text-body-sm text-on-surface-variant pt-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-600 text-[18px]">check</span>
                  <span>{t('50% Budget info notification')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-600 text-[18px]">warning</span>
                  <span>{t('80% Urgent escalation email alert')}</span>
                </div>
              </div>

              <Button type="submit" variant="primary" size="md" className="w-full">
                {savedSuccess ? t('Policy saved successfully!') : t('Save Guard Policy')}
              </Button>
            </form>
          </div>

          {/* Current Spent Progress */}
          <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
            <span className="text-label-md font-semibold text-on-surface-variant uppercase block mb-1">
              {t('Budget Consumption')}
            </span>
            <div className="flex items-baseline justify-between mb-3">
              <span className="text-3xl font-extrabold text-on-surface font-code-md">
                ${budget.spentUsd.toFixed(2)}
              </span>
              <span className="text-body-sm text-on-surface-variant font-code-md">
                / ${budget.monthlyBudgetUsd.toFixed(2)} ({spentPercent}%)
              </span>
            </div>
            <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${
                  spentPercent > 80 ? 'bg-amber-500' : 'bg-emerald-600'
                }`}
                style={{ width: `${spentPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right 2 Cols: Notification Stream */}
        <div className="lg:col-span-2 bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-headline-sm font-bold text-on-surface">{t('Real-Time Rate Limit & Guard Event Stream')}</h3>
                <p className="text-body-sm text-on-surface-variant">
                  {t('System announcements, quota proximity triggers, and rate limit telemetry.')}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1 rounded-lg text-body-sm transition-colors ${
                    filterType === 'all' ? 'bg-primary-container text-on-primary-container font-medium' : 'text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  {t('All Alerts')}
                </button>
                <button
                  onClick={() => setFilterType('warning')}
                  className={`px-3 py-1 rounded-lg text-body-sm transition-colors ${
                    filterType === 'warning' ? 'bg-primary-container text-on-primary-container font-medium' : 'text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  {t('Warning')}
                </button>
                <button
                  onClick={() => setFilterType('critical')}
                  className={`px-3 py-1 rounded-lg text-body-sm transition-colors ${
                    filterType === 'critical' ? 'bg-primary-container text-on-primary-container font-medium' : 'text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  {t('Critical')}
                </button>
                <button
                  onClick={markAllNotificationsRead}
                  className="text-body-sm text-primary hover:underline ml-2"
                >
                  {t('Mark all read')}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {filteredNotifs.length === 0 ? (
                <div className="p-12 text-center text-body-sm text-on-surface-variant">
                  {t('No cost alerts in current window')}
                </div>
              ) : (
                filteredNotifs.map(n => (
                  <div
                    key={n.id}
                    onClick={() => markNotificationRead(n.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                      !n.read 
                        ? 'bg-surface-container-lowest border-primary/30 shadow-sm ring-1 ring-primary/10' 
                        : 'bg-surface-container border-outline-variant/20'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      n.type === 'critical' ? 'bg-error-container text-on-error-container' :
                      n.type === 'warning' ? 'bg-amber-500/10 text-amber-700' : 'bg-primary/10 text-primary'
                    }`}>
                      <span className="material-symbols-outlined text-[20px]">
                        {n.type === 'critical' ? 'report' : n.type === 'warning' ? 'warning' : 'notifications'}
                      </span>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <h4 className="text-body-md font-bold text-on-surface">{t(n.title)}</h4>
                        <span className="text-code-sm text-on-surface-variant font-code-sm whitespace-nowrap">
                          {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-body-sm text-on-surface-variant leading-relaxed">
                        {t(n.message)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
