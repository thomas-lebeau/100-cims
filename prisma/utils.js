const cliProgress = require("cli-progress");

/**
 * @template T
 * @param {string} text
 * @param {Array<T> | number} dataOrTotal
 * @param {(item: T) => Promise<void>} cb
 */
async function withBar(text, dataOrTotal, cb) {
  if (Array.isArray(dataOrTotal)) {
    return withData(text, dataOrTotal, cb);
  }

  return withTotal(text, dataOrTotal, cb);
}

/**
 * @template T
 * @param {string} text
 * @param {Array<T>} data
 * @param {(item: T) => Promise<void>} cb
 */
async function withData(text, data, cb) {
  const max = data.length;
  const bar = createBar(text, max);

  bar.start(max, 0);

  for (let i = 0; i < max; i++) {
    await cb(data[i]);
    bar.increment();
  }

  bar.stop();
}

/**
 * @param {string} text
 * @param {number} max
 * @param {() => Promise<void>} cb
 */
async function withTotal(text, max, cb) {
  const bar = createBar(text, max);

  bar.start(max, 0);

  await cb();

  bar.update(max);
  bar.stop();
}

function createBar(label) {
  const paddedLabel = label.padEnd(13, " ");

  const bar = new cliProgress.SingleBar(
    {
      format: `➡️ ${paddedLabel} {bar} {percentage}% | {value}/{total} | ETA: {eta_formatted}`,
      autopadding: true,
    },
    cliProgress.Presets.shades_classic
  );

  return bar;
}

module.exports = {
  withBar,
};
