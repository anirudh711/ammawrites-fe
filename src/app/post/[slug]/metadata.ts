// app/post/[slug]/metadata.ts
import { Metadata } from 'next'
import { client } from '@/lib/sanity'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const query = `*[_type == "post" && slug.current == $slug][0]{
    title,
    slug,
    coverImage,
    body,
    publishedAt
  }`

  const post = await client.fetch(query, { slug: params.slug })

  if (!post) return {}

  const imageUrl = post.coverImage?.asset?._ref
    ? `https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${post.coverImage.asset._ref.split('-').slice(1).join('.')}`
    : undefined

  const description = post.body?.find((b: any) => b._type === 'block')?.children?.map((c: any) => c.text).join(' ').slice(0, 150)

  return {
    title: post.title,
    description: description,
    openGraph: {
      title: post.title,
      description: description,
      type: 'article',
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/post/${post.slug.current}`,
      images: imageUrl ? [{ url: imageUrl, alt: post.title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  }
}
