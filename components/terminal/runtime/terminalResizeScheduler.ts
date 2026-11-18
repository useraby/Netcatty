import type { Terminal as XTerm } from "@xterm/xterm";

export function getTerminalPixelSize(term: Pick<XTerm, "element">): NetcattyTerminalPixelSize | undefined {
  const screen = term.element?.querySelector<HTMLElement>(".xterm-screen");
  if (!screen?.clientWidth || !screen.clientHeight) return undefined;
  return { width: screen.clientWidth, height: screen.clientHeight };
}

export type TerminalResizeRequest = Readonly<{
  sessionId: string;
  cols: number;
  rows: number;
}>;

export type TerminalResizeScheduler = Readonly<{
  schedule: (request: TerminalResizeRequest) => void;
  dispose: () => void;
}>;

export function createTerminalResizeScheduler(
  delayMs: number,
  apply: (request: TerminalResizeRequest) => void,
): TerminalResizeScheduler {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let disposed = false;

  return Object.freeze({
    schedule(request: TerminalResizeRequest) {
      if (disposed) return;
      if (timeout) clearTimeout(timeout);
      const pendingRequest = Object.freeze({ ...request });
      timeout = setTimeout(() => {
        timeout = null;
        if (disposed) return;
        apply(pendingRequest);
      }, delayMs);
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
    },
  });
}
