"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getCommerceFeatureSettings } from "@/lib/actions/site-settings";

type CommerceFeaturesContextValue = {
  commerceFeaturesEnabled: boolean;
  comingSoonMessage: string | null;
  isLoading: boolean;
};

const CommerceFeaturesContext = createContext<CommerceFeaturesContextValue>({
  commerceFeaturesEnabled: true,
  comingSoonMessage: null,
  isLoading: true,
});

export function CommerceFeaturesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [commerceFeaturesEnabled, setCommerceFeaturesEnabled] = useState(true);
  const [comingSoonMessage, setComingSoonMessage] = useState<string | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCommerceFeatureSettings() {
      try {
        const settings = await getCommerceFeatureSettings();
        setCommerceFeaturesEnabled(settings.enabled);
        setComingSoonMessage(settings.message);
      } catch {
        setCommerceFeaturesEnabled(true);
        setComingSoonMessage(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCommerceFeatureSettings();
  }, []);

  const value = useMemo(
    () => ({
      commerceFeaturesEnabled,
      comingSoonMessage,
      isLoading,
    }),
    [commerceFeaturesEnabled, comingSoonMessage, isLoading],
  );

  return (
    <CommerceFeaturesContext.Provider value={value}>
      {children}
    </CommerceFeaturesContext.Provider>
  );
}

export function useCommerceFeatures() {
  return useContext(CommerceFeaturesContext);
}
