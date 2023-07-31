require("dotenv").config({ path: ".env.local" });
// const fs = require('fs');

const { PrismaClient } = require("@prisma/client");
// const { error } = require('console');
// const json = JSON.parse(fs.readFileSync(__dirname + '/cims.json', 'utf8'));

const prisma = new PrismaClient();
const ME = process.env.ME; // eslint-disable-line no-unused-vars

// function connectOrCreate(comarcas) {
//   return comarcas.split(',').map((_comarca) => {
//     const comarca = _comarca.trim();

//     return {
//       where: {
//         name: comarca,
//       },
//       create: {
//         name: comarca,
//       },
//     };
//   });
// }

async function main() {
  // for (let i = 0; i < json.length; i++) {
  //   const cim = json[i];
  //   console.log(`creating cim ${i + 1} of ${json.length}`);

  //   await prisma.cim
  //     .create({
  //       data: {
  //         name: cim.name,
  //         altitude: +cim.altitude,
  //         essencial: !!cim.essencial,
  //         latitude: +cim.latitude,
  //         longitude: +cim.longitude,
  //         url: cim.url,
  //         img: cim.img,
  //         comarcas: {
  //           connectOrCreate: connectOrCreate(cim.comarca),
  //         },
  //       },
  //     })
  //     .then(() => console.log('OK'))
  //     .catch(() => console.log(`ERROR: ${error.message}`));
  // }

  // const data = await prisma.user.update({
  //   where: { id: ME },
  //   data: {
  //     cims: {
  //       connect: {
  //         id: 'clkd91fdd00005018wdqel51k',
  //       },
  //     },
  //   },
  // });
  // const sessionId = '01a1e74d-1812-42a7-b6b9-741da391140d';

  // const data = await prisma.user.findFirst({
  //   where: { sessions: { some: { sessionToken: sessionId } } },
  //   select: {
  //     cims: {
  //       include: {
  //         comarcas: true,
  //       },
  //     },
  //   },
  // });

  const data = await prisma.cim.findMany({
    include: {
      comarcas: true,
    },
  });

  // const climbed = await prisma.user.findUnique({
  //   where: { id: ME },
  //   select: {
  //     cims: { select: { id: true } },
  //   },
  // });

  console.log(JSON.stringify(data, null, 2));
}

main().catch((error) => console.log(error));
