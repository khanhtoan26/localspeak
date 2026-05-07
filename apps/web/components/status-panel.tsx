"use client";

import { useCallback, useEffect, useState } from "react";
import { StatusCard, type StatusBadge } from "./status-card";

const API_UNAVAILABLE_COPY =
  "Couldn't reach LocalSpeak API. Start the backend with pnpm dev:api or run pnpm dev, then refresh.";
const CONTRACT_INVALID_COPY =
  "The sample speech JSON does not match the shared contract. Check packages/contracts and the fixture schema.";

type CardState = {
  badge: StatusBadge;
  detail: string;
  meta?: string;
};

type HealthResponse = {
  status?: string;
  service?: string;
};

type ContractResponse = {
  valid?: boolean;
  contract?: string;
  issues?: unknown[];
};

const checkingHealth: CardState = {
  badge: "Checking",
  detail: "Checking local API health.",
  meta: "status: pending",
};

const checkingContract: CardState = {
  badge: "Checking",
  detail: "Checking the shared speech JSON fixture.",
  meta: "issues: pending",
};

export function StatusPanel() {
  const [apiHealth, setApiHealth] = useState<CardState>(checkingHealth);
  const [contractFixture, setContractFixture] =
    useState<CardState>(checkingContract);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshStatus = useCallback(async () => {
    setIsRefreshing(true);
    setApiHealth(checkingHealth);
    setContractFixture(checkingContract);

    const healthCheck = fetch("/api/health", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Health check failed: ${response.status}`);
        }

        const data = (await response.json()) as HealthResponse;
        setApiHealth({
          badge: "OK",
          detail: `${data.service ?? "localspeak-api"} is responding.`,
          meta: `status: ${data.status ?? "ok"}`,
        });
      })
      .catch(() => {
        setApiHealth({
          badge: "Unavailable",
          detail: API_UNAVAILABLE_COPY,
          meta: "status: unavailable",
        });
      });

    const contractCheck = fetch("/api/contracts/sample-json/validate", {
      cache: "no-store",
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Contract check failed: ${response.status}`);
        }

        const data = (await response.json()) as ContractResponse;
        if (!data.valid) {
          setContractFixture({
            badge: "Invalid",
            detail: CONTRACT_INVALID_COPY,
            meta: `issues: ${data.issues?.length ?? "unknown"}`,
          });
          return;
        }

        setContractFixture({
          badge: "Valid",
          detail: `${
            data.contract ?? "speech-assessment-response.v1"
          } fixture validates.`,
          meta: "issues: 0",
        });
      })
      .catch(() => {
        setContractFixture({
          badge: "Unavailable",
          detail: API_UNAVAILABLE_COPY,
          meta: "contract: unavailable",
        });
      });

    await Promise.allSettled([healthCheck, contractCheck]);
    setIsRefreshing(false);
  }, []);

  useEffect(() => {
    void refreshStatus();
  }, [refreshStatus]);

  return (
    <main className="status-page">
      <section className="status-shell" aria-label="LocalSpeak foundation status">
        <header className="status-header">
          <span className="status-tag">LocalSpeak</span>
          <h1 className="status-title">LocalSpeak</h1>
          <p className="status-intro">
            Monorepo foundation status for the Next.js frontend, NestJS API, and
            shared contracts.
          </p>
        </header>

        <StatusCard title="API Health" {...apiHealth} />
        <StatusCard title="Contract Fixture" {...contractFixture} />

        <button
          className="status-refresh"
          type="button"
          disabled={isRefreshing}
          onClick={() => void refreshStatus()}
        >
          Refresh Status
        </button>

        <p className="status-helper">
          This page proves the frontend can reach the backend and validate the
          shared speech JSON fixture.
        </p>
      </section>
    </main>
  );
}
