import type { ReactElement } from 'react'
import type { iPostExcerpt } from '../../models/blog'

import PostTitle from './PostTitle'
import PostImage from './PostImage'
import ByLine from './ByLine'

interface PostExcerpt {
  (props: { post: iPostExcerpt }): ReactElement<any, any>
}

const PostExcerpt: PostExcerpt = ({
  post: { slug, title, excerpt, author, coverImage },
}) => (
  <article className="my-16">
    <PostTitle slug={slug} title={title} />
    <PostImage slug={slug} coverImage={coverImage} />
    <p className="mt-4 text-base md:text-xl">{excerpt}</p>
    <ByLine author={author} />
  </article>
)

export default PostExcerpt
