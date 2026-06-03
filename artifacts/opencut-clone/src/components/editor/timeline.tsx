import { ScrollArea } from "@/components/ui/scroll-area";
import { MousePointer2, Scissors, Settings2 } from "lucide-react";
import { Project } from "@workspace/api-client-react";

export function Timeline({ project }: { project: Project }) {
  // Mock timeline data for UI purposes
  const tracks = [
    { id: 1, name: "V1", type: "video", clips: [
      { id: 101, start: 0, duration: 120, name: "Intro Sequence", color: "bg-blue-600/80" },
      { id: 102, start: 150, duration: 300, name: "Main Interview", color: "bg-blue-600/80" },
    ]},
    { id: 2, name: "V2", type: "video", clips: [
      { id: 103, start: 50, duration: 80, name: "B-Roll 1", color: "bg-indigo-500/80" },
    ]},
    { id: 3, name: "A1", type: "audio", clips: [
      { id: 201, start: 0, duration: 450, name: "Background Music", color: "bg-emerald-600/80" }
    ]},
    { id: 4, name: "A2", type: "audio", clips: [
      { id: 202, start: 150, duration: 300, name: "Interview Audio", color: "bg-teal-500/80" }
    ]}
  ];

  const scale = 2; // px per second

  return (
    <div className="h-full flex flex-col bg-card border-t border-border">
      {/* Timeline Toolbar */}
      <div className="h-10 border-b border-border flex items-center px-4 gap-2 shrink-0">
        <div className="flex items-center gap-1 bg-background rounded-md p-1 border border-border">
          <button className="p-1 hover:bg-muted rounded text-primary"><MousePointer2 className="w-4 h-4" /></button>
          <button className="p-1 hover:bg-muted rounded text-muted-foreground"><Scissors className="w-4 h-4" /></button>
        </div>
        <div className="h-4 w-px bg-border mx-2" />
        <button className="p-1.5 hover:bg-muted rounded text-muted-foreground"><Settings2 className="w-4 h-4" /></button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Track Headers */}
        <div className="w-24 shrink-0 border-r border-border bg-card/80 flex flex-col pt-6">
          {tracks.map(track => (
            <div key={track.id} className="h-20 border-b border-border px-2 py-1 flex items-center justify-between group">
              <span className="text-xs font-mono font-bold text-muted-foreground">{track.name}</span>
            </div>
          ))}
        </div>

        {/* Tracks Content */}
        <ScrollArea className="flex-1 bg-background relative" orientation="horizontal">
          <div className="min-w-max pb-10">
            {/* Time Ruler */}
            <div className="h-6 border-b border-border sticky top-0 bg-background/90 z-10 flex text-[10px] text-muted-foreground font-mono">
              {Array.from({length: 30}).map((_, i) => (
                <div key={i} className="shrink-0 border-l border-border/50 pl-1" style={{ width: `${60 * scale}px` }}>
                  00:{(i).toString().padStart(2, '0')}:00
                </div>
              ))}
            </div>

            {/* Tracks */}
            <div className="flex flex-col">
              {tracks.map(track => (
                <div key={track.id} className="h-20 border-b border-border/30 relative bg-muted/10">
                  {track.clips.map(clip => (
                    <div 
                      key={clip.id}
                      className={`absolute top-2 bottom-2 rounded-sm border border-white/20 shadow-sm cursor-pointer hover:brightness-110 active:scale-[0.99] transition-transform overflow-hidden px-2 py-1 ${clip.color}`}
                      style={{
                        left: `${clip.start * scale}px`,
                        width: `${clip.duration * scale}px`
                      }}
                    >
                      <span className="text-[10px] font-medium text-white truncate block drop-shadow-md">{clip.name}</span>
                    </div>
                  ))}
                </div>
              ))}
              
              {/* Playhead */}
              <div className="absolute top-0 bottom-0 w-px bg-primary z-20 pointer-events-none" style={{ left: '200px' }}>
                <div className="w-3 h-3 rotate-45 bg-primary absolute -top-1.5 -left-1.5 rounded-sm" />
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
