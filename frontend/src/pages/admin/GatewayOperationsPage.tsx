import React, { useEffect, useState } from "react";
import { useLanguage } from "../../i18n";
import {
  operations,
  type OperationsSnapshot,
} from "../../services/operationsApi";
import { formatBackendErrorMessage } from "../../services/authApi";
export const GatewayOperationsPage: React.FC = () => {
  const { t } = useLanguage();
  const [data, setData] = useState<OperationsSnapshot>(),
    [error, setError] = useState(""),
    [version, setVersion] = useState(0),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    const abort = new AbortController();
    let running = false;
    const load = async () => {
      if (running) return;
      running = true;
      try {
        const result = await operations(abort.signal);
        if (!abort.signal.aborted) {
          setData(result);
          setError("");
        }
      } catch (e) {
        if (!abort.signal.aborted) {
          setData(undefined);
          setError(formatBackendErrorMessage(e));
        }
      } finally {
        running = false;
        if (!abort.signal.aborted) setLoading(false);
      }
    };
    void load();
    const timer = setInterval(() => void load(), 30000);
    return () => {
      abort.abort();
      clearInterval(timer);
    };
  }, [version]);
  return (
    <div className="space-y-6">
      <h1 className="text-headline-lg font-bold">
        {t("System Monitoring & API Gateway Operations")}
      </h1>
      <button
        onClick={() => {
          setLoading(true);
          setVersion((v) => v + 1);
        }}
        disabled={loading}
      >
        {t("Refresh")}
      </button>
      {loading && <p role="status">{t("Loading...")}</p>}
      {error && <p role="alert">{error}</p>}
      {!data && !loading && <p>{t("Chưa có dữ liệu giám sát")}</p>}
      {data && (
        <>
          <p>
            {t("Last checked")}: {new Date(data.checkedAt).toLocaleString()}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              ["Control Plane", data.controlPlane],
              ["PostgreSQL", data.postgres],
              ["Redis", data.redis],
              ["Data Plane Gateway", data.gateway],
              ["Background Workers", data.worker.status],
            ].map(([name, status]) => (
              <section key={name} className="p-6 rounded-xl border">
                <h2 className="font-bold">{name}</h2>
                <p>{t(status ?? "unknown")}</p>
              </section>
            ))}
          </div>
          <p>
            {t("Worker last success")}:{" "}
            {data.worker.last_succeeded_at
              ? new Date(data.worker.last_succeeded_at).toLocaleString()
              : t("Chưa có dữ liệu giám sát")}
          </p>
        </>
      )}
    </div>
  );
};
