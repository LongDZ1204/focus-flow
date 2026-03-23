let timerId: ReturnType<typeof setInterval> | null = null;
let lastTick: number = 0;

self.onmessage = (e: MessageEvent) => {
  if (e.data.command === 'start') {
    if (timerId) clearInterval(timerId);
    lastTick = Date.now();
    timerId = setInterval(() => {
      const now = Date.now();
      const delta = now - lastTick;
      if (delta >= 1000) {
        const seconds = Math.floor(delta / 1000);
        lastTick += seconds * 1000;
        self.postMessage({ type: 'tick', seconds });
      }
    }, 200); // 200ms ensures it's fairly accurate even if browser throttles it slightly.
  } else if (e.data.command === 'stop') {
    if (timerId) clearInterval(timerId);
    timerId = null;
  }
};
