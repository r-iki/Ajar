import { notFound } from "next/navigation";
import { getUserByUsername } from "@/actions/user";
import ProfileLayout from "@/components/user/ProfileLayout";
import { Metadata } from "next";

interface ProfilePageProps {
  params: Promise<{
    locale: string;
    username: string;
  }>;
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  const user = await getUserByUsername(username);

  if (!user) {
    return {
      title: "User Not Found",
    };
  }

  return {
    title: `${user.name} (@${user.username}) | Profile`,
    description: user.bio || `Profile of ${user.name} on Ajar Platform.`,
    openGraph: {
      title: `${user.name} | Ajar Profile`,
      description: user.bio || `Check out ${user.name}'s profile and certificates on Ajar.`,
      images: user.image ? [user.image] : [],
    },
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;

  const user = await getUserByUsername(username);

  if (!user) {
    notFound();
  }

  return <ProfileLayout user={user} />;
}
