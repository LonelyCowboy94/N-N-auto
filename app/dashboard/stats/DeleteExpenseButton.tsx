"use client";
import { Trash2 } from "lucide-react";
import { deleteExpense } from "@/app/actions/stats";
import { useState } from "react";

export default function DeleteExpenseButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);

  return (
    <button 
      disabled={loading}
      onClick={async () => {
        if(confirm("Obriši stavku?")) {
          setLoading(true);
          await deleteExpense(id);
          setLoading(false);
        }
      }} 
      className="text-muted-foreground hover:text-red-500 transition-colors disabled:opacity-50"
    >
      <Trash2 size={14} />
    </button>
  );
}