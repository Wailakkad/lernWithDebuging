import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export const useProtectedRoute = () => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/pages/authPages/LoginPage"); // Redirect to login if not authenticated
    }
  }, [isAuthenticated, router]);
};