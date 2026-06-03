import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

export function PropertiesPanel() {
  return (
    <div className="h-full flex flex-col bg-card border-l border-border">
      <div className="h-10 border-b border-border flex items-center px-3 shrink-0">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Inspector</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Transform</h3>
          
          <div className="space-y-3">
            <div className="grid grid-cols-3 items-center gap-2">
              <Label className="text-xs text-muted-foreground">Scale</Label>
              <div className="col-span-2 flex items-center gap-2">
                <Slider defaultValue={[100]} max={200} step={1} className="flex-1" />
                <Input className="w-14 h-7 text-xs px-1 text-right" value="100%" readOnly />
              </div>
            </div>

            <div className="grid grid-cols-3 items-center gap-2">
              <Label className="text-xs text-muted-foreground">Position X</Label>
              <Input className="col-span-2 h-7 text-xs" value="0.0" readOnly />
            </div>

            <div className="grid grid-cols-3 items-center gap-2">
              <Label className="text-xs text-muted-foreground">Position Y</Label>
              <Input className="col-span-2 h-7 text-xs" value="0.0" readOnly />
            </div>

            <div className="grid grid-cols-3 items-center gap-2">
              <Label className="text-xs text-muted-foreground">Rotation</Label>
              <div className="col-span-2 flex items-center gap-2">
                <Slider defaultValue={[0]} min={-180} max={180} step={1} className="flex-1" />
                <Input className="w-14 h-7 text-xs px-1 text-right" value="0°" readOnly />
              </div>
            </div>
          </div>
        </div>

        <div className="h-px bg-border" />

        <div className="space-y-4">
          <h3 className="text-sm font-medium">Compositing</h3>
          
          <div className="space-y-3">
            <div className="grid grid-cols-3 items-center gap-2">
              <Label className="text-xs text-muted-foreground">Opacity</Label>
              <div className="col-span-2 flex items-center gap-2">
                <Slider defaultValue={[100]} max={100} step={1} className="flex-1" />
                <Input className="w-14 h-7 text-xs px-1 text-right" value="100%" readOnly />
              </div>
            </div>
            
            <div className="grid grid-cols-3 items-center gap-2">
              <Label className="text-xs text-muted-foreground">Blend Mode</Label>
              <Input className="col-span-2 h-7 text-xs" value="Normal" readOnly />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
