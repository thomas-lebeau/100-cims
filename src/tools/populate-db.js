const { PrismaClient } = require("@prisma/client");

const fs = require("fs");

const data = JSON.parse(fs.readFileSync(__dirname + "/cims.json", "utf8"));

const prisma = new PrismaClient();

async function main() {
  for (const cim of data) {
    await prisma.cim
      .create({
        data: {
          name: cim.name,
          altitude: +cim.altitude,
          latitude: +cim.latitude,
          longitude: +cim.longitude,
          essencial: !!cim.essencial,
          img: cim.img ?? null,
          url: cim.url,
          comarcas: {
            connectOrCreate: cim.comarca.split(",").map((comarca) => ({
              where: { name: comarca.trim() },
              create: { name: comarca.trim() },
            })),
          },
        },
      })
      .then(() => console.log(`${cim.name} inserted`))
      .catch((e) => console.log(`Error inserting ${cim.name}: ${e.message}`));
  }

  await prisma.cim
    .findMany()
    .then((data) => console.log("total cims:", data.length));

  await prisma.comarca
    .findMany()
    .then((data) => console.log("total length:", data.length));
}

main();
