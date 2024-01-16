/* eslint-disable no-console */
const fs = require("fs");
const { PrismaClient } = require("@prisma/client");
const cliProgress = require("cli-progress");
const { z } = require("zod");

const TOTAL_CIMS = 522;
const TOTAL_COMARCAS = 50;
const TABLES = [
  "account",
  "session",
  "user",
  "verificationToken",
  "cim",
  "comarca",
  "cimToComarca",
  "activity",
  "ascent",
  "sync",
];

const CIMS = JSON.parse(fs.readFileSync(__dirname + "/seed.json", "utf8"));

const seedSchema = z.object({
  comarcas: z.array(
    z.object({
      codigo: z.string(),
      name: z.string(),
    })
  ),
  cims: z.array(
    z.object({
      name: z.string(),
      altitude: z.number(),
      latitude: z.number(),
      longitude: z.number(),
      essencial: z.boolean(),
      img: z.string().nullable(),
      url: z.string(),
      comarca: z.array(z.string()),
    })
  ),
});

const prisma = new PrismaClient();

function createBar(label, max) {
  const bar = new cliProgress.SingleBar(
    {
      format: ` {bar} {percentage}% | ETA: {eta_formatted}s | {value}/{total} | ${label}`,
    },
    cliProgress.Presets.shades_classic
  );

  bar.start(max, 0);

  return bar;
}

async function main() {
  const safeCims = seedSchema.safeParse(CIMS);

  if (!safeCims.success) {
    console.log(safeCims.error);
    process.exit(1);
  }

  const deleteTablesBar = createBar("Reset db", TABLES.length);

  for (let i = 0; i < TABLES.length; i++) {
    await prisma[TABLES[i]].deleteMany();

    deleteTablesBar.update(i + 1);
  }
  deleteTablesBar.stop();

  const createComarcasBar = createBar("Seed comarcas", TOTAL_COMARCAS);

  await prisma.comarca.createMany({
    data: safeCims.data.comarcas.map((comarca) => ({
      codigo: comarca.codigo,
      name: comarca.name,
    })),
  });

  createComarcasBar.update(TOTAL_COMARCAS);
  createComarcasBar.stop();

  const createCimsBar = createBar("Seed Cims", TOTAL_CIMS);

  for (let i = 0; i < safeCims.data.cims.length; i++) {
    const cim = safeCims.data.cims[i];

    await prisma.cim.create({
      data: {
        name: cim.name,
        altitude: cim.altitude,
        latitude: cim.latitude,
        longitude: cim.longitude,
        essencial: cim.essencial,
        img: cim.img,
        url: cim.url,
        comarcas: {
          connectOrCreate: cim.comarca.map((name) => ({
            where: { name },
            create: {
              name,
              codigo: safeCims.data.comarcas.find((c) => c.name === name)
                .codigo,
            },
          })),
        },
      },
    });

    createCimsBar.update(i);
  }

  createCimsBar.stop();

  const comarcas = await prisma.comarca.findMany();
  const cims = await prisma.cim.findMany();

  const errorCimCount = cims.length !== TOTAL_CIMS;
  const errorComarcaCount = comarcas.length !== TOTAL_COMARCAS;

  if (errorCimCount) {
    console.log(`❌ Created ${cims.length} cims (Expected ${TOTAL_CIMS})`);
  } else {
    console.log(`✅ Created ${cims.length} cims`);
  }

  if (errorComarcaCount) {
    console.log(
      `❌ Created ${comarcas.length} comarcas (Expected ${TOTAL_COMARCAS})`
    );
  } else {
    console.log(`✅ Created ${comarcas.length} comarcas`);
  }

  if (errorCimCount || errorComarcaCount) {
    process.exit(1);
  }
}

main();
