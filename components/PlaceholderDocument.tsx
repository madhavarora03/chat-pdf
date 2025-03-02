"use client";

import { PlusCircleIcon } from "lucide-react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

export default function PlaceholderDocument() {
  const router = useRouter();

  const handleClick = () => {
    router.push("/dashboard/upload");
  };

  return (
    <Button
      onClick={handleClick}
      className="flex flex-col items-center justify-center w-64 h-80 rounded-xl bg-gray-200 drop-shadow-md text-gray-400"
    >
      <PlusCircleIcon className="!w-16 !h-16" />
      <p>Add a document</p>
    </Button>
  );
}
