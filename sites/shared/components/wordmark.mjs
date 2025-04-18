import Link from 'next/link'

export const InnerWordMark = () => (
  <span style={{ letterSpacing: '-0.1rem' }}>
    <span className="text-yellow-300">Robert </span>
    <span className="text-red-500">George </span>
    <span className="text-blue-400">Patterns</span>
  </span>
)

export const WordMark = () => (
  <Link
    href="/"
    role="button"
    className="btn btn-ghost btn-sm normal-case text-2xl hover:bg-transparent font-bold px-0 -mt-1"
  >
    <InnerWordMark />
  </Link>
)
