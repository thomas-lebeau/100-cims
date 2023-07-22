-- CreateTable
CREATE TABLE "Cim" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "altitude" INTEGER NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "url" TEXT NOT NULL,
    "img" TEXT,
    "essencial" BOOLEAN NOT NULL,

    CONSTRAINT "Cim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comarca" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Comarca_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CimToComarca" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_CimToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Cim_name_key" ON "Cim"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Cim_url_key" ON "Cim"("url");

-- CreateIndex
CREATE UNIQUE INDEX "Cim_img_key" ON "Cim"("img");

-- CreateIndex
CREATE UNIQUE INDEX "Comarca_name_key" ON "Comarca"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_CimToComarca_AB_unique" ON "_CimToComarca"("A", "B");

-- CreateIndex
CREATE INDEX "_CimToComarca_B_index" ON "_CimToComarca"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_CimToUser_AB_unique" ON "_CimToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_CimToUser_B_index" ON "_CimToUser"("B");

-- AddForeignKey
ALTER TABLE "_CimToComarca" ADD CONSTRAINT "_CimToComarca_A_fkey" FOREIGN KEY ("A") REFERENCES "Cim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CimToComarca" ADD CONSTRAINT "_CimToComarca_B_fkey" FOREIGN KEY ("B") REFERENCES "Comarca"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CimToUser" ADD CONSTRAINT "_CimToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Cim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CimToUser" ADD CONSTRAINT "_CimToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
