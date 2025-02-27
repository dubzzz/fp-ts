import { Alt1 } from './Alt'
import { Applicative } from './Applicative'
import { ChainRec1 } from './ChainRec'
import { Comonad1 } from './Comonad'
import { Eq } from './Eq'
import { Foldable1 } from './Foldable'
import { identity as id } from './function'
import { HKT } from './HKT'
import { Monad1 } from './Monad'
import { Show } from './Show'
import { Traversable1 } from './Traversable'
import { pipeable } from './pipeable'

declare module './HKT' {
  interface URItoKind<A> {
    Identity: Identity<A>
  }
}

/**
 * @since 2.0.0
 */
export const URI = 'Identity'

/**
 * @since 2.0.0
 */
export type URI = typeof URI

/**
 * @since 2.0.0
 */
export type Identity<A> = A

/**
 * @since 2.0.0
 */
export const getShow: <A>(S: Show<A>) => Show<Identity<A>> = id

/**
 * @since 2.0.0
 */
export const getEq: <A>(E: Eq<A>) => Eq<Identity<A>> = id

/**
 * @since 2.0.0
 */
export const identity: Monad1<URI> & Foldable1<URI> & Traversable1<URI> & Alt1<URI> & Comonad1<URI> & ChainRec1<URI> = {
  URI,
  map: (ma, f) => f(ma),
  of: id,
  ap: (mab, ma) => mab(ma),
  chain: (ma, f) => f(ma),
  reduce: (fa, b, f) => f(b, fa),
  foldMap: _ => (fa, f) => f(fa),
  reduceRight: (fa, b, f) => f(fa, b),
  traverse: <F>(F: Applicative<F>) => <A, B>(ta: Identity<A>, f: (a: A) => HKT<F, B>): HKT<F, Identity<B>> => {
    return F.map(f(ta), id)
  },
  sequence: <F>(F: Applicative<F>) => <A>(ta: Identity<HKT<F, A>>): HKT<F, Identity<A>> => {
    return F.map(ta, id)
  },
  alt: id,
  extract: id,
  extend: (wa, f) => f(wa),
  chainRec: (a, f) => {
    let v = f(a)
    while (v._tag === 'Left') {
      v = f(v.left)
    }
    return v.right
  }
}

const {
  alt,
  ap,
  apFirst,
  apSecond,
  chain,
  chainFirst,
  duplicate,
  extend,
  flatten,
  foldMap,
  map,
  reduce,
  reduceRight
} = pipeable(identity)

export { alt, ap, apFirst, apSecond, chain, chainFirst, duplicate, extend, flatten, foldMap, map, reduce, reduceRight }
