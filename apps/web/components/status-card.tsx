import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

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

export function StatusCard({ title, badge, detail, meta }: StatusCardProps) {
  const badgeElement = (() => {
    switch (badge) {
      case "Checking":
        return <Badge variant="secondary">{badge}</Badge>;
      case "OK":
      case "Valid":
        return <Badge className="bg-success text-white">{badge}</Badge>;
      case "Unavailable":
      case "Invalid":
        return <Badge variant="destructive">{badge}</Badge>;
    }
  })();

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-xl font-semibold text-foreground m-0">{title}</h2>
        {badgeElement}
      </div>
      <div className="mt-4" aria-live="polite">
        <p className="text-base text-muted-foreground m-0">{detail}</p>
        {meta ? <p className="font-mono text-[11px] text-subtle mt-2 m-0">{meta}</p> : null}
      </div>
    </Card>
  );
}
