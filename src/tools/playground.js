require('dotenv').config({ path: '.env.local' });

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const ME = process.env.ME; // eslint-disable-line no-unused-vars

async function main() {
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
  const sessionId = '01a1e74d-1812-42a7-b6b9-741da391140d';

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
      users: {
        where: { sessions: { some: { sessionToken: sessionId } } },
        select: { id: true },
      },
    },
  });

  // const climbed = await prisma.user.findUnique({
  //   where: { id: ME },
  //   select: {
  //     cims: { select: { id: true } },
  //   },
  // });

  console.log(
    JSON.stringify(
      data.filter((d) => d.users.length > 0),
      null,
      2
    )
  );
}

main().catch((error) => console.log(error));
