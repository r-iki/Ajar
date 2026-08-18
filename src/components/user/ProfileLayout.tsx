import React from "react";
import ProfileSidebar from "./ProfileSidebar";
import ProfileMain from "./ProfileMain";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

interface ProfileLayoutProps {
  user: any; // User object with nested certificates and enrollments
}

const ProfileLayout: React.FC<ProfileLayoutProps> = ({ user }) => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <Navbar />

      <main className="container mx-auto px-4 py-12 relative z-10 flex-1 max-w-6xl">
        <div className="flex flex-col md:flex-row gap-10">
          {/* Sidebar */}
          <ProfileSidebar user={user} />

          {/* Main Content */}
          <ProfileMain user={user} />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProfileLayout;
