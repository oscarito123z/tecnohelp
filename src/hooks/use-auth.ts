import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isTecnico, setIsTecnico] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      const currentUser = data.session?.user ?? null;
      
      if (cancelled) return;
      
      setSession(data.session);
      setUser(currentUser);

      if (!currentUser) {
        setIsAdmin(false);
        setIsTecnico(false);
        setLoading(false);
        return;
      }

      // La clave: Esperar a tener el rol antes de quitar el "loading"
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", currentUser.id);
        
      if (cancelled) return;

      const roles = (roleData ?? []).map((r: any) => r.role);
      setIsAdmin(roles.includes("admin"));
      setIsTecnico(roles.includes("tecnico"));
      setLoading(false);
    };

    checkAuth();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      checkAuth();
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { session, user, isAdmin, isTecnico, isStaff: isAdmin || isTecnico, loading };
}