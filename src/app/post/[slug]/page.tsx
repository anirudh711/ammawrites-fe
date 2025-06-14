// app/post/[slug]/page.tsx
'use client'
import { client } from '@/lib/sanity'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'
import Link from 'next/link'
import { Share2, Eye, Heart } from 'lucide-react'
import { PortableText } from '@portabletext/react'


const components = {
  types: {
    spacer: ({ value }) => (
      <div style={{ height: `${value.height || 32}px` }} />
    )
  }
}

const categoryLabels: Record<string, string> = {
  all: "அனைத்தும்",
  poem: "கவிதை",
  shortStory: "குறுநாவல்",
  longStory: "நீண்ட கதை"
}

const builder = imageUrlBuilder(client)
const urlFor = (source: any) => builder.image(source)

export default function PostPage() {
  const { slug } = useParams()
  const [post, setPost] = useState<any | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const query = `*[_type == "post" && slug.current == $slug][0] {
          _id,
          title,
          publishedAt,
          category,
          coverImage,
          body,
          artistCredit
        }`
        const data = await client.fetch(query, { slug })
        setPost(data)
      } catch (err) {
        setError(true)
      }
    }
    if (slug) fetchPost()
  }, [slug])

  if (error) return <div className="p-4">Something went wrong. Please try again later.</div>
  if (!post) return <div className="p-4">Loading...</div>

  return (
    <main className="w-full min-h-screen h-full flex justify-center text-center mx-auto px-6 py-10 bg-[#fff4eb] text-[#2e2a29]" style={{ fontFamily: 'Noto Serif Tamil, serif' }}>
      <div className='absolute top-10 left-10 h-fit'>
        <Link href="/" className="text-[#8a3b12] hover:underline text-sm">← முகப்பு</Link>
      </div>
      <article >

        <div className="mt-10">
          <h1 className="text-3xl font-bold text-[#3b1f2b] mb-2">{post.title} <button
            className=" text-[#8a3b12] hover:text-[#5b0a1b]"
            onClick={() => navigator.share?.({
              title: post.title,
              url: typeof window !== 'undefined' ? window.location.href : ''
            })}
          >
            <Share2 size={20} />
          </button></h1>

          <div className="text-[#9f7064] text-xs mb-4">
            {new Date(post.publishedAt).toLocaleDateString()} • {categoryLabels[post.category]}
            {post.artistCredit && ` • படக்கலைஞர்: ${post.artistCredit}`}
          </div>
        </div>

        {post.coverImage && (
          <div className="flex justify-center">
            <img
              src={urlFor(post.coverImage).width(400).url()}
              alt="cover"
              className="rounded-md object-cover mb-6"
            />
          </div>
        )}

        {/*  body */}

        <div className="prose prose-sm prose-stone max-w-none">
          {/* {post.body.map((block: any, index: number) => {
            if (block._type === 'block') {
              return <p key={index}>{block.children.map((c: any) => c.text).join(' ')}</p>
            } else if (block._type === 'image') {
              return (
                <figure key={index} className="my-6">
                  <img src={urlFor(block).width(700).url()} alt={block.alt || ''} className="rounded" />
                  {block.caption && <figcaption className="text-xs text-center mt-2">{block.caption}</figcaption>}
                </figure>
              )
            }
            return null
          })} */}
          <PortableText value={post.body} components={components} />
          <div className="mt-6 flex gap-6 text-sm text-[#8a3b12] justify-center border-t border-[#e6d3c6] pt-4">
            <div className="flex items-center gap-1">
              <Eye size={16} /> <span>{post.viewCount ?? 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart size={16} /> <span>{post.likeCount ?? 0}</span>
            </div>
            <button
              className="flex items-center gap-1 hover:underline"
              onClick={() => navigator.share?.({
                title: post.title,
                url: typeof window !== 'undefined' ? window.location.href : ''
              })}
            >
              <Share2 size={16} /> <span>பகிர்</span>
            </button>
          </div>

          {/* <div className="mt-12 flex justify-between text-sm text-[#8a3b12]">
        {post.prev ? (
          <Link href={`/post/${post.prev.slug}`} className="hover:underline">← முந்தைய பதிவு: {post.prev.title}</Link>
        ) : <span></span>}
        {post.next ? (
          <Link href={`/post/${post.next.slug}`} className="hover:underline">அடுத்த பதிவு: {post.next.title} →</Link>
        ) : <span></span>}
      </div> */}
        </div>
      </article>
    </main>
  )
}
