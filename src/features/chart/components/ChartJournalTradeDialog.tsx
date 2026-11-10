import { useEffect, useState } from "react";
import { useChartT } from "@/features/chart/hooks/use-chart-t";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPrice } from "@/lib/utils";

export type ChartJournalTradeDraft = {
  symbol: string;
  type: "buy" | "sell";
  volume: number;
  entryPrice: number;
  stopLoss?: number;
  takeProfit?: number;
  accountId?: string;
};

export interface ChartAccountOption {
  id: string;
  name: string;
}

export interface ChartJournalTradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draft: ChartJournalTradeDraft | null;
  accounts?: ChartAccountOption[];
  onSubmitTrade?: (draft: ChartJournalTradeDraft) => Promise<void> | void;
}

const DEFAULT_ACCOUNTS: ChartAccountOption[] = [
  { id: "demo-account", name: "Demo Account (Paper)" },
];

export function ChartJournalTradeDialog({
  open,
  onOpenChange,
  draft,
  accounts = DEFAULT_ACCOUNTS,
  onSubmitTrade,
}: ChartJournalTradeDialogProps) {
  const { t } = useChartT();
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "demo-account");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && accounts[0]?.id && !accountId) {
      setAccountId(accounts[0].id);
    }
  }, [open, accounts, accountId]);

  const handleSave = async () => {
    if (!draft) return;
    setSubmitting(true);
    try {
      const payload: ChartJournalTradeDraft = {
        ...draft,
        accountId,
      };
      if (onSubmitTrade) {
        await onSubmitTrade(payload);
      } else {
        // Fallback demo behavior
        console.log("Journal Trade Submitted:", payload);
      }
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("trade.journalTitle") || "Journal Trade"}</DialogTitle>
          <DialogDescription>
            {t("trade.journalDesc") || "Review and record this trade."}
          </DialogDescription>
        </DialogHeader>

        {draft && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-2 rounded-md bg-muted/40 p-3">
              <span className="text-muted-foreground">{t("trade.symbol") || "Symbol"}</span>
              <span className="font-medium">{draft.symbol}</span>
              <span className="text-muted-foreground">{t("trade.side") || "Side"}</span>
              <span className="font-medium uppercase">{draft.type}</span>
              <span className="text-muted-foreground">{t("trade.entry") || "Entry"}</span>
              <span className="font-mono tabular-nums">{formatPrice(draft.entryPrice)}</span>
              {draft.stopLoss != null && (
                <>
                  <span className="text-muted-foreground">SL</span>
                  <span className="font-mono tabular-nums text-bear">
                    {formatPrice(draft.stopLoss)}
                  </span>
                </>
              )}
              {draft.takeProfit != null && (
                <>
                  <span className="text-muted-foreground">TP</span>
                  <span className="font-mono tabular-nums text-bull">
                    {formatPrice(draft.takeProfit)}
                  </span>
                </>
              )}
              <span className="text-muted-foreground">{t("trade.volume") || "Volume"}</span>
              <span className="font-mono tabular-nums">{draft.volume}</span>
            </div>

            {accounts.length > 0 && (
              <div className="space-y-1.5">
                <Label htmlFor="account">{t("trade.account") || "Account"}</Label>
                <Select value={accountId} onValueChange={setAccountId}>
                  <SelectTrigger id="account">
                    <SelectValue placeholder={t("trade.selectAccount") || "Select account"} />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((acc) => (
                      <SelectItem key={acc.id} value={acc.id}>
                        {acc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel") || "Cancel"}
          </Button>
          <Button
            onClick={handleSave}
            disabled={submitting}
          >
            {submitting ? (t("common.saving") || "Saving...") : (t("trade.recordTrade") || "Record Trade")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
