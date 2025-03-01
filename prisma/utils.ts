import { Presets, SingleBar } from "cli-progress";

export async function withBar(text: string, dataOrTotal: number, cb: () => Promise<void>): Promise<void>;
export async function withBar<T>(text: string, dataOrTotal: T[], cb: (item: T) => Promise<void>): Promise<void>;
export async function withBar<T>(
  text: string,
  dataOrTotal: readonly T[],
  cb: (item: T) => Promise<void>
): Promise<void>;
export async function withBar<T>(
  text: string,
  dataOrTotal: number | T[] | readonly T[],
  cb: (() => Promise<void>) | ((item: T) => Promise<void>)
): Promise<void> {
  if (Array.isArray(dataOrTotal)) {
    return withData(text, dataOrTotal, cb as (item: T) => Promise<void>);
  }
  return withTotal(text, dataOrTotal as number, cb as () => Promise<void>);
}

async function withData<T>(text: string, data: Array<T>, cb: (item: T) => Promise<void>) {
  const max = data.length;
  const bar = createBar(text);

  bar.start(max, 0);

  for (let i = 0; i < max; i++) {
    await cb(data[i]);
    bar.increment();
  }

  bar.stop();
}

async function withTotal(text: string, max: number, cb: () => Promise<void>) {
  const bar = createBar(text);

  bar.start(max, 0);

  await cb();

  bar.update(max);
  bar.stop();
}

function createBar(label: string) {
  const paddedLabel = label.padEnd(13, " ");

  const bar = new SingleBar(
    {
      format: `➡️ ${paddedLabel} {bar} {percentage}% | {value}/{total} | ETA: {eta_formatted}`,
      autopadding: true,
    },
    Presets.shades_classic
  );

  return bar;
}
