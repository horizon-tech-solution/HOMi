// src/hooks/useFavorites.jsx
import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { fetchFavorites, addFavorite, removeFavorite } from '../api/users/favorites';
import { useUserAuth } from '../context/UserAuthContext';

const FavoritesContext = createContext(null);

export const FavoritesProvider = ({ children }) => {
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [loading,     setLoading]     = useState(false);
  const { user } = useUserAuth();

  // Re-fetch whenever user logs in or out
  useEffect(() => {
    if (!user) {
      setFavoriteIds(new Set()); // clear hearts on logout
      return;
    }
    fetchFavorites()
      .then(({ data }) => {
        const ids = (data || []).map(l => Number(l.id));
        setFavoriteIds(new Set(ids));
      })
      .catch(() => {});
  }, [user]);

  const toggle = useCallback(async (listingId) => {
    const id = Number(listingId);

    if (!user) return 'unauthenticated';

    const alreadyFavorited = favoriteIds.has(id);

    // Optimistic update
    setFavoriteIds(prev => {
      const next = new Set(prev);
      if (alreadyFavorited) next.delete(id);
      else next.add(id);
      return next;
    });

    try {
      setLoading(true);
      if (alreadyFavorited) await removeFavorite(id);
      else await addFavorite(id);
      return !alreadyFavorited;
    } catch (err) {
      // Rollback on error
      setFavoriteIds(prev => {
        const next = new Set(prev);
        if (alreadyFavorited) next.add(id);
        else next.delete(id);
        return next;
      });
      console.error('Favorite toggle failed:', err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [favoriteIds, user]);

  const isFavorited = useCallback(
    (listingId) => favoriteIds.has(Number(listingId)),
    [favoriteIds]
  );

  return (
    <FavoritesContext.Provider value={{ favoriteIds, isFavorited, toggle, loading }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used inside <FavoritesProvider>');
  return ctx;
};