export type StatusBadge =
  | "Checking"
  | "OK"
  | "Valid"
  | "Unavailable"
  | "Invalid";

type StatusCardProps = {
  title: string;
  badge: StatusBadge;
  detail: string;
  meta?: string;
};

const badgeClassName: Record<StatusBadge, string> = {
  Checking: "status-badge--checking",
  OK: "status-badge--ok",
  Valid: "status-badge--valid",
  Unavailable: "status-badge--unavailable",
  Invalid: "status-badge--invalid",
};

export function StatusCard({ title, badge, detail, meta }: StatusCardProps) {
  return (
    <article className="status-card">
      <div className="status-card__header">
        <h2 className="status-card__title">{title}</h2>
        <span className={`status-badge ${badgeClassName[badge]}`}>{badge}</span>
      </div>
      <div className="status-card__body" aria-live="polite">
        <p className="status-card__detail">{detail}</p>
        {meta ? <p className="status-card__meta">{meta}</p> : null}
      </div>
    </article>
  );
}
