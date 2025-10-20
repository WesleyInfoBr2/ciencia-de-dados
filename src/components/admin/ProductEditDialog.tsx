import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: string;
  custom_domain: string;
  launch_date: string;
  github_repo_url?: string;
  supabase_project_id?: string;
}

interface ProductEditDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

export const ProductEditDialog = ({ product, open, onOpenChange, onSave }: ProductEditDialogProps) => {
  const [formData, setFormData] = useState<Partial<Product>>({});
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (product) {
      setFormData(product);
    }
  }, [product]);

  const handleSave = async () => {
    if (!product) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("products")
        .update({
          name: formData.name,
          description: formData.description,
          status: formData.status,
          custom_domain: formData.custom_domain,
          launch_date: formData.launch_date,
          github_repo_url: formData.github_repo_url,
          supabase_project_id: formData.supabase_project_id,
        })
        .eq("id", product.id);

      if (error) throw error;

      toast({
        title: "Produto atualizado",
        description: "As informações do produto foram atualizadas com sucesso.",
      });

      onSave();
    } catch (error) {
      console.error("Error updating product:", error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar o produto.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Produto</DialogTitle>
          <DialogDescription>
            Atualize as informações do produto abaixo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={formData.name || ""}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status || "development"}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="development">Em Desenvolvimento</SelectItem>
                <SelectItem value="beta">Beta</SelectItem>
                <SelectItem value="production">Produção</SelectItem>
                <SelectItem value="maintenance">Manutenção</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="custom_domain">Domínio Personalizado</Label>
            <Input
              id="custom_domain"
              placeholder="produto.cienciadedados.org"
              value={formData.custom_domain || ""}
              onChange={(e) => setFormData({ ...formData, custom_domain: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="launch_date">Data de Lançamento</Label>
            <Input
              id="launch_date"
              type="date"
              value={formData.launch_date ? new Date(formData.launch_date).toISOString().split('T')[0] : ""}
              onChange={(e) => setFormData({ ...formData, launch_date: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="github_repo_url">URL do Repositório GitHub</Label>
            <Input
              id="github_repo_url"
              placeholder="https://github.com/usuario/repositorio"
              value={formData.github_repo_url || ""}
              onChange={(e) => setFormData({ ...formData, github_repo_url: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="supabase_project_id">ID do Projeto Supabase</Label>
            <Input
              id="supabase_project_id"
              placeholder="abcdefghijklmnop"
              value={formData.supabase_project_id || ""}
              onChange={(e) => setFormData({ ...formData, supabase_project_id: e.target.value })}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
