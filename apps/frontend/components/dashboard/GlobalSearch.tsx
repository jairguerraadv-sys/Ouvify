"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader, FileText, Tag, MessageSquare, X } from "lucide-react";
import { api } from "@/lib/api";
import { useDebounce } from "@/hooks/use-common";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface SearchResult {
  type: "feedback" | "tag" | "response_template";
  id: number;
  title: string;
  subtitle?: string;
  url: string;
  relevance_score?: number;
}

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const debouncedQuery = useDebounce(query, 300);

  // Buscar resultados com autocomplete
  useEffect(() => {
    const search = async () => {
      if (!debouncedQuery.trim() || debouncedQuery.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const response = await api.get<SearchResult[]>(
          "/api/search/autocomplete/",
          {
            params: { q: debouncedQuery, limit: 10 },
          },
        );
        setResults(response || []);
        setSelectedIndex(0);
      } catch (error) {
        console.error("Erro na busca:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    search();
  }, [debouncedQuery]);

  // Navegação por teclado
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % results.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(
          (prev) => (prev - 1 + results.length) % results.length,
        );
      } else if (e.key === "Enter" && results[selectedIndex]) {
        e.preventDefault();
        handleSelect(results[selectedIndex]);
      } else if (e.key === "Escape") {
        onOpenChange(false);
      }
    },
    [results, selectedIndex, onOpenChange],
  );

  const handleSelect = (result: SearchResult) => {
    router.push(result.url);
    onOpenChange(false);
    setQuery("");
    setResults([]);
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case "feedback":
        return <MessageSquare className="w-4 h-4" />;
      case "tag":
        return <Tag className="w-4 h-4" />;
      case "response_template":
        return <FileText className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  const getResultTypeName = (type: string) => {
    switch (type) {
      case "feedback":
        return "Feedback";
      case "tag":
        return "Tag";
      case "response_template":
        return "Template";
      default:
        return type;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[600px] p-0 gap-0">
        <DialogHeader className="px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Buscar feedbacks, tags, templates..."
              className="border-0 focus-visible:ring-0 h-auto p-0 text-base"
              autoFocus
            />
            {loading && (
              <Loader className="w-4 h-4 animate-spin text-muted-foreground" />
            )}
          </div>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[400px]">
          {query.trim() && results.length === 0 && !loading && (
            <div className="p-8 text-center text-muted-foreground">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum resultado encontrado</p>
              <p className="text-sm mt-1">
                Tente buscar por protocolo, título ou palavras-chave
              </p>
            </div>
          )}

          {!query.trim() && (
            <div className="p-8 text-center text-muted-foreground">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Digite para buscar</p>
              <div className="flex items-center justify-center gap-2 mt-4 text-xs">
                <Badge variant="outline" className="font-mono">
                  ↑↓
                </Badge>
                <span>Navegar</span>
                <Badge variant="outline" className="font-mono">
                  Enter
                </Badge>
                <span>Selecionar</span>
                <Badge variant="outline" className="font-mono">
                  Esc
                </Badge>
                <span>Fechar</span>
              </div>
            </div>
          )}

          {results.length > 0 && (
            <div className="py-2">
              {results.map((result, index) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleSelect(result)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors ${
                    index === selectedIndex
                      ? "bg-primary/10 border-l-2 border-primary"
                      : "hover:bg-muted border-l-2 border-transparent"
                  }`}
                >
                  <div
                    className={`mt-0.5 ${index === selectedIndex ? "text-primary" : "text-muted-foreground"}`}
                  >
                    {getResultIcon(result.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground truncate">
                        {result.title}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {getResultTypeName(result.type)}
                      </Badge>
                    </div>
                    {result.subtitle && (
                      <p className="text-sm text-muted-foreground truncate mt-0.5">
                        {result.subtitle}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="px-4 py-2 border-t bg-muted/50 text-xs text-muted-foreground">
          <span className="font-mono">Ctrl+K</span> ou{" "}
          <span className="font-mono">Cmd+K</span> para abrir a busca
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Hook para ativar busca global com Cmd+K / Ctrl+K
 */
export function useGlobalSearch() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return { open, setOpen };
}
