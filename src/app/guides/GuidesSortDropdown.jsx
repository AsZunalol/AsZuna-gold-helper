"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function GuidesSortDropdown({ type, category, sort }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (e) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", e.target.value);
    if (type) params.set("type", type);
    if (category) params.set("category", category);
    router.push(`/guides?${params.toString()}`);
  };

  return (
    <select
      defaultValue={sort}
      onChange={handleChange}
      suppressHydrationWarning
    >
      <option value="latest">Latest</option>
      <option value="title">Title A-Z</option>
    </select>
  );
}
