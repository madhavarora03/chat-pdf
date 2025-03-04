import r2Client from "@/lib/r2-client";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: NextRequest) {
  await auth.protect();
  const { userId } = await auth();

  try {
    const { fileName, fileType } = await request.json();

    if (!process.env.R2_BUCKET_NAME) {
      throw new Error("R2_BUCKET_NAME is not defined");
    }

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: `${userId}/${fileName}`,
      ContentType: fileType,
    });

    const url = await getSignedUrl(r2Client, command, { expiresIn: 60 });
    return NextResponse.json({ url }, { status: 200 });
  } catch (error) {
    console.log("Error:", error);
    return NextResponse.json(
      { message: "Something went wrong!" },
      { status: 500 }
    );
  }
}
