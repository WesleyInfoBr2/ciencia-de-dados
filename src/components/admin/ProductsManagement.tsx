import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ProductEditDialog } from "./ProductEditDialog";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: string;
  is_available: boolean;
  custom_domain: string;
  launch_date: string;
  github_repo_url?: string;
  supabase_project_id?: string;
}

export const ProductsManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        title: "Erro ao carregar produtos",
        description: "Não foi possível carregar a lista de produtos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      development: { variant: "outline", label: "Em Desenvolvimento" },
      beta: { variant: "secondary", label: "Beta" },
      production: { variant: "default", label: "Produção" },
      maintenance: { variant: "destructive", label: "Manutenção" },
    };
    const config = variants[status] || variants.development;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleToggleAvailability = async (product: Product) => {
    try {
      const { error } = await supabase
        .from("products")
        .update({ is_available: !product.is_available })
        .eq("id", product.id);

      if (error) throw error;

      toast({
        title: "Produto atualizado",
        description: `${product.name} foi ${!product.is_available ? "disponibilizado" : "ocultado"}.`,
      });

      fetchProducts();
    } catch (error) {
      console.error("Error toggling availability:", error);
      toast({
        title: "Erro ao atualizar produto",
        description: "Não foi possível atualizar a disponibilidade do produto.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card key={product.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl mb-2">{product.name}</CardTitle>
                  <CardDescription>{product.description}</CardDescription>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                {getStatusBadge(product.status)}
                <Badge variant={product.is_available ? "default" : "outline"}>
                  {product.is_available ? "Público" : "Oculto"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm">
                <span className="font-medium">Domínio:</span>{" "}
                <span className="text-muted-foreground">{product.custom_domain || "N/A"}</span>
              </div>
              <div className="text-sm">
                <span className="font-medium">Lançamento:</span>{" "}
                <span className="text-muted-foreground">
                  {product.launch_date ? new Date(product.launch_date).toLocaleDateString("pt-BR") : "N/A"}
                </span>
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingProduct(product);
                    setIsDialogOpen(true);
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant={product.is_available ? "destructive" : "default"}
                  onClick={() => handleToggleAvailability(product)}
                >
                  {product.is_available ? "Ocultar" : "Publicar"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ProductEditDialog
        product={editingProduct}
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingProduct(null);
        }}
        onSave={() => {
          fetchProducts();
          setIsDialogOpen(false);
          setEditingProduct(null);
        }}
      />
    </>
  );
};
