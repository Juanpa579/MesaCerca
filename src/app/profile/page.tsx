import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ProfilePage } from "@/features/profile/components/ProfilePage";

export default function ProfileRoute() {
  return (
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  );
}