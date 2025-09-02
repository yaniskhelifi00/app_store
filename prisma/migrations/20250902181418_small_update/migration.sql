-- DropForeignKey
ALTER TABLE "public"."Download" DROP CONSTRAINT "Download_appId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Download" DROP CONSTRAINT "Download_userId_fkey";

-- AddForeignKey
ALTER TABLE "public"."Download" ADD CONSTRAINT "Download_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Download" ADD CONSTRAINT "Download_appId_fkey" FOREIGN KEY ("appId") REFERENCES "public"."App"("id") ON DELETE CASCADE ON UPDATE CASCADE;
