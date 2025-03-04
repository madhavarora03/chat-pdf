import prisma from "@/lib/prisma";
import { ResponsePayload } from "@/types/interfaces";
import { User } from "@prisma/client";

export async function createUser(data: User): Promise<ResponsePayload<User>> {
  try {
    const user = await prisma.user.create({ data });
    return {
      message: "User created successfully!",
      data: user,
      error: null,
      success: true,
    };
  } catch (error) {
    console.error("Error: ", error);
    return {
      message: "Failed to create user",
      data: null,
      error,
      success: false,
    };
  }
}
