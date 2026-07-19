import { useState } from "react";
import Expenses from "./Expenses.jsx";
import RawMaterial from "./RawMaterial.jsx";

/**
 * Combined "Expenses & Materials" screen. Raw material is really just one kind of expense, so the two
 * former menu items are merged into one page with two tabs — the admin can record both here.
 */
export default function ExpensesMaterials() {
  const [tab, setTab] = useState("expenses");

  const tabClass = (active) =>
    `flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-200 ${
      active ? "bg-brand-600 text-white shadow-sm" : "text-ink-600 hover:bg-white hover:text-ink-900"
    }`;

  return (
    <div>
      <div className="px-4 pt-4 sm:px-6">
        <div className="inline-flex gap-1 rounded-full bg-ink-100 p-1">
          <button onClick={() => setTab("expenses")} className={tabClass(tab === "expenses")}>
            💸 Expenses
          </button>
          <button onClick={() => setTab("raw")} className={tabClass(tab === "raw")}>
            🧱 Raw Material
          </button>
        </div>
      </div>

      {tab === "expenses" ? <Expenses /> : <RawMaterial />}
    </div>
  );
}
