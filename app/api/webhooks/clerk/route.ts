import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { User } from "@prisma/client";
import { createUser } from "@/lib/actions/users";

export async function POST(req: NextRequest) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Error: Please add WEBHOOK_SECRET from Clerk Dashboard to .env"
    );
  }

  // Create new Svix instance with secret
  const wh = new Webhook(WEBHOOK_SECRET);

  // Get headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing Svix headers", {
      status: 400,
    });
  }

  // Get body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  let evt: WebhookEvent;

  // Verify payload with headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error: Could not verify webhook:", err);
    return NextResponse.json(
      { message: "Error occured while verifying webhook!" },
      { status: 400 }
    );
  }

  const eventType = evt.type;

  if (eventType === "user.created") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    if (!id || !email_addresses) {
      return NextResponse.json(
        { message: "Error occurred --- missing data" },
        { status: 400 }
      );
    }

    const user = {
      clerkUserId: id,
      email: email_addresses[0].email_address,
      ...(first_name && { firstName: first_name }),
      ...(last_name && { lastName: last_name }),
      ...(image_url && { imageUrl: image_url }),
    };

    const { message, data, error, success } = await createUser(user as User);

    if (!success) {
      return NextResponse.json({ message, error }, { status: 400 });
    }

    return NextResponse.json({ message, data }, { status: 200 });
  }

  if (evt.type === "user.updated") {
    return NextResponse.json({ message: "User updated" }, { status: 200 });
  }

  if (evt.type === "user.deleted") {
    return NextResponse.json({ message: "User deleted" }, { status: 200 });
  }

  return NextResponse.json({ message: "Invalid event type" }, { status: 400 });
}
