import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Wiki from "./pages/Wiki";
import Libraries from "./pages/Libraries";
import { LibraryDetail } from "./pages/LibraryDetail";
import WikiPost from "./pages/WikiPost";
import WikiNew from "./pages/WikiNew";
import WikiEdit from "./pages/WikiEdit";
import WikiImport from "./pages/WikiImport";
import NotFound from "./pages/NotFound";
import DevTiptap from "./pages/DevTiptap";
import ProductEstatisticaFacil from "./pages/ProductEstatisticaFacil";
import ProductRevPrisma from "./pages/ProductRevPrisma";
import ProductDadosBrasil from "./pages/ProductDadosBrasil";
import Admin from "./pages/Admin";
import AdminCommentModeration from "./pages/AdminCommentModeration";
import Pricing from "./pages/Pricing";
import TermsOfUse from "./pages/TermsOfUse";
import PrivacyPolicy from "./pages/PrivacyPolicy";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/wiki" element={<Wiki />} />
            <Route path="/libraries" element={<Libraries />} />
            <Route path="/bibliotecas" element={<Libraries />} />
            <Route path="/bibliotecas/:slug" element={<LibraryDetail />} />
            <Route path="/wiki/new" element={<WikiNew />} />
            <Route path="/wiki/edit/:slug" element={<WikiEdit />} />
            <Route path="/wiki/import" element={<WikiImport />} />
            <Route path="/wiki/:slug" element={<WikiPost />} />
            <Route path="/dev/tiptap" element={<DevTiptap />} />
            <Route path="/produtos/estatisticafacil" element={<ProductEstatisticaFacil />} />
            <Route path="/produtos/revprisma" element={<ProductRevPrisma />} />
            <Route path="/produtos/dadosbrasil" element={<ProductDadosBrasil />} />
            <Route path="/precos" element={<Pricing />} />
            <Route path="/termos" element={<TermsOfUse />} />
            <Route path="/privacidade" element={<PrivacyPolicy />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/comments" element={<AdminCommentModeration />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
