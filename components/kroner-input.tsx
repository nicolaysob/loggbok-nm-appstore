"use client";

import { useState } from "react";
import { formatKroner, parseDecimal } from "@/lib/format";
import { inputClass } from "@/components/form";

// Viser tusenskille når feltet mister fokus, og rått tall mens du skriver.
// Server-siden tåler begge formene, så verdien kan sendes som den står.
export function KronerInput({
  id,
  name,
  defaultValue,
}: {
  id: string;
  name: string;
  defaultValue?: number;
}) {
  const [value, setValue] = useState(
    defaultValue === undefined ? "" : formatKroner(defaultValue),
  );

  return (
    <input
      id={id}
      name={name}
      type="text"
      inputMode="decimal"
      value={value}
      onChange={(event) => setValue(event.target.value)}
      onFocus={() => {
        const parsed = parseDecimal(value);
        setValue(parsed === null ? "" : String(parsed));
      }}
      onBlur={() => {
        const parsed = parseDecimal(value);
        if (parsed !== null) setValue(formatKroner(parsed));
      }}
      className={inputClass}
    />
  );
}
