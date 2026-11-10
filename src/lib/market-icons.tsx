import { useState } from "react";
import { FlaskConical, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

const QUOTE_SUFFIXES = [
  "USDT",
  "USDC",
  "FDUSD",
  "BUSD",
  "TUSD",
  "DAI",
  "USD",
  "EUR",
  "GBP",
  "TRY",
  "BRL",
  "JPY",
  "KRW",
  "AUD",
  "BTC",
  "ETH",
  "BNB",
] as const;

/** Extract base asset from tickers like BTCUSDT, BTC-USDT, BTC_USDT, SIM:TREND. */
export function baseAssetFromTicker(ticker: string): string {
  if (ticker.startsWith("SIM:")) return "SIM";
  const normalized = ticker.replace(/[-_/]/g, "").toUpperCase();
  const quotes = [...QUOTE_SUFFIXES].sort((a, b) => b.length - a.length);
  for (const quote of quotes) {
    if (normalized.endsWith(quote) && normalized.length > quote.length) {
      return normalized.slice(0, -quote.length);
    }
  }
  return normalized;
}

const COIN_ICON_ALIASES: Record<string, string> = {
  SIM: "generic",
};

const GENERIC_COIN_ICON =
  "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@0.18.1/svg/color/generic.svg";

/** Ordered fallbacks: curated SVG set → CoinCap PNG → generic coin glyph. */
function coinIconUrls(base: string): string[] {
  const key = (COIN_ICON_ALIASES[base] ?? base).toLowerCase();
  if (key === "generic") return [GENERIC_COIN_ICON];
  return [
    `https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@0.18.1/svg/color/${key}.svg`,
    `https://assets.coincap.io/assets/icons/${key}@2x.png`,
    GENERIC_COIN_ICON,
  ];
}

const EXCHANGE_BRANDS: Record<
  string,
  { slug: string; color?: string; label?: string }
> = {
  binance: { slug: "binance", color: "F0B90B" },
  bybit: { slug: "bybit", color: "F7A600" },
  okx: { slug: "okx", color: "FFFFFF" },
  bitget: { slug: "bitget", color: "00F0FF" },
};

/** Bundled exchange logos (Simple Icons has no Bybit/Bitget entries). */
const basePrefix = import.meta.env.BASE_URL || "/";
const LOCAL_EXCHANGE_ICONS: Record<string, string> = {
  bybit: `${basePrefix}icons/exchanges/bybit.svg`.replace(/([^:]\/)\/+/g, "$1"),
  bitget: `${basePrefix}icons/exchanges/bitget.svg`.replace(/([^:]\/)\/+/g, "$1"),
};

function exchangeIconUrl(sourceId: string): string | null {
  const local = LOCAL_EXCHANGE_ICONS[sourceId];
  if (local) return local;

  const brand = EXCHANGE_BRANDS[sourceId];
  if (!brand) return null;
  return brand.color
    ? `https://cdn.simpleicons.org/${brand.slug}/${brand.color}`
    : `https://cdn.simpleicons.org/${brand.slug}`;
}

function IconFallback({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-muted font-semibold uppercase text-muted-foreground",
        className,
      )}
      aria-hidden
    >
      {label.slice(0, 2)}
    </span>
  );
}

function RemoteIcon({
  src,
  fallback,
  className,
  imgClassName,
}: {
  src: string | null;
  fallback: string;
  className?: string;
  imgClassName?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <IconFallback label={fallback} className={className} />;
  }

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted/40",
        className,
      )}
    >
      <img
        src={src}
        alt=""
        className={cn("size-full object-contain", imgClassName)}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
      />
    </span>
  );
}

function CoinIconImage({
  urls,
  fallback,
  className,
}: {
  urls: string[];
  fallback: string;
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  const src = urls[index] ?? null;
  const exhausted = index >= urls.length;

  if (exhausted || !src) {
    return <IconFallback label={fallback} className={className} />;
  }

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted/40",
        className,
      )}
    >
      <img
        src={src}
        alt=""
        className="size-full object-contain"
        loading="lazy"
        decoding="async"
        onError={() => setIndex((i) => i + 1)}
      />
    </span>
  );
}

export function CoinIcon({
  ticker,
  className,
}: {
  ticker: string;
  className?: string;
}) {
  const base = baseAssetFromTicker(ticker);
  if (base === "SIM") {
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary",
          className,
        )}
        aria-hidden
      >
        <FlaskConical className="size-[55%]" />
      </span>
    );
  }

  return (
    <CoinIconImage
      urls={coinIconUrls(base)}
      fallback={base}
      className={className}
    />
  );
}

export function ExchangeIcon({
  sourceId,
  className,
}: {
  sourceId?: string | null;
  className?: string;
}) {
  const id = sourceId?.toLowerCase() ?? "";
  if (id === "synthetic") {
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-full bg-violet-500/15 text-violet-500",
          className,
        )}
        aria-hidden
      >
        <FlaskConical className="size-[55%]" />
      </span>
    );
  }

  const brand = EXCHANGE_BRANDS[id];
  if (id === "okx") {
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-black",
          className,
        )}
        aria-hidden
      >
        <img
          src="https://cdn.simpleicons.org/okx/FFFFFF"
          alt=""
          className="size-[70%] object-contain"
          loading="lazy"
          decoding="async"
        />
      </span>
    );
  }

  if (id === "bybit") {
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#17181E]",
          className,
        )}
        aria-hidden
      >
        <img
          src={LOCAL_EXCHANGE_ICONS.bybit}
          alt=""
          className="size-[72%] object-contain"
          loading="lazy"
          decoding="async"
        />
      </span>
    );
  }

  return (
    <RemoteIcon
      src={exchangeIconUrl(id)}
      fallback={brand?.slug ?? id.slice(0, 2).toUpperCase()}
      className={className}
    />
  );
}

export function AllSourcesIcon({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground",
        className,
      )}
      aria-hidden
    >
      <Globe className="size-[55%]" />
    </span>
  );
}

export function ExchangeBadge({
  sourceId,
  label,
  className,
}: {
  sourceId?: string | null;
  label: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground",
        className,
      )}
    >
      <ExchangeIcon sourceId={sourceId} className="size-3.5" />
      <span className="max-w-20 truncate">{label}</span>
    </span>
  );
}
