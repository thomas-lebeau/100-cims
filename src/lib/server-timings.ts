type Timings = {
  duration: number | null;
  description?: string;
  name: string;
};

export default class ServerTimings {
  private timings = new Map<string, Timings>();

  start(name: string, description?: string) {
    if (this.timings.has(name)) {
      throw new Error(`[ServerTiming]: Timing ${name} already exists`);
    }

    performance.mark(name);

    this.timings.set(name, {
      name,
      description,
      duration: null,
    });
  }

  stop(name: string) {
    const timing = this.timings.get(name);

    if (!timing) {
      throw new Error(`[ServerTiming]: Timing ${name} was not started`);
    }

    timing.duration = performance.measure(name, name).duration;
  }

  headers() {
    const headers = new Headers();

    this.timings.forEach(({ name, duration, description }) => {
      if (duration !== null) {
        let value = `${name};dur=${duration}`;

        if (description) {
          value += `;desc="${description}"`;
        }

        headers.append('Server-Timing', value);
      }
    });

    return headers;
  }
}
