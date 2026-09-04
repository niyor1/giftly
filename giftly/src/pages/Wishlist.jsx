import { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Heart, Share2, Trash2, Plus, X, Search } from "lucide-react";
import Toast from "../components/Toast";
import StarRating from "../components/StarRating";
import { giftIdeas } from "../data/mockData";
import useWishlist from "../hooks/useWishlist";
import { parsePriceRange, loadNamedLists, saveNamedLists } from "../utils/helpers.js";

// Re-export for backwards compat with any inline usage
const loadWishlists = loadNamedLists;
const saveWishlists = saveNamedLists;

// ─── Empty state ────────────────────────────────────────────────────

function EmptyState({ onSearch }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] py-24 text-center">
      <div className="rounded-full bg-gold/10 p-6">
        <Heart size={48} className="text-gold/40" />
      </div>
      <h3 className="mt-6 text-xl font-bold text-white">Your wishlist is empty</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-white/40">
        Browse gift ideas and tap the heart icon on any card to save it here.
      </p>
      <button
        onClick={onSearch}
        className="mt-8 flex items-center gap-2 rounded-xl bg-gold px-8 py-3 text-base font-bold text-deep-purple shadow-lg shadow-gold/20 transition-all hover:bg-gold-hover hover:shadow-gold-hover/30"
      >
        <Search size={18} />
        Search for gifts
      </button>
    </div>
  );
}

// ─── Wishlist item card ─────────────────────────────────────────────

function WishlistItem({ gift, onRemove }) {
  const [imgError, setImgError] = useState(false);

  if (!gift) return null;

  const [min, max] = parsePriceRange(gift.priceRange);
  const priceLabel = min !== null && max !== null ? `£${min} – £${max}` : gift.priceRange || 'Price unavailable';

  // Use real thumbnail if available; fall back to imageUrl for mockData items
  const imageUrl = (gift.thumbnail || gift.imageUrl) && !imgError ? (gift.thumbnail || gift.imageUrl) : null;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition-all duration-300 hover:-translate-y-1 hover:border-gold/40 hover:bg-white/[0.06] hover:shadow-lg hover:shadow-gold/5">
      {/* Image */}
      <div className="relative aspect-[3/2] overflow-hidden bg-deep-purple-light/40">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={gift.title}
            loading="lazy"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-all duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-white/15">
            <span className="text-4xl">{gift.emoji || "🎁"}</span>
          </div>
        )}

        {/* Badge chip */}
        {gift.badge && (
          <span
            className={`absolute left-3 top-3 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${
              gift.badge === "Best Seller"
                ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                : gift.badge === "Top Rated"
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                  : gift.badge === "Editor's Pick"
                    ? "bg-violet-500/20 text-violet-400 border-violet-500/30"
                    : gift.badge === "Trending"
                      ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
                      : "bg-sky-500/20 text-sky-400 border-sky-500/30"
            }`}
          >
            {gift.badge}
          </span>
        )}

        {/* Remove button */}
        <button
          type="button"
          onClick={() => onRemove(gift.id)}
          className="absolute right-3 top-3 rounded-full bg-black/40 p-2 text-white/70 backdrop-blur-sm transition-all hover:bg-red-600/80 hover:text-white group-hover:bg-black/50"
          aria-label="Remove from wishlist"
          title="Remove"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-medium uppercase tracking-widest text-white/30">
          {gift.category}
        </p>
        <h3 className="mt-1.5 text-lg font-bold leading-snug text-white group-hover:text-gold transition-colors">
          {gift.title || 'Gift Idea'}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-white/50 leading-relaxed flex-1">
          {gift.description}
        </p>

        {/* Rating */}
        <div className="mt-4 flex items-center gap-2">
          <StarRating rating={gift.rating} />
          <span className="text-sm font-semibold text-white/80">{gift.rating}</span>
          <span className="text-xs text-white/30">
            ({(gift.reviewCount?.toLocaleString() ?? 'N/A')} reviews)
          </span>
        </div>

        {/* Price + CTA */}
        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
          <span className="text-sm font-bold text-gold">{priceLabel}</span>
          <a
            href={gift.productLink || gift.affiliateUrl || "#"}
            rel="noopener noreferrer"
            target="_blank"
            className="rounded-lg bg-gold/10 px-4 py-2 text-sm font-semibold text-gold transition-all hover:bg-gold hover:text-deep-purple"
          >
            View Gift
          </a>
        </div>
      </div>
    </article>
  );
}

// ─── Create / rename modal ──────────────────────────────────────────

function NameModal({ open, onClose, onSubmit, initialName = "", title }) {
  const [name, setName] = useState(initialName);

  // Reset local state when modal opens with a new name preset
  useEffect(() => {
    if (open) setName(initialName);
  }, [open, initialName]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed) {
      onSubmit(trimmed);
      setName("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-deep-purple-light p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-white/40 hover:text-white"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Dad's Birthday"
            autoFocus
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-gold/40 focus:outline-none"
          />
          <div className="mt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-white/10 px-4 py-2.5 text-sm font-medium text-white/60 transition-all hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="rounded-lg bg-gold px-6 py-2.5 text-sm font-bold text-deep-purple shadow-lg shadow-gold/20 transition-all hover:bg-gold-hover disabled:cursor-not-allowed disabled:opacity-40"
            >
              {initialName ? "Save" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Confirm dialog ─────────────────────────────────────────────────

function ConfirmDialog({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-deep-purple-light p-6 shadow-2xl text-center">
        <h2 className="text-lg font-bold text-white">{title}</h2>
        <p className="mt-3 text-sm text-white/50">{message}</p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-white/10 px-5 py-2.5 text-sm font-medium text-white/60 transition-all hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
            }}
            className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-600/20 transition-all hover:bg-red-700"
          >
            Clear all
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────

const DEFAULT_LIST_NAME = "My Wishlist";

export default function Wishlist() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const flatWishlist = useWishlist(); // IDs saved via heart icon on Home

  // Merge flat wishlist IDs into a default list if no named lists exist yet
  const initialWishlists = useMemo(() => {
    const stored = loadWishlists();
    if (stored && Object.keys(stored.lists).length > 0) return stored;

    // No named lists — seed from flat wishlist IDs
    if (flatWishlist.ids.size === 0) return null;
    const items = giftIdeas.filter((g) => flatWishlist.ids.has(g.id));
    return { activeId: "default", lists: { default: { name: DEFAULT_LIST_NAME, items } } };
  }, [flatWishlist.ids]);

  const [wishlists, setWishlists] = useState(() => initialWishlists);
  const [activeId, setActiveId] = useState(() => wishlists?.activeId || "default");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("success");

  // Load shared wishlist items from URL params on mount
  // Format: /wishlist?items=1,2,3 → adds those giftIdeas to active list
  useEffect(() => {
    const itemIds = searchParams.get("items");
    if (!itemIds) return;

    const ids = itemIds.split(",").map((s) => Number(s.trim())).filter((n) => !Number.isNaN(n));
    const gifts = ids.map((id) => giftIdeas.find((g) => g.id === id)).filter(Boolean);

    if (gifts.length === 0) return;

    setWishlists((prev) => {
      // Create default list if none exists
      if (!prev) {
        return { activeId: "default", lists: { default: { name: DEFAULT_LIST_NAME, items: gifts } } };
      }
      const list = prev.lists[prev.activeId];
      if (!list) return prev;
      // Merge: skip duplicates by gift id
      const existingIds = new Set(list.items.map((i) => i.id));
      const newItems = gifts.filter((g) => !existingIds.has(g.id));
      if (newItems.length === 0) return prev;
      return { ...prev, lists: { ...prev.lists, [prev.activeId]: { ...list, items: [...list.items, ...newItems] } } };
    });

    setToastMsg(`Added ${gifts.length} gift${gifts.length > 1 ? "s" : ""} from shared list!`);
    setToastType("success");

    // Clean URL — remove items param without triggering another effect run
    if (window.location.search.includes("items=")) {
      const url = new URL(window.location);
      url.searchParams.delete("items");
      navigate(url.pathname + (url.search ? `?${url.search}` : ""), { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist to localStorage whenever wishlists change
  const updateWishlists = useCallback((updater) => {
    setWishlists((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      saveWishlists(next);
      return next;
    });
  }, []);

  // Create a new wishlist
  const handleCreate = useCallback(
    (name) => {
      const id = `list_${Date.now()}`;
      updateWishlists((prev) => {
        if (!prev) {
          return { activeId: id, lists: { [id]: { name, items: [] } } };
        }
        return { ...prev, activeId: id, lists: { ...prev.lists, [id]: { name, items: [] } } };
      });
      setShowCreateModal(false);
      setToastMsg(`"${name}" created!`);
      setToastType("success");
    },
    [updateWishlists]
  );

  // Delete a wishlist (keep at least one)
  const handleDeleteList = useCallback(
    (idToDelete) => {
      updateWishlists((prev) => {
        if (!prev || Object.keys(prev.lists).length <= 1) return prev;
        const { [idToDelete]: _removed, ...rest } = prev.lists;
        const newActive = prev.activeId === idToDelete ? Object.keys(rest)[0] : prev.activeId;
        return { ...prev, lists: rest, activeId: newActive };
      });
      setToastMsg("Wishlist deleted");
      setToastType("info");
    },
    [updateWishlists]
  );

  // Remove item from current wishlist
  const handleRemoveItem = useCallback(
    (giftId) => {
      updateWishlists((prev) => {
        if (!prev) return prev;
        const list = prev.lists[prev.activeId];
        if (!list) return prev;
        return {
          ...prev,
          lists: {
            ...prev.lists,
            [prev.activeId]: { ...list, items: list.items.filter((i) => i.id !== giftId) },
          },
        };
      });
    },
    [updateWishlists]
  );

  // Clear all items from current wishlist
  const handleClearAll = useCallback(() => {
    updateWishlists((prev) => {
      if (!prev) return prev;
      const list = prev.lists[prev.activeId];
      if (!list) return prev;
      return { ...prev, lists: { ...prev.lists, [prev.activeId]: { ...list, items: [] } } };
    });
    setShowConfirmClear(false);
    setToastMsg("Wishlist cleared");
    setToastType("info");
  }, [updateWishlists]);

  // Navigate to search (home)
  const handleSearch = useCallback(() => {
    navigate("/");
  }, [navigate]);

  // Share wishlist — copy URL with item IDs encoded in params
  const handleShare = useCallback(async () => {
    const activeList = wishlists?.lists?.[activeId];
    if (!activeList || !activeList.items.length) return;

    const ids = activeList.items.map((i) => i.id).join(",");
    const url = `${window.location.origin}${window.location.pathname}?list=${encodeURIComponent(activeId)}&items=${encodeURIComponent(ids)}`;

    try {
      await navigator.clipboard.writeText(url);
      setToastMsg("Wishlist link copied!");
      setToastType("info");
    } catch {
      setToastMsg("Could not copy link.");
      setToastType("success");
    }
  }, [wishlists, activeId]);

  // Price range for current wishlist
  const priceRange = useMemo(() => {
    const activeList = wishlists?.lists?.[activeId];
    if (!activeList || !activeList.items.length) return null;

    let minTotal = Infinity;
    let maxTotal = -Infinity;
    let hasData = false;

    activeList.items.forEach((item) => {
      const [min, max] = parsePriceRange(item.priceRange);
      if (min !== null) {
        minTotal = Math.min(minTotal, min);
        hasData = true;
      }
      if (max !== null) {
        maxTotal = Math.max(maxTotal, max);
        hasData = true;
      }
    });

    return hasData ? { min: minTotal === Infinity ? null : minTotal, max: maxTotal === -Infinity ? null : maxTotal } : null;
  }, [wishlists, activeId]);

  const activeList = wishlists?.lists?.[activeId];
  const listCount = wishlists ? Object.keys(wishlists.lists).length : 0;

  // Show a message when user has flat wishlist items but no named lists yet
  const showFlatSuggestion = !wishlists && flatWishlist.ids.size > 0;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Your Wishlist
          </h1>
          {priceRange && (
            <p className="mt-2 text-sm text-white/40">
              Estimated total:{" "}
              <span className="font-semibold text-gold">
                £{priceRange.min} – £{priceRange.max}
              </span>{" "}
              · {activeList?.items.length || 0} item{activeList?.items.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        <div className="flex w-full sm:w-auto flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <button
            onClick={handleShare}
            disabled={!activeList || !activeList.items.length}
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-sm font-medium text-white/60 transition-all hover:border-gold/40 hover:text-gold disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Share2 size={16} />
            Share wishlist
          </button>
          {activeList && activeList.items.length > 0 && (
            <button
              onClick={() => setShowConfirmClear(true)}
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-sm font-medium text-white/60 transition-all hover:border-red-500/40 hover:text-red-400"
            >
              <Trash2 size={16} />
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Wishlist tabs */}
      {listCount > 0 && (
        <div className="mb-8 flex items-center gap-2 overflow-x-auto pb-2">
          {Object.entries(wishlists.lists).map(([id, list]) => (
            <div key={id} className="flex items-center gap-1">
              <button
                onClick={() => setActiveId(id)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all whitespace-nowrap ${
                  activeId === id
                    ? "bg-gold/20 text-gold"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                {list.name}
              </button>
              {listCount > 1 && (
                <button
                  onClick={() => handleDeleteList(id)}
                  className="rounded p-1 text-white/20 hover:text-red-400 transition-colors"
                  aria-label={`Delete ${list.name}`}
                  title={`Delete ${list.name}`}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 rounded-lg border border-dashed border-white/20 px-3 py-2 text-sm font-medium text-white/40 transition-all hover:border-gold/40 hover:text-gold"
          >
            <Plus size={16} />
            New list
          </button>
        </div>
      )}

      {/* Content */}
      {!activeList || !activeList.items.length ? (
        showFlatSuggestion ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-gold/20 bg-gold/[0.03] py-24 text-center">
            <div className="rounded-full bg-gold/10 p-6">
              <Heart size={48} className="text-gold/40" />
            </div>
            <h3 className="mt-6 text-xl font-bold text-white">
              You have {flatWishlist.ids.size} saved gift{flatWishlist.ids.size !== 1 ? "s" : ""}
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-white/40">
              Create a named wishlist to organize your saved gifts.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-8 flex items-center gap-2 rounded-xl bg-gold px-8 py-3 text-base font-bold text-deep-purple shadow-lg shadow-gold/20 transition-all hover:bg-gold-hover"
            >
              <Plus size={18} />
              Create your first wishlist
            </button>
          </div>
        ) : (
          <EmptyState onSearch={handleSearch} />
        )
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {activeList.items.map((gift) => (
            <WishlistItem key={gift.id} gift={gift} onRemove={handleRemoveItem} />
          ))}
        </div>
      )}

      {/* Create / rename modal */}
      <NameModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreate}
        title="Create new wishlist"
      />

      {/* Confirm clear dialog */}
      <ConfirmDialog
        open={showConfirmClear}
        title="Clear this wishlist?"
        message={`This will remove all ${activeList?.items.length || 0} items from "${activeList?.name}".`}
        onConfirm={handleClearAll}
        onCancel={() => setShowConfirmClear(false)}
      />

      {/* Toast */}
      <Toast message={toastMsg} type={toastType} onDismiss={() => setToastMsg("")} />
    </div>
  );
}
