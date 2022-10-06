import { useMemo } from 'react'

import { generateIdenticon, md5 } from '@oxide/identicon'

type IdenticonProps = {
  /** string used to generate the graphic */
  name: string
  className?: string
}

export function Identicon({ name, className }: IdenticonProps) {
  const content = useMemo(() => generateIdenticon(md5(name)), [name])
  return <div className={className} dangerouslySetInnerHTML={{ __html: content }} />
}
