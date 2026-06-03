import { useListProjectAssets, useCreateAsset, useDeleteAsset, getListProjectAssetsQueryKey } from "@workspace/api-client-react";
import { Plus, Image as ImageIcon, Music, Video, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function MediaPanel({ projectId }: { projectId: number }) {
  const { data: assets, isLoading } = useListProjectAssets(projectId, {
    query: { enabled: !!projectId, queryKey: getListProjectAssetsQueryKey(projectId) }
  });
  
  const createAsset = useCreateAsset();
  const deleteAsset = useDeleteAsset();
  const queryClient = useQueryClient();

  const [isImportOpen, setIsImportOpen] = useState(false);
  const [newAsset, setNewAsset] = useState({ name: "", type: "video", url: "" });

  const handleImport = () => {
    if (!newAsset.name || !newAsset.url) return;
    createAsset.mutate({
      id: projectId,
      data: {
        name: newAsset.name,
        type: newAsset.type,
        url: newAsset.url,
        size: 1024 * 1024 * 5, // mock 5MB
        duration: newAsset.type === "image" ? undefined : 10
      }
    }, {
      onSuccess: () => {
        setIsImportOpen(false);
        setNewAsset({ name: "", type: "video", url: "" });
        queryClient.invalidateQueries({ queryKey: getListProjectAssetsQueryKey(projectId) });
      }
    });
  };

  const handleDelete = (assetId: number) => {
    deleteAsset.mutate({ id: projectId, assetId }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListProjectAssetsQueryKey(projectId) });
      }
    });
  };

  return (
    <div className="h-full flex flex-col bg-card border-r border-border">
      <div className="h-10 border-b border-border flex items-center justify-between px-3 shrink-0">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Project Media</span>
        <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="w-6 h-6 h-6"><Plus className="w-4 h-4" /></Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Import Media</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label>Asset Name</Label>
                <Input value={newAsset.name} onChange={e => setNewAsset({...newAsset, name: e.target.value})} placeholder="my-video.mp4" />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={newAsset.type} onValueChange={(val) => setNewAsset({...newAsset, type: val})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>URL</Label>
                <Input value={newAsset.url} onChange={e => setNewAsset({...newAsset, url: e.target.value})} placeholder="https://..." />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsImportOpen(false)}>Cancel</Button>
              <Button onClick={handleImport} disabled={createAsset.isPending || !newAsset.name || !newAsset.url}>Import</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <ScrollArea className="flex-1 p-2">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => <div key={i} className="h-16 bg-muted animate-pulse rounded" />)}
          </div>
        ) : assets?.length === 0 ? (
          <div className="text-center p-4 text-sm text-muted-foreground">
            No media imported yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {assets?.map(asset => (
              <div key={asset.id} className="relative group rounded border border-border bg-background overflow-hidden cursor-grab active:cursor-grabbing">
                <div className="aspect-square bg-muted flex items-center justify-center">
                  {asset.type === 'video' && <Video className="w-6 h-6 text-muted-foreground/50" />}
                  {asset.type === 'audio' && <Music className="w-6 h-6 text-muted-foreground/50" />}
                  {asset.type === 'image' && <ImageIcon className="w-6 h-6 text-muted-foreground/50" />}
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1 text-[10px] truncate">
                  {asset.name}
                </div>
                <Button 
                  variant="destructive" 
                  size="icon" 
                  className="absolute top-1 right-1 w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity rounded-full h-5"
                  onClick={() => handleDelete(asset.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
