import { callGraphCMS } from '../lib/graphcms'
import narrowType from '../lib/narrow-type'
import SiteSettings from '../lib/settings'

export type iIndexPostsData = {
  data: {
    posts: iPost[]
    postsConnection: {
      aggregate: {
        count: number
      }
    }
  }
}

export type iPost = {
  author: iAuthor
  excerpt: string
  slug: string
  title: string
  coverImage: iPicture
  content: {
    html: string
  }
}

export type iPostExcerpt = {
  author: iAuthor
  excerpt: string
  slug: string
  title: string
  coverImage: iPicture
}

export type iAuthor = {
  name: string
  twitterHandle: string
  picture: iPicture
}

export type iPicture = {
  url: string
  height: number
  width: number
}

export type iPostsTotal = {
  data: {
    postsConnection: {
      aggregate: {
        count: number
      }
    }
  }
}

export const getIndexPosts = async (
  pageNo = 1,
  postsPerPage = 1
): Promise<iIndexPostsData> => {
  /** GraphQL query to be executed */
  const query = `
    query IndexPostsQuery {
      posts(
        first: ${postsPerPage}, 
        stage: PUBLISHED, 
        skip: ${(pageNo - 1) * postsPerPage},
        orderBy: date_DESC
      ) {
        author {
          name
          twitterHandle
          picture {
            url(transformation: {
              image: {
                resize: {
                  height: 100, width: 100}
                }
              }
            )
            height
            width
          }
        }
        excerpt
        slug
        title
        content {
          html
        }
        coverImage {
          url
          height
          width
        }
      }
      postsConnection(stage: PUBLISHED) {
        aggregate {
          count
        }
      }
    }
  `

  const response = await callGraphCMS(query)
  /** Return response or throw error if response is undefined OR null */
  if (narrowType<iIndexPostsData>(response)) return response
  throw new Error('No response from CMS for IndexPostsData')
}

export const getTotalPostsNumber = async (): Promise<number> => {
  /** GraphQL query to be executed */
  const query = `
    query PostsTotalQuery {
      postsConnection(stage: PUBLISHED) {
        aggregate {
          count
        }
      }
    }
  `

  /** GraphQL JSON response */
  const response = await callGraphCMS(query)
  /** Return total or throw error if response is undefined OR null */
  if (narrowType<iPostsTotal>(response)) {
    return response.data.postsConnection.aggregate.count
  }
  throw new Error('No response from CMS for getTotalPostsNumber')
}

/**
 * Calculates the number of index pages by dividing the total number of posts by the number of
 * posts per page as set in the site settings, and rounding up to the next integer
 */
export const calculateTotalIndexPages = async () =>
  Math.ceil((await getTotalPostsNumber()) / SiteSettings.POSTS_PER_PAGE)
