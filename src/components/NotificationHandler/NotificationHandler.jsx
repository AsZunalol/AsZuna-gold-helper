"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";

export default function NotificationHandler() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get("error");
    if (error === "unauthorized") {
      toast.error("You do not have permission to access that page.", {
        duration: 5000,
      });
    }
    // You can add more error types here in the future
  }, [searchParams]);

  // This component renders nothing to the page
  return null;
}
