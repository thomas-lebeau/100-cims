/* eslint-disable no-console */
const fs = require("fs");
const { PrismaClient } = require("@prisma/client");
const { z } = require("zod");
const { withBar } = require("./utils");

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
  comarca: z.array(
    z.object({
      codigo: z.string(),
      name: z.string(),
    })
  ),
  cim: z.array(
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
  user: z.array(
    z.object({
      name: z.string(),
      email: z.string(),
    })
  ),
});

const prisma = new PrismaClient();

async function main() {
  const safeCims = seedSchema.safeParse(CIMS);

  if (!safeCims.success) {
    console.log(safeCims.error);
    process.exit(1);
  }

  await withBar("Reset db", TABLES, async (table) => {
    await prisma[table].deleteMany();
  });

  await withBar("Seed Comarcas", safeCims.data.comarca.length, async () => {
    await prisma.comarca.createMany({
      data: safeCims.data.comarca.map((comarca) => ({
        codigo: comarca.codigo,
        name: comarca.name,
      })),
    });
  });

  await withBar("Seed Cims", safeCims.data.cim, async (cim) => {
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
              codigo: safeCims.data.comarca.find((c) => c.name === name).codigo,
            },
          })),
        },
      },
    });
  });

  await withBar("Seed Users", safeCims.data.user, async (user) => {
    await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
      },
    });
  });

  console.log("");

  const error = await verifyTables(safeCims.data);

  if (error) {
    process.exit(1);
  }
}

main();

async function verifyTables(data) {
  let error = false;

  for (const [tableName, tableData] of Object.entries(data)) {
    const count = await prisma[tableName].count();

    if (count !== tableData.length) {
      error = true;
      console.log(
        `❌ Created ${count} item${count > 1 ? "s" : ""} on table "${tableName}" (Expected ${tableData.length})`
      );
    } else {
      console.log(
        `✅ Created ${count} item${count > 1 ? "s" : ""} on table "${tableName}"`
      );
    }
  }

  return error;
}
