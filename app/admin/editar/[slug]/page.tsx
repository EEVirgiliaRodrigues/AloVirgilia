import Editor from '../../Editor'

export default function EditarPage({ params }: { params: { slug: string } }) {
  return <Editor slug={params.slug} />
}
