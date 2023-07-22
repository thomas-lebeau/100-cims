require('dotenv').config({ path: '.env.local' });

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const session = await prisma.session.findMany({
    where: { sessionToken: '01a1e74d-1812-42a7-b6b9-741da391140d' },
    select: { user: true },
  });

  console.log(session);
}

main().catch((error) => console.log(error));
