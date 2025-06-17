// src/components/GuideCategory.jsx
import { BookOpen } from "lucide-react";
import "@/app/guide/[id]/guide.css";

export default function GuideCategory({ category }) {
  return (
    <div className="guide-category">
      <BookOpen size={28} />
      <span>{category}</span>
    </div>
  );
}
