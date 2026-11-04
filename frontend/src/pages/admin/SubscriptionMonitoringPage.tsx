import React, { useEffect, useState } from "react";
import * as api from "../../services/operationsApi";
import { formatBackendErrorMessage } from "../../services/authApi";
import { useLanguage } from "../../i18n";
export const SubscriptionMonitoringPage: React.FC = () => {
  const { t } = useLanguage();
  const [status, setStatus] = useState(""),
    [paymentStatus, setPaymentStatus] = useState(""),
    [consumer, setConsumer] = useState(""),
    [apiId, setApiId] = useState(""),
    [page, setPage] = useState(1),
    [version, setVersion] = useState(0);
  const [subs, setSubs] = useState<api.Page<api.SubscriptionRow>>(),
    [payments, setPayments] = useState<api.Page<api.PaymentRow>>(),
    [keyRows, setKeyRows] = useState<Record<string, api.KeyRow[]>>({});
  const [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [reason, setReason] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    const abort = new AbortController();
    setLoading(true);
    setError("");
    setSubs(undefined);
    setPayments(undefined);
    setKeyRows({});
    const q = new URLSearchParams({ page: String(page), pageSize: "20" });
    if (status) q.set("status", status);
    if (paymentStatus) q.set("paymentStatus", paymentStatus);
    if (consumer) q.set("consumerId", consumer);
    if (apiId) q.set("apiId", apiId);
    Promise.all([
      api.subscriptions(q.toString(), abort.signal),
      api.payments(q.toString(), abort.signal),
    ])
      .then(([s, p]) => {
        if (!abort.signal.aborted) {
          setSubs(s);
          setPayments(p);
        }
      })
      .catch((e) => {
        if (!abort.signal.aborted) setError(formatBackendErrorMessage(e));
      })
      .finally(() => {
        if (!abort.signal.aborted) setLoading(false);
      });
    return () => abort.abort();
  }, [status, paymentStatus, consumer, apiId, page, version]);
  const act = async (work: () => Promise<unknown>) => {
    setBusy(true);
    setError("");
    try {
      await work();
      setVersion((v) => v + 1);
    } catch (e) {
      setError(formatBackendErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  const loadKeys = async (id: string) => {
    setBusy(true);
    try {
      const rows = await api.keys(id);
      setKeyRows((r) => ({ ...r, [id]: rows }));
    } catch (e) {
      setError(formatBackendErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="space-y-6">
      <h1 className="text-headline-lg font-bold">
        {t("Subscription & Payment Sandbox Ledger")}
      </h1>
      <p>
        {t(
          "Dữ liệu trực tiếp từ backend. Đình chỉ và thu hồi key chặn các yêu cầu Gateway tiếp theo; yêu cầu đang xử lý có thể hoàn tất.",
        )}
      </p>
      <div className="flex flex-wrap gap-3">
        <label>
          {t("Status")}{" "}
          <select
            aria-label="Subscription status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">{t("All")}</option>
            {[
              "Pending",
              "Active",
              "Past Due",
              "Suspended",
              "Canceled",
              "Expired",
            ].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label>
          {t("Payment status")}{" "}
          <select
            aria-label="Payment status"
            value={paymentStatus}
            onChange={(e) => {
              setPaymentStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">{t("All")}</option>
            {["Pending", "Succeeded", "Failed", "Refunded"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label>
          Consumer ID{" "}
          <input
            aria-label="Consumer ID"
            value={consumer}
            onChange={(e) => {
              setConsumer(e.target.value);
              setPage(1);
            }}
          />
        </label>
        <label>
          API ID{" "}
          <input
            aria-label="API ID"
            value={apiId}
            onChange={(e) => {
              setApiId(e.target.value);
              setPage(1);
            }}
          />
        </label>
        <button
          disabled={loading || busy}
          onClick={() => setVersion((v) => v + 1)}
        >
          {t("Refresh")}
        </button>
      </div>
      <label className="block">
        {t("Lý do quản trị (bắt buộc cho Suspend/Revoke)")}{" "}
        <input
          aria-label="Admin reason"
          maxLength={2000}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="border rounded p-2 w-full"
        />
      </label>
      {error && <div role="alert">{error}</div>}
      {loading && <p role="status">{t("Loading...")}</p>}
      {!loading && subs && (
        <section className="overflow-x-auto">
          <h2 className="text-title-lg">
            {t("Subscriptions")} ({subs.total})
          </h2>
          <table className="w-full text-left">
            <thead>
              <tr>
                {[
                  "ID",
                  "Consumer",
                  "API",
                  "Plan",
                  "Quota",
                  "Status",
                  "Actions",
                ].map((s) => (
                  <th key={s}>{t(s)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {subs.items.length === 0 && (
                <tr>
                  <td colSpan={7}>{t("No subscriptions found")}</td>
                </tr>
              )}
              {subs.items.map((s) => (
                <React.Fragment key={s.id}>
                  <tr>
                    <td>{s.id}</td>
                    <td>{s.consumerId}</td>
                    <td>
                      {s.apiName} ({s.apiId})
                    </td>
                    <td>
                      {s.planName}: {s.priceAmount} {s.currency}
                    </td>
                    <td>
                      {s.quotaUsed}/{s.quotaLimit}
                    </td>
                    <td>{s.status}</td>
                    <td>
                      <button
                        disabled={
                          busy ||
                          !reason.trim() ||
                          !["Active", "Past Due"].includes(s.status)
                        }
                        onClick={() =>
                          void act(() => api.suspend(s.id, reason.trim()))
                        }
                      >
                        {t("Suspend")}
                      </button>{" "}
                      <button
                        disabled={busy}
                        onClick={() => void loadKeys(s.id)}
                      >
                        {t("API Keys")}
                      </button>
                    </td>
                  </tr>
                  {keyRows[s.id] && (
                    <tr>
                      <td colSpan={7}>
                        {keyRows[s.id]!.length === 0
                          ? t("No API keys")
                          : keyRows[s.id]!.map((k) => (
                              <span key={k.id} className="inline-block p-2">
                                Key #{k.id} —{" "}
                                {k.isActive ? t("Active") : t("Revoked")}{" "}
                                <button
                                  disabled={
                                    busy || !k.isActive || !reason.trim()
                                  }
                                  onClick={() =>
                                    void act(() =>
                                      api.revoke(k.id, reason.trim()),
                                    )
                                  }
                                >
                                  {t("Revoke")}
                                </button>
                              </span>
                            ))}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </section>
      )}
      {!loading && payments && (
        <section className="overflow-x-auto">
          <h2 className="text-title-lg">
            {t("Sandbox Payments")} ({payments.total})
          </h2>
          <table className="w-full text-left">
            <thead>
              <tr>
                {[
                  "ID",
                  "Subscription",
                  "Consumer",
                  "API",
                  "Amount",
                  "Status",
                  "Created",
                ].map((s) => (
                  <th key={s}>{t(s)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.items.length === 0 && (
                <tr>
                  <td colSpan={7}>{t("No payments found")}</td>
                </tr>
              )}
              {payments.items.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.subscriptionId}</td>
                  <td>{p.consumerId}</td>
                  <td>{p.apiId}</td>
                  <td>
                    {p.amount} {p.currency}
                  </td>
                  <td>{p.status}</td>
                  <td>{new Date(p.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
      <div className="flex gap-4">
        <button
          disabled={loading || busy || page === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          {t("Previous")}
        </button>
        <span>
          {t("Page")} {page}
        </span>
        <button
          disabled={
            loading ||
            busy ||
            page * 20 >= Math.max(subs?.total ?? 0, payments?.total ?? 0)
          }
          onClick={() => setPage((p) => p + 1)}
        >
          {t("Next")}
        </button>
      </div>
    </div>
  );
};
