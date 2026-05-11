import type { SurfaceId } from "@/components/app-shell/nav-config"
import { AudioModePanel } from "@/components/audio-mode/audio-mode-panel"
import { JsonAnalysisPanel } from "@/components/json-analysis/json-analysis-panel"

type SurfaceRendererProps = {
  activeSurface: SurfaceId
}

export function SurfaceRenderer({ activeSurface }: SurfaceRendererProps) {
  return (
    <>
      <section hidden={activeSurface !== "json"} aria-hidden={activeSurface !== "json"}>
        <JsonAnalysisPanel />
      </section>
      <section hidden={activeSurface !== "audio"} aria-hidden={activeSurface !== "audio"}>
        <AudioModePanel />
      </section>
    </>
  )
}
