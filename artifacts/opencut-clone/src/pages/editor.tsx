import { useParams, Link, useLocation } from "wouter";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useGetProject, getGetProjectQueryKey, useUpdateProject, useDeleteProject } from "@workspace/api-client-react";
import { ChevronLeft, Play, Pause, SkipBack, SkipForward, Download, Settings as SettingsIcon, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MediaPanel } from "@/components/editor/media-panel";
import { Timeline } from "@/components/editor/timeline";
import { PropertiesPanel } from "@/components/editor/properties-panel";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";

export function Editor() {
  const { id } = useParams();
  const projectId = parseInt(id || "0", 10);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  const { data: project, isLoading } = useGetProject(projectId, {
    query: { enabled: !!projectId, queryKey: getGetProjectQueryKey(projectId) }
  });

  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState("");

  useEffect(() => {
    if (project) setRenameValue(project.name);
  }, [project]);

  const handleRename = () => {
    if (!renameValue) return;
    updateProject.mutate({
      id: projectId,
      data: { name: renameValue }
    }, {
      onSuccess: () => {
        setIsRenameOpen(false);
        queryClient.invalidateQueries({ queryKey: getGetProjectQueryKey(projectId) });
      }
    });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this project?")) {
      deleteProject.mutate({ id: projectId }, {
        onSuccess: () => setLocation("/")
      });
    }
  };

  if (isLoading) {
    return <div className="h-screen w-full flex items-center justify-center bg-background">Loading...</div>;
  }

  if (!project) {
    return <div className="h-screen w-full flex items-center justify-center bg-background text-destructive">Project not found</div>;
  }

  return (
    <div className="h-screen w-full flex flex-col bg-background text-foreground overflow-hidden">
      {/* Top Toolbar */}
      <header className="h-14 border-b border-border flex items-center justify-between px-4 shrink-0 bg-card">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 group">
              <h1 className="font-semibold text-sm">{project.name}</h1>
              
              <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Edit2 className="w-3 h-3" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Rename Project</DialogTitle>
                  </DialogHeader>
                  <div className="py-4 space-y-4">
                    <div className="space-y-2">
                      <Label>Project Name</Label>
                      <Input 
                        value={renameValue} 
                        onChange={(e) => setRenameValue(e.target.value)} 
                        autoFocus
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsRenameOpen(false)}>Cancel</Button>
                    <Button onClick={handleRename} disabled={updateProject.isPending || !renameValue}>
                      {updateProject.isPending ? "Saving..." : "Save"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <span className="text-xs text-muted-foreground">{project.resolution} • {project.fps}fps</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="w-8 h-8 rounded-full"><SkipBack className="w-4 h-4" /></Button>
          <Button variant="secondary" size="icon" className="w-10 h-10 rounded-full bg-primary/20 text-primary hover:bg-primary/30"><Play className="w-5 h-5 fill-current" /></Button>
          <Button variant="outline" size="icon" className="w-8 h-8 rounded-full"><SkipForward className="w-4 h-4" /></Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-destructive w-8 h-8 hover:bg-destructive/10 hover:text-destructive" onClick={handleDelete} disabled={deleteProject.isPending}>
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <SettingsIcon className="w-4 h-4" />
            Settings
          </Button>
          <Button size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="vertical">
          <ResizablePanel defaultSize={60}>
            <ResizablePanelGroup direction="horizontal">
              {/* Media/Assets Panel */}
              <ResizablePanel defaultSize={20} minSize={15}>
                <MediaPanel projectId={projectId} />
              </ResizablePanel>
              
              <ResizableHandle withHandle />
              
              {/* Preview Monitor */}
              <ResizablePanel defaultSize={60} className="flex flex-col bg-black">
                <div className="flex-1 relative flex items-center justify-center p-4">
                  <div className="aspect-video w-full max-w-4xl bg-card border border-border shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30 font-mono text-sm">
                      Playback Monitor
                    </div>
                  </div>
                </div>
                <div className="h-10 border-t border-border/30 bg-card/50 flex items-center px-4 text-xs font-mono text-muted-foreground justify-between">
                  <span>00:00:00:00</span>
                  <span>Fit (100%)</span>
                </div>
              </ResizablePanel>

              <ResizableHandle withHandle />

              {/* Properties Panel */}
              <ResizablePanel defaultSize={20} minSize={15}>
                <PropertiesPanel />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          {/* Timeline Panel */}
          <ResizablePanel defaultSize={40} minSize={20}>
            <Timeline project={project} />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
