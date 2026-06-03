import { useListProjects, useGetProjectStats, useCreateProject, getListProjectsQueryKey, getGetProjectStatsQueryKey, useListRecentProjects, useHealthCheck } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Film, Plus, Clock, Video, Image as ImageIcon, Activity } from "lucide-react";
import { Link, useLocation } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQueryClient } from "@tanstack/react-query";

export function Home() {
  const { data: projects, isLoading: projectsLoading } = useListProjects();
  const { data: recentProjects, isLoading: recentLoading } = useListRecentProjects();
  const { data: stats, isLoading: statsLoading } = useGetProjectStats();
  const { data: health } = useHealthCheck();
  const createProject = useCreateProject();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");

  const handleCreateProject = () => {
    if (!newProjectName) return;
    createProject.mutate({
      data: { name: newProjectName, fps: 30, resolution: "1920x1080" }
    }, {
      onSuccess: (newProject) => {
        setIsCreateOpen(false);
        setNewProjectName("");
        queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetProjectStatsQueryKey() });
        setLocation(`/editor/${newProject.id}`);
      }
    });
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
            {health && (
              <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <Activity className="w-3 h-3" />
                <span>API {health.status}</span>
              </div>
            )}
          </div>
          <p className="text-muted-foreground mt-1">Manage and create video projects</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label>Project Name</Label>
                <Input 
                  value={newProjectName} 
                  onChange={(e) => setNewProjectName(e.target.value)} 
                  placeholder="Untitled Project"
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateProject} disabled={createProject.isPending || !newProjectName}>
                {createProject.isPending ? "Creating..." : "Create Project"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {!statsLoading && stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Projects</CardTitle>
              <Film className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProjects}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Recent</CardTitle>
              <Clock className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recentCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Assets</CardTitle>
              <ImageIcon className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAssets}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Duration</CardTitle>
              <Clock className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.floor(stats.totalDuration / 60)}m {stats.totalDuration % 60}s</div>
            </CardContent>
          </Card>
        </div>
      )}

      {recentProjects && recentProjects.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Recent Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {recentProjects.map(project => (
              <Link key={`recent-${project.id}`} href={`/editor/${project.id}`} className="block group">
                <Card className="overflow-hidden transition-all hover:border-primary/50 hover:shadow-md cursor-pointer h-full border-border bg-muted/30">
                  <div className="aspect-video bg-background relative group-hover:opacity-90 transition-opacity flex items-center justify-center border-b border-border">
                    {project.thumbnail ? (
                      <img src={project.thumbnail} alt={project.name} className="w-full h-full object-cover" />
                    ) : (
                      <Film className="w-12 h-12 text-muted-foreground/30" />
                    )}
                    <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs font-mono">
                      {Math.floor(project.duration / 60)}:{(project.duration % 60).toString().padStart(2, '0')}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-base line-clamp-1 group-hover:text-primary transition-colors">{project.name}</h3>
                    <div className="text-xs text-muted-foreground mt-1">
                      Edited {formatDistanceToNow(new Date(project.updatedAt))} ago
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-4">All Projects</h2>
        
        {projectsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Card key={i} className="h-48 animate-pulse bg-muted" />
            ))}
          </div>
        ) : projects?.length === 0 ? (
          <div className="text-center py-16 border rounded-lg border-dashed border-border bg-card">
            <Video className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No projects yet</h3>
            <p className="text-muted-foreground mb-4">Create your first video project to get started.</p>
            <Button onClick={() => setIsCreateOpen(true)}>Create Project</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {projects?.map(project => (
              <Link key={project.id} href={`/editor/${project.id}`} className="block group">
                <Card className="overflow-hidden transition-all hover:border-primary/50 hover:shadow-md cursor-pointer h-full border-border">
                  <div className="aspect-video bg-muted relative group-hover:opacity-90 transition-opacity flex items-center justify-center">
                    {project.thumbnail ? (
                      <img src={project.thumbnail} alt={project.name} className="w-full h-full object-cover" />
                    ) : (
                      <Film className="w-12 h-12 text-muted-foreground/30" />
                    )}
                    <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs font-mono">
                      {Math.floor(project.duration / 60)}:{(project.duration % 60).toString().padStart(2, '0')}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-base line-clamp-1 group-hover:text-primary transition-colors">{project.name}</h3>
                    <div className="flex items-center text-xs text-muted-foreground mt-2 gap-2">
                      <span>{project.resolution}</span>
                      <span>•</span>
                      <span>{project.fps} fps</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Edited {formatDistanceToNow(new Date(project.updatedAt))} ago
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
