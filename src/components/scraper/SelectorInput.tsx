import { useState, KeyboardEvent } from "react";
import { X, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Props = {
  selectors: string[];
  onChange: (s: string[]) => void;
};

export function SelectorInput({ selectors, onChange }: Props) {
  const [draft, setDraft] = useState("");

  const add = () => {
    const v = draft.trim();
    if (!v || selectors.includes(v)) {
      setDraft("");
      return;
    }
    onChange([...selectors, v]);
    setDraft("");
  };

  const remove = (s: string) => onChange(selectors.filter((x) => x !== s));

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      add();
    } else if (e.key === "Backspace" && !draft && selectors.length) {
      onChange(selectors.slice(0, -1));
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 rounded-md border border-input bg-background p-2 min-h-[44px]">
        {selectors.length === 0 && (
          <span className="text-sm text-muted-foreground px-1 py-0.5">No selectors added yet</span>
        )}
        {selectors.map((s) => (
          <span
            key={s}
            className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/50 px-2 py-1 text-xs font-mono text-foreground"
          >
            {s}
            <button
              type="button"
              onClick={() => remove(s)}
              className="ml-0.5 rounded-sm p-0.5 hover:bg-muted transition-colors"
              aria-label={`Remove ${s}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKey}
          placeholder="Type a selector and press Enter (e.g. h1, .product-title)"
          className="font-mono text-sm"
        />
        <Button type="button" variant="outline" onClick={add} disabled={!draft.trim()}>
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </div>
    </div>
  );
}
