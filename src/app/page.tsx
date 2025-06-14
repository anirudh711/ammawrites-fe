// app/page.tsx (or pages/index.tsx if using pages dir)
'use client'
import { client, urlFor } from '@/lib/sanity'
import Link from 'next/link'
import { useEffect, useState } from 'react'



const categoryLabels: Record<string, string> = {
  all: "அனைத்தும்",
  poem: "கவிதை",
  shortStory: "குறுநாவல்",
  longStory: "நீண்ட கதை"
}

const categories = Object.keys(categoryLabels)

const normalize = (str: string) => str.replace(/\s+/g, '').toLowerCase()

function getFirstTextFromBody(body: any[]): string {
  for (const block of body) {
    if (block._type === 'block' && block.children && block.children.length > 0) {
      const text = block.children.map((c: any) => c.text).join(' ');
      if (text.trim()) return text;
    }
  }
  return '';
}

export default function Home() {
  const [posts, setPosts] = useState<any[]>([])
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    const fetchPosts = async () => {
  try {
    const query = `*[_type == "post"] | order(publishedAt desc) {
      _id,
      title,
      slug,
      publishedAt,
      category,
      coverImage,
      body
    }`;
    const data = await client.fetch(query);
    setPosts(data);
  } catch (error) {
    console.error("Failed to fetch posts:", error);
  }
}
    fetchPosts()
  }, [])

  const filteredPosts = filter === "all" ? posts : posts.filter(p => normalize(p.category) === normalize(filter))
  const dailyPost = posts.length > 0 ? posts[0] : null

  return (
    <main className="w-full px-4 md:px-12 py-0 text-[#2e2a29] bg-[#fff9f4] min-h-screen" style={{ fontFamily: 'Noto Serif Tamil, serif' }}>
      {/* Nav Bar */}
      <nav className="w-full bg-[#fff4eb] border-b border-[#e8d5ca] py-4 mb-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[#3b1f2b]">அம்மாவின் எழுத்துக்கள்</h1>
            <p className="text-sm text-[#85586F]">கவிதைகள், குறுநாவல்கள் மற்றும் நீண்ட கதைகள்</p>
          </div>
          <div className="flex gap-4 text-sm text-[#85586F] mt-2 md:mt-0">
            <Link href="/about" className="hover:underline">About</Link>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:underline">Facebook</a>
            <Link href="/login" className="hover:underline">Login</Link>
          </div>
        </div>
      </nav>

      {dailyPost && (
        <section className="mb-14 p-6 bg-[#fff4eb] border border-[#eedfd4] rounded-md shadow-sm max-w-7xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4 text-[#8a3b12]">இன்றைய பகிர்வு</h2>
          <div className="flex flex-col md:flex-row gap-4">
            {dailyPost.coverImage && (
              <img
                src={urlFor(dailyPost.coverImage).width(300).height(200).url()}
                alt="cover"
                className="rounded-md object-cover max-w-[300px] w-full md:w-[300px] max-h-[200px]"
              />
            )}
            <div className="flex flex-col ">
              <div>
                <Link href={`/post/${dailyPost.slug.current}`}>
                  <h3 className="text-xl font-bold hover:underline text-[#5b0a1b] mb-1">{dailyPost.title}</h3>
                </Link>
                <div className="text-[#9f7064] text-xs mb-3">
                  {new Date(dailyPost.publishedAt).toLocaleDateString()} • {categoryLabels[dailyPost.category]}
                </div>
              </div>
              <p className="text-sm text-[#5f4b45]">
  {getFirstTextFromBody(dailyPost.body).slice(0, 300)}... <Link href={`/post/${dailyPost.slug.current}`} className="text-[#8a3b12] hover:underline">மேலும் படிக்க</Link>
</p>
            </div>
          </div>
        </section>
      )}

      <div className="mb-6 max-w-7xl mx-auto">
        <h2 className="text-xl font-semibold text-[#3b1f2b] mb-2">முந்தைய பகிர்வுகள்</h2>
        <div className="flex flex-wrap gap-2 text-sm">
          {categories.map((catKey) => (
            <button
              key={catKey}
              onClick={() => setFilter(catKey)}
              className={`px-3 py-1 rounded-md border transition ${
                filter === catKey ? 'bg-[#8a3b12] text-white border-[#8a3b12]' : 'bg-white text-[#8a3b12] border-[#e0c4b3] hover:bg-[#fceee7]'
              }`}
            >
              {categoryLabels[catKey]}
            </button>
          ))}
        </div>
      </div>

      <section className="space-y-10 max-w-7xl mx-auto">
        {(filter === "all" ? filteredPosts.slice(1) : filteredPosts).map((post) => (
          <article key={post._id} className="border-b border-[#e9d9d0] pb-6">
            <h3 className="text-xl font-semibold mb-1">
              <Link href={`/post/${post.slug.current}`} className="hover:underline text-[#6a2f45]">
                {post.title}
              </Link>
            </h3>
            <div className="text-[#9f7064] text-xs mb-2">
              {new Date(post.publishedAt).toLocaleDateString()} • {categoryLabels[post.category]}
            </div>
            <p className="text-sm text-[#5f4b45]">
  {getFirstTextFromBody(post.body).slice(0, 100)}... <Link href={`/post/${post.slug.current}`} className="text-[#8a3b12] hover:underline">மேலும் படிக்க</Link>
</p>
          </article>
        ))}
      </section>
    </main>
  )
}
