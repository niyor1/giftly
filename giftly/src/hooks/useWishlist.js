import { useState, useCallback, useEffect } from "react";

// ─── Flat ID helpers (backward compat — Home page heart icons) ──────────

function loadFlatIds() {
  try {
    const raw = localStorage.getItem("giftly_wishlist_ids");
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function saveFlatIds(ids) {
  localStorage.setItem("giftly_wishlist_ids", JSON.stringify([...ids]));
}

// ─── Named list helpers ──────────────────────────────────────────────

function loadNamedLists() {
  try {
    const raw = localStorage.getItem("giftly_wishlists");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveNamedLists(wishlists) {
  localStorage.setItem("giftly_wishlists", JSON.stringify(wishlists));
}

// ─── Hook ─────────────────────────────────────────────────────────────

export default function useWishlists() {
  // Flat IDs (backward compat — Home page heart icons)
  const [ids, setIds] = useState(loadFlatIds);

  // Named wishlists
  const [wishlists, setWishlists] = useState(() => loadNamedLists());
  const [activeId, setActiveId] = useState(() => {
    const stored = loadNamedLists();
    return stored?.activeId || "default";
  });

  // Persist flat IDs to localStorage whenever they change
  useEffect(() => {
    saveFlatIds(ids);
  }, [ids]);

  // Persist named wishlists to localStorage whenever they change
  useEffect(() => {
    if (wishlists) {
      saveNamedLists(wishlists);
    }
  }, [wishlists]);

  // toggle: add/remove gift ID from flat store (backward compat)
  const toggle = useCallback((giftId) => {
    setIds((prev) => {
      const next = new Set(prev);
      if (next.has(giftId)) {
        next.delete(giftId);
      } else {
        next.add(giftId);
      }
      return next;
    });
  }, []);

  // has: check flat IDs and named lists
  const has = useCallback(
    (giftId) => {
      if (ids.has(giftId)) return true;
      if (!wishlists?.lists) return false;
      return Object.values(wishlists.lists).some((list) =>
        list.items.some((i) => i.id === giftId)
      );
    },
    [ids, wishlists]
  );

  // clear: clear flat IDs only
  const clear = useCallback(() => {
    setIds(new Set());
  }, []);

  // ─── Named list CRUD ──────────────────────────────────────────────

  const createList = useCallback((name) => {
    const id = `list_${Date.now()}`;
    setWishlists((prev) => {
      if (!prev) return { activeId: id, lists: { [id]: { name, items: [] } } };
      return { ...prev, activeId: id, lists: { ...prev.lists, [id]: { name, items: [] } } };
    });
  }, []);

  const deleteList = useCallback((idToDelete) => {
    setWishlists((prev) => {
      if (!prev || Object.keys(prev.lists).length <= 1) return prev;
      const { [idToDelete]: _removed, ...rest } = prev.lists;
      const newActive = prev.activeId === idToDelete ? Object.keys(rest)[0] : prev.activeId;
      return { ...prev, lists: rest, activeId: newActive };
    });
  }, []);

  const addItem = useCallback(
    (gift) => {
      setWishlists((prev) => {
        if (!prev || !prev.lists[prev.activeId]) return prev;
        const list = prev.lists[prev.activeId];
        if (list.items.some((i) => i.id === gift.id)) return prev; // already saved
        return {
          ...prev,
          lists: { ...prev.lists, [prev.activeId]: { ...list, items: [...list.items, gift] } },
        };
      });
    },
    []
  );

  const removeItem = useCallback(
    (giftId) => {
      setWishlists((prev) => {
        if (!prev || !prev.lists[prev.activeId]) return prev;
        const list = prev.lists[prev.activeId];
        return {
          ...prev,
          lists: {
            ...prev.lists,
            [prev.activeId]: { ...list, items: list.items.filter((i) => i.id !== giftId) },
          },
        };
      });
    },
    []
  );

  const clearAllItems = useCallback(() => {
    setWishlists((prev) => {
      if (!prev || !prev.lists[prev.activeId]) return prev;
      const list = prev.lists[prev.activeId];
      return { ...prev, lists: { ...prev.lists, [prev.activeId]: { ...list, items: [] } } };
    });
  }, []);

  return {
    ids, wishlists, activeId, setActiveId,
    toggle, has, clear,
    createList, deleteList, addItem, removeItem, clearAllItems,
  };
}
