import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { DEFAULT_API_URL } from "@/lib/scraper-types";

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  apiUrl: string;
  onSave: (url: string) => void;
};

export function SettingsDialog({ open, onOpenChange, apiUrl, onSave }: Props) {
  const [value, setValue] = useState(apiUrl);

  useEffect(() => {
    if (open) setValue(apiUrl);
  }, [open, apiUrl]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure the backend API endpoint used for scraping.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <Label htmlFor="api-url">Backend API URL</Label>
          <div className="flex gap-2">
            <Input
              id="api-url"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={DEFAULT_API_URL}
              spellCheck={false}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              title="Reset to default"
              onClick={() => setValue(DEFAULT_API_URL)}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            The scrape request will be POSTed to <code className="font-mono">{`${value || DEFAULT_API_URL}/scrape`}</code>.
          </p>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={() => {
              onSave(value.trim() || DEFAULT_API_URL);
              onOpenChange(false);
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
