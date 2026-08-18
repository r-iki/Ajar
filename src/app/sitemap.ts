import { MetadataRoute } from 'next'
import { db } from '@/lib/db'
import { courses } from '@/lib/db/schema'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  // Fetch all published courses
  const allCourses = await db.query.courses.findMany({
    where: (c, { eq }) => eq(c.status, 'published'),
    columns: {
      slug: true,
      createdAt: true,
    }
  })

  const courseEntries: MetadataRoute.Sitemap = allCourses.flatMap((course) => [
    {
      url: `${baseUrl}/id/courses/${course.slug}`,
      lastModified: course.createdAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/en/courses/${course.slug}`,
      lastModified: course.createdAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }
  ])

  return [
    {
      url: `${baseUrl}/id`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/en`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/id/courses`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/en/courses`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...courseEntries,
  ]
}
