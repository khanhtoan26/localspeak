"use client";

import { useCallback, useEffect, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
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

const HealthResponseSchema = z.object({
  status: z.literal("ok"),
  service: z.literal("localspeak-api"),
});

const ContractResponseSchema = z.object({
  valid: z.boolean(),
  contract: z.string().min(1),
  issues: z.array(z.unknown()),
});

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

        const data = HealthResponseSchema.parse(await response.json());
        setApiHealth({
          badge: "OK",
          detail: `${data.service} is responding.`,
          meta: `status: ${data.status}`,
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

        const data = ContractResponseSchema.parse(await response.json());
        if (!data.valid) {
          setContractFixture({
            badge: "Invalid",
            detail: CONTRACT_INVALID_COPY,
            meta: `issues: ${data.issues.length}`,
          });
          return;
        }

        setContractFixture({
          badge: "Valid",
          detail: `${data.contract} fixture validates.`,
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
    <main className="min-h-screen p-6 bg-background">
      <section className="w-full max-w-[720px] mx-auto flex flex-col gap-4" aria-label="LocalSpeak foundation status">
        <header className="pt-8 pb-2">
          <span className="inline-flex items-center rounded-full bg-sidebar text-primary text-[11px] font-semibold uppercase tracking-[0.06em] px-2 py-1">LocalSpeak</span>
          <h1 className="font-display text-3xl text-foreground mt-4 mb-2">LocalSpeak</h1>
          <p className="text-base text-muted-foreground m-0">
            Monorepo foundation status for the Next.js frontend, NestJS API, and
            shared contracts.
          </p>
        </header>

        <StatusCard title="API Health" {...apiHealth} />
        <StatusCard title="Contract Fixture" {...contractFixture} />

        <Button
          type="button"
          disabled={isRefreshing}
          onClick={() => void refreshStatus()}
        >
          Refresh Status
        </Button>

        <p className="text-sm text-muted-foreground">
          This page proves the frontend can reach the backend and validate the
          shared speech JSON fixture.
        </p>
      </section>
    </main>
  );
}
