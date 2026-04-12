export type WorkerLoopHandle = {
  stop: () => void;
};

/**
 * Runs `tick` on a fixed interval until `stop()` is called.
 * Server passes `tick` that performs CSV job processing steps.
 */
export function startWorkerLoop(options: {
  intervalMs: number;
  tick: () => Promise<void>;
}): WorkerLoopHandle {
  let stopped = false;
  const run = async () => {
    if (stopped) return;
    try {
      await options.tick();
    } catch (e) {
      console.error("[workerLoop]", e);
    }
    if (!stopped) {
      setTimeout(run, options.intervalMs);
    }
  };
  void run();
  return {
    stop: () => {
      stopped = true;
    },
  };
}
