import { useMemo, useState } from "react";
import { useIndicators } from "@/core/headless";
import { useChartT } from "@/features/chart/hooks/use-chart-t";
import {
  Search,
  Check,
  Eye,
  EyeOff,
  X,
  ChevronUp,
  ChevronDown,
  Minimize2,
  Maximize2,
  Rows2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SimpleTooltip as Tooltip } from "@/features/chart/components/ui/simple-tooltip";
import { IndicatorParamsPopover } from "@/features/chart/components/indicator-params-popover";
import { getIndicatorDescription } from "@/features/chart/utils/indicator-description";
import { CUSTOM_MAIN_INDICATORS } from "@/features/chart/utils/custom-indicators";
import { cn } from "@/lib/utils";

interface IndicatorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function ActionBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex shrink-0 items-center gap-0.5 rounded-md border border-border/60 bg-muted/40 p-0.5">
      {children}
    </div>
  );
}

function CatalogItem({
  name,
  isActive,
  onToggle,
}: {
  name: string;
  isActive: boolean;
  onToggle: () => void;
}) {
  const { t } = useChartT();
  const description = getIndicatorDescription(t, name);
  return (
    <button
      type="button"
      onClick={onToggle}
      title={description}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 text-start transition-colors hover:bg-accent",
        isActive && "border-primary/25 bg-primary/10 hover:bg-primary/15",
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className={cn("text-sm font-medium", isActive && "text-primary")}>{name}</span>
          {isActive && (
            <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-normal">
              ON
            </Badge>
          )}
        </div>
        <p className="mt-0.5 min-h-[2.5rem] line-clamp-2 text-xs leading-snug text-muted-foreground">
          {description}
        </p>
      </div>
      {isActive && <Check className="size-4 shrink-0 text-primary" />}
    </button>
  );
}

function SectionHeading({ children, count }: { children: React.ReactNode; count?: number }) {
  return (
    <div className="flex items-center justify-between px-1 pb-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {children}
      </h3>
      {typeof count === "number" && (
        <span className="text-xs tabular-nums text-muted-foreground">{count}</span>
      )}
    </div>
  );
}

export function IndicatorDialog({ open, onOpenChange }: IndicatorDialogProps) {
  const { t } = useChartT();
  const ind = useIndicators();
  const [query, setQuery] = useState("");
  const q = query.trim().toUpperCase();

  const toggleVisible = (name: string, isMain: boolean) => {
    ind.setIndicatorVisible(name, isMain, !ind.isIndicatorVisible(name, isMain));
  };

  const filteredMain = useMemo(() => {
    const library = ind.mainIndicators.filter((i) => i.name.toUpperCase().includes(q));
    const custom = CUSTOM_MAIN_INDICATORS.filter((name) => name.toUpperCase().includes(q)).map(
      (name) => ({
        name,
        isActive: ind.activeMainIndicators.includes(name),
        visible: ind.isIndicatorVisible(name, true),
      }),
    );
    const libraryNames = new Set(library.map((item) => item.name));
    return [...custom.filter((item) => !libraryNames.has(item.name)), ...library];
  }, [ind.mainIndicators, ind.activeMainIndicators, ind.isIndicatorVisible, q]);
  const filteredSub = useMemo(
    () => ind.subIndicators.filter((i) => i.name.toUpperCase().includes(q)),
    [ind.subIndicators, q],
  );

  const activeMain = ind.activeMainIndicators;
  const activeSub = ind.activeSubIndicators;
  const activeCount = activeMain.length + Object.keys(activeSub).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[min(85vh,720px)] max-h-[85vh] w-full max-w-3xl flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="shrink-0 space-y-1 border-b border-border px-5 py-4">
          <DialogTitle>{t("ind.title")}</DialogTitle>
          <DialogDescription>{t("ind.desc")}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="available" className="flex min-h-0 flex-1 flex-col">
          <div className="shrink-0 border-b border-border px-5 py-3">
            <TabsList className="grid h-9 w-full grid-cols-2">
              <TabsTrigger value="available">{t("ind.tabCatalog")}</TabsTrigger>
              <TabsTrigger value="active" className="gap-1.5">
                {t("ind.tabActive")}
                {activeCount > 0 && (
                  <Badge variant="secondary" className="h-5 min-w-5 px-1.5 text-[10px] font-normal">
                    {activeCount}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            value="available"
            className="mt-0 flex min-h-0 flex-1 flex-col gap-4 px-5 py-4"
          >
            <div className="flex shrink-0 items-center gap-2 rounded-lg border border-input bg-muted/20 px-3">
              <Search className="size-4 shrink-0 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("ind.searchPh")}
                className="h-10 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
              />
            </div>

            <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 md:grid-cols-2">
              {[
                { title: t("ind.onChart"), list: filteredMain, toggle: ind.toggleMainIndicator },
                { title: t("ind.inPanes"), list: filteredSub, toggle: ind.toggleSubIndicator },
              ].map((col) => (
                <section key={col.title} className="flex min-h-0 min-w-0 flex-col">
                  <SectionHeading count={col.list.length}>{col.title}</SectionHeading>
                  <ScrollArea className="min-h-0 flex-1 rounded-lg border border-border">
                    <div className="flex flex-col gap-1.5 p-2">
                      {col.list.length === 0 ? (
                        <div className="px-3 py-10 text-center text-sm text-muted-foreground">
                          {t("ind.noResults")}
                        </div>
                      ) : (
                        col.list.map((i) => (
                          <CatalogItem
                            key={i.name}
                            name={i.name}
                            isActive={i.isActive}
                            onToggle={() => col.toggle(i.name)}
                          />
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </section>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="active" className="mt-0 flex min-h-0 flex-1 flex-col px-5 py-4">
            <ScrollArea className="min-h-0 flex-1 rounded-lg border border-border">
              <div className="p-2">
                {activeCount === 0 ? (
                  <div className="px-3 py-16 text-center text-sm text-muted-foreground">
                    {t("ind.noActive")}
                  </div>
                ) : (
                  <>
                    {activeMain.length > 0 && (
                      <section className="mb-2">
                        <SectionHeading count={activeMain.length}>{t("ind.onChart")}</SectionHeading>
                        <div className="flex flex-col gap-1.5">
                          {activeMain.map((name) => {
                            const visible = ind.isIndicatorVisible(name, true);
                            const onOwnAxis = !!ind.getIndicatorAxis(name, true);
                            return (
                              <div
                                key={`m-${name}`}
                                className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-accent/50"
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="truncate text-sm font-medium">{name}</span>
                                    {!visible && (
                                      <Badge variant="outline" className="h-5 shrink-0 px-1.5 text-[10px] font-normal">
                                        {t("ind.hide")}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <ActionBar>
                                  <IndicatorParamsPopover
                                    name={name}
                                    paneId="candle_pane"
                                    onApply={(paneId, values) =>
                                      ind.updateIndicatorParams(name, paneId, values)
                                    }
                                  />
                                  <Tooltip content={t("ind.ownAxis")}>
                                    <Button
                                      variant={onOwnAxis ? "secondary" : "ghost"}
                                      size="icon-sm"
                                      onClick={() =>
                                        ind.bindIndicatorToNewAxis(
                                          name,
                                          true,
                                          onOwnAxis ? undefined : { id: `axis_${name}`, position: "right" },
                                        )
                                      }
                                    >
                                      <Rows2 className="size-3.5" />
                                    </Button>
                                  </Tooltip>
                                  <Tooltip content={visible ? t("ind.hide") : t("ind.show")}>
                                    <Button
                                      variant="ghost"
                                      size="icon-sm"
                                      onClick={() => toggleVisible(name, true)}
                                    >
                                      {visible ? (
                                        <Eye className="size-3.5" />
                                      ) : (
                                        <EyeOff className="size-3.5" />
                                      )}
                                    </Button>
                                  </Tooltip>
                                  <Tooltip content={t("ind.remove")}>
                                    <Button
                                      variant="ghost"
                                      size="icon-sm"
                                      onClick={() => ind.removeMainIndicator(name)}
                                    >
                                      <X className="size-3.5" />
                                    </Button>
                                  </Tooltip>
                                </ActionBar>
                              </div>
                            );
                          })}
                        </div>
                      </section>
                    )}

                    {activeMain.length > 0 && Object.keys(activeSub).length > 0 && (
                      <Separator className="my-3" />
                    )}

                    {Object.keys(activeSub).length > 0 && (
                      <section>
                        <SectionHeading count={Object.keys(activeSub).length}>
                          {t("ind.inPanes")}
                        </SectionHeading>
                        <div className="flex flex-col gap-1.5">
                          {Object.entries(activeSub).map(([name, paneId]) => {
                            const collapsed = ind.isSubIndicatorCollapsed(name);
                            return (
                              <div
                                key={`s-${name}`}
                                className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-accent/50"
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="truncate text-sm font-medium">{name}</span>
                                    <Badge
                                      variant="outline"
                                      className="h-5 shrink-0 px-1.5 text-[10px] font-normal"
                                    >
                                      {t("ind.pane")}
                                    </Badge>
                                  </div>
                                </div>
                                <ActionBar>
                                  <IndicatorParamsPopover
                                    name={name}
                                    paneId={paneId}
                                    onApply={(pid, values) =>
                                      ind.updateIndicatorParams(name, pid, values)
                                    }
                                  />
                                  <Tooltip content={t("ind.up")}>
                                    <Button
                                      variant="ghost"
                                      size="icon-sm"
                                      onClick={() => ind.reorderSubIndicator(name, "up")}
                                    >
                                      <ChevronUp className="size-3.5" />
                                    </Button>
                                  </Tooltip>
                                  <Tooltip content={t("ind.down")}>
                                    <Button
                                      variant="ghost"
                                      size="icon-sm"
                                      onClick={() => ind.reorderSubIndicator(name, "down")}
                                    >
                                      <ChevronDown className="size-3.5" />
                                    </Button>
                                  </Tooltip>
                                  <Tooltip content={collapsed ? t("ind.expand") : t("ind.collapse")}>
                                    <Button
                                      variant="ghost"
                                      size="icon-sm"
                                      onClick={() =>
                                        collapsed
                                          ? ind.expandSubIndicator(name)
                                          : ind.collapseSubIndicator(name)
                                      }
                                    >
                                      {collapsed ? (
                                        <Maximize2 className="size-3.5" />
                                      ) : (
                                        <Minimize2 className="size-3.5" />
                                      )}
                                    </Button>
                                  </Tooltip>
                                  <Tooltip content={t("ind.remove")}>
                                    <Button
                                      variant="ghost"
                                      size="icon-sm"
                                      onClick={() => ind.removeSubIndicator(name)}
                                    >
                                      <X className="size-3.5" />
                                    </Button>
                                  </Tooltip>
                                </ActionBar>
                              </div>
                            );
                          })}
                        </div>
                      </section>
                    )}
                  </>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
