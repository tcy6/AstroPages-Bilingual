import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { getPath } from "@/utils/getPath";
import getSortedPosts from "@/utils/getSortedPosts";
import { SITE } from "@/config";

export async function getStaticPaths() {
  const posts = await getCollection("blog");
  
  // Get all unique languages from post IDs
  // Assuming post ID format is "lang/slug"
  const languages = [...new Set(posts.map(post => post.id.split('/')[0]))];
  
  return languages.map(lang => ({
    params: { lang },
  }));
}

export async function GET({ params }: { params: { lang: string } }) {
  const { lang } = params;
  const posts = await getCollection("blog");
  
  // Filter posts by language
  const filteredPosts = posts.filter(post => post.id.startsWith(`${lang}/`));
  const sortedPosts = getSortedPosts(filteredPosts);

  // Chinese uses root, English uses /en/ prefix
  const siteUrl = lang === 'zh' ? SITE.website : `${SITE.website}/${lang}`;

  return rss({
    title: `${SITE.title} - ${lang.toUpperCase()}`,
    description: SITE.desc,
    site: siteUrl,
    items: sortedPosts.map(({ data, id, filePath }) => ({
      link: getPath(id, filePath),
      title: data.title,
      description: data.description,
      pubDate: new Date(data.modDatetime ?? data.pubDatetime),
    })),
  });
}
