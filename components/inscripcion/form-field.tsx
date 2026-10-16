interface BaseField {
  fieldKey: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  full?: boolean;
  hint?: string;
}

interface InputField extends BaseField {
  kind: "input";
  type?: string;
  placeholder?: string;
}
interface SelectField extends BaseField {
  kind: "select";
  options: string[];
}
interface AreaField extends BaseField {
  kind: "area";
  placeholder?: string;
}

export type Field = InputField | SelectField | AreaField;

export function FormField(f: Field) {
  return (
    <label className={`flex flex-col gap-1.5 ${f.full ? "col-span-full" : ""}`}>
      <span className="font-mono text-[11px] font-semibold uppercase tracking-wide text-liciba-muted">{f.label}</span>
      {f.kind === "input" && (
        <input
          type={f.type ?? "text"}
          value={f.value}
          onChange={(e) => f.onChange(e.target.value)}
          placeholder={f.placeholder}
          className="min-h-12 w-full border-2 border-[#D6D3CA] bg-white px-3.5 font-sans text-base font-medium text-liciba-ink"
        />
      )}
      {f.kind === "select" && (
        <select
          value={f.value}
          onChange={(e) => f.onChange(e.target.value)}
          className="min-h-12 w-full border-2 border-[#D6D3CA] bg-white px-2.5 font-sans text-base font-medium text-liciba-ink"
        >
          {f.options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      )}
      {f.kind === "area" && (
        <textarea
          value={f.value}
          onChange={(e) => f.onChange(e.target.value)}
          placeholder={f.placeholder}
          rows={3}
          className="w-full resize-y border-2 border-[#D6D3CA] bg-white px-3.5 py-3 font-sans text-base leading-snug text-liciba-ink"
        />
      )}
      {f.hint && <span className="text-[13px] font-semibold text-liciba-green">{f.hint}</span>}
    </label>
  );
}
