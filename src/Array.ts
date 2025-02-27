/**
 * @file Adapted from https://github.com/purescript/purescript-arrays
 */
import { Alternative1 } from './Alternative'
import { Applicative } from './Applicative'
import { Compactable1, Separated } from './Compactable'
import { Either } from './Either'
import { Eq } from './Eq'
import { Extend1 } from './Extend'
import { FilterableWithIndex1 } from './FilterableWithIndex'
import { Foldable1 } from './Foldable'
import { FoldableWithIndex1 } from './FoldableWithIndex'
import { Predicate, Refinement } from './function'
import { FunctorWithIndex1 } from './FunctorWithIndex'
import { HKT } from './HKT'
import { Monad1 } from './Monad'
import { Monoid } from './Monoid'
import { NonEmptyArray } from './NonEmptyArray'
import { isSome, none, Option, some } from './Option'
import { fromCompare, getSemigroup, Ord, ordNumber } from './Ord'
import { pipeable } from './pipeable'
import { Show } from './Show'
import { TraversableWithIndex1 } from './TraversableWithIndex'
import { Unfoldable1 } from './Unfoldable'
import { Witherable1 } from './Witherable'

declare module './HKT' {
  interface URItoKind<A> {
    Array: Array<A>
  }
}

export const URI = 'Array'

export type URI = typeof URI

/**
 * @since 2.0.0
 */
export function getShow<A>(S: Show<A>): Show<Array<A>> {
  return {
    show: as => `[${as.map(S.show).join(', ')}]`
  }
}

const concat = <A>(x: Array<A>, y: Array<A>): Array<A> => {
  const lenx = x.length
  if (lenx === 0) {
    return y
  }
  const leny = y.length
  if (leny === 0) {
    return x
  }
  const r = Array(lenx + leny)
  for (let i = 0; i < lenx; i++) {
    r[i] = x[i]
  }
  for (let i = 0; i < leny; i++) {
    r[i + lenx] = y[i]
  }
  return r
}

/**
 * Returns a `Monoid` for `Array<A>`
 *
 * @example
 * import { getMonoid } from 'fp-ts/lib/Array'
 *
 * const M = getMonoid<number>()
 * assert.deepStrictEqual(M.concat([1, 2], [3, 4]), [1, 2, 3, 4])
 *
 * @since 2.0.0
 */
export function getMonoid<A = never>(): Monoid<Array<A>> {
  return {
    concat,
    empty
  }
}

/**
 * Derives an `Eq` over the `Array` of a given element type from the `Eq` of that type. The derived `Eq` defines two
 * arrays as equal if all elements of both arrays are compared equal pairwise with the given `E`. In case of arrays of
 * different lengths, the result is non equality.
 *
 * @example
 * import { eqString } from 'fp-ts/lib/Eq'
 * import { getEq } from 'fp-ts/lib/Array'
 *
 * const E = getEq(eqString)
 * assert.strictEqual(E.equals(['a', 'b'], ['a', 'b']), true)
 * assert.strictEqual(E.equals(['a'], []), false)
 *
 * @since 2.0.0
 */
export function getEq<A>(E: Eq<A>): Eq<Array<A>> {
  return {
    equals: (xs, ys) => xs === ys || (xs.length === ys.length && xs.every((x, i) => E.equals(x, ys[i])))
  }
}

/**
 * Derives an `Ord` over the `Array` of a given element type from the `Ord` of that type. The ordering between two such
 * arrays is equal to: the first non equal comparison of each arrays elements taken pairwise in increasing order, in
 * case of equality over all the pairwise elements; the longest array is considered the greatest, if both arrays have
 * the same length, the result is equality.
 *
 * @example
 * import { getOrd } from 'fp-ts/lib/Array'
 * import { ordString } from 'fp-ts/lib/Ord'
 *
 * const O = getOrd(ordString)
 * assert.strictEqual(O.compare(['b'], ['a']), 1)
 * assert.strictEqual(O.compare(['a'], ['a']), 0)
 * assert.strictEqual(O.compare(['a'], ['b']), -1)
 *
 *
 * @since 2.0.0
 */
export function getOrd<A>(O: Ord<A>): Ord<Array<A>> {
  return fromCompare((a, b) => {
    const aLen = a.length
    const bLen = b.length
    const len = Math.min(aLen, bLen)
    for (let i = 0; i < len; i++) {
      const ordering = O.compare(a[i], b[i])
      if (ordering !== 0) {
        return ordering
      }
    }
    return ordNumber.compare(aLen, bLen)
  })
}

/**
 * An empty array
 *
 * @since 2.0.0
 */
export const empty: Array<never> = []

/**
 * Return a list of length `n` with element `i` initialized with `f(i)`
 *
 * @example
 * import { makeBy } from 'fp-ts/lib/Array'
 *
 * const double = (n: number): number => n * 2
 * assert.deepStrictEqual(makeBy(5, double), [0, 2, 4, 6, 8])
 *
 * @since 2.0.0
 */
export function makeBy<A>(n: number, f: (i: number) => A): Array<A> {
  const r: Array<A> = []
  for (let i = 0; i < n; i++) {
    r.push(f(i))
  }
  return r
}

/**
 * Create an array containing a range of integers, including both endpoints
 *
 * @example
 * import { range } from 'fp-ts/lib/Array'
 *
 * assert.deepStrictEqual(range(1, 5), [1, 2, 3, 4, 5])
 *
 * @since 2.0.0
 */
export function range(start: number, end: number): Array<number> {
  return makeBy(end - start + 1, i => start + i)
}

/**
 * Create an array containing a value repeated the specified number of times
 *
 * @example
 * import { replicate } from 'fp-ts/lib/Array'
 *
 * assert.deepStrictEqual(replicate(3, 'a'), ['a', 'a', 'a'])
 *
 * @since 2.0.0
 */
export function replicate<A>(n: number, a: A): Array<A> {
  return makeBy(n, () => a)
}

/**
 * Removes one level of nesting
 *
 * @example
 * import { flatten } from 'fp-ts/lib/Array'
 *
 * assert.deepStrictEqual(flatten([[1], [2], [3]]), [1, 2, 3])
 *
 * @since 2.0.0
 */
export function flatten<A>(mma: Array<Array<A>>): Array<A> {
  let rLen = 0
  const len = mma.length
  for (let i = 0; i < len; i++) {
    rLen += mma[i].length
  }
  const r = Array(rLen)
  let start = 0
  for (let i = 0; i < len; i++) {
    const arr = mma[i]
    const l = arr.length
    for (let j = 0; j < l; j++) {
      r[j + start] = arr[j]
    }
    start += l
  }
  return r
}

/**
 * Break an array into its first element and remaining elements
 *
 * @example
 * import { foldLeft } from 'fp-ts/lib/Array'
 *
 * const len: <A>(as: Array<A>) => number = foldLeft(() => 0, (_, tail) => 1 + len(tail))
 * assert.strictEqual(len([1, 2, 3]), 3)
 *
 * @since 2.0.0
 */
export function foldLeft<A, B>(onNil: () => B, onCons: (head: A, tail: Array<A>) => B): (as: Array<A>) => B {
  return as => (isEmpty(as) ? onNil() : onCons(as[0], as.slice(1)))
}

/**
 * Break an array into its initial elements and the last element
 *
 * @since 2.0.0
 */
export function foldRight<A, B>(onNil: () => B, onCons: (init: Array<A>, last: A) => B): (as: Array<A>) => B {
  return as => (isEmpty(as) ? onNil() : onCons(as.slice(0, as.length - 1), as[as.length - 1]))
}

/**
 * Same as `reduce` but it carries over the intermediate steps
 *
 * ```ts
 * import { scanLeft } from 'fp-ts/lib/Array'
 *
 * assert.deepStrictEqual(scanLeft(10, (b, a: number) => b - a)([1, 2, 3]), [10, 9, 7, 4])
 * ```
 *
 * @since 2.0.0
 */
export function scanLeft<A, B>(b: B, f: (b: B, a: A) => B): (as: Array<A>) => Array<B> {
  return as => {
    const l = as.length
    const r: Array<B> = new Array(l + 1)
    r[0] = b
    for (let i = 0; i < l; i++) {
      r[i + 1] = f(r[i], as[i])
    }
    return r
  }
}

/**
 * Fold an array from the right, keeping all intermediate results instead of only the final result
 *
 * @example
 * import { scanRight } from 'fp-ts/lib/Array'
 *
 * assert.deepStrictEqual(scanRight(10, (a: number, b) => b - a)([1, 2, 3]), [4, 5, 7, 10])
 *
 * @since 2.0.0
 */
export function scanRight<A, B>(b: B, f: (a: A, b: B) => B): (as: Array<A>) => Array<B> {
  return as => {
    const l = as.length
    const r: Array<B> = new Array(l + 1)
    r[l] = b
    for (let i = l - 1; i >= 0; i--) {
      r[i] = f(as[i], r[i + 1])
    }
    return r
  }
}

/**
 * Test whether an array is empty
 *
 * @example
 * import { isEmpty } from 'fp-ts/lib/Array'
 *
 * assert.strictEqual(isEmpty([]), true)
 *
 * @since 2.0.0
 */
export function isEmpty<A>(as: Array<A>): boolean {
  return as.length === 0
}

/**
 * Test whether an array is non empty narrowing down the type to `NonEmptyArray<A>`
 *
 * @since 2.0.0
 */
export function isNonEmpty<A>(as: Array<A>): as is NonEmptyArray<A> {
  return as.length > 0
}

/**
 * Test whether an array contains a particular index
 *
 * @since 2.0.0
 */
export function isOutOfBound<A>(i: number, as: Array<A>): boolean {
  return i < 0 || i >= as.length
}

/**
 * This function provides a safe way to read a value at a particular index from an array
 *
 * @example
 * import { lookup } from 'fp-ts/lib/Array'
 * import { some, none } from 'fp-ts/lib/Option'
 *
 * assert.deepStrictEqual(lookup(1, [1, 2, 3]), some(2))
 * assert.deepStrictEqual(lookup(3, [1, 2, 3]), none)
 *
 * @since 2.0.0
 */
export function lookup<A>(i: number, as: Array<A>): Option<A> {
  return isOutOfBound(i, as) ? none : some(as[i])
}

/**
 * Attaches an element to the front of an array, creating a new non empty array
 *
 * @example
 * import { cons } from 'fp-ts/lib/Array'
 *
 * assert.deepStrictEqual(cons(0, [1, 2, 3]), [0, 1, 2, 3])
 *
 * @since 2.0.0
 */
export function cons<A>(head: A, tail: Array<A>): NonEmptyArray<A> {
  const len = tail.length
  const r = Array(len + 1)
  for (let i = 0; i < len; i++) {
    r[i + 1] = tail[i]
  }
  r[0] = head
  return r as NonEmptyArray<A>
}

/**
 * Append an element to the end of an array, creating a new non empty array
 *
 * @example
 * import { snoc } from 'fp-ts/lib/Array'
 *
 * assert.deepStrictEqual(snoc([1, 2, 3], 4), [1, 2, 3, 4])
 *
 * @since 2.0.0
 */
export function snoc<A>(init: Array<A>, end: A): NonEmptyArray<A> {
  const len = init.length
  const r = Array(len + 1)
  for (let i = 0; i < len; i++) {
    r[i] = init[i]
  }
  r[len] = end
  return r as NonEmptyArray<A>
}

/**
 * Get the first element in an array, or `None` if the array is empty
 *
 * @example
 * import { head } from 'fp-ts/lib/Array'
 * import { some, none } from 'fp-ts/lib/Option'
 *
 * assert.deepStrictEqual(head([1, 2, 3]), some(1))
 * assert.deepStrictEqual(head([]), none)
 *
 * @since 2.0.0
 */
export function head<A>(as: Array<A>): Option<A> {
  return isEmpty(as) ? none : some(as[0])
}

/**
 * Get the last element in an array, or `None` if the array is empty
 *
 * @example
 * import { last } from 'fp-ts/lib/Array'
 * import { some, none } from 'fp-ts/lib/Option'
 *
 * assert.deepStrictEqual(last([1, 2, 3]), some(3))
 * assert.deepStrictEqual(last([]), none)
 *
 * @since 2.0.0
 */
export function last<A>(as: Array<A>): Option<A> {
  return lookup(as.length - 1, as)
}

/**
 * Get all but the first element of an array, creating a new array, or `None` if the array is empty
 *
 * @example
 * import { tail } from 'fp-ts/lib/Array'
 * import { some, none } from 'fp-ts/lib/Option'
 *
 * assert.deepStrictEqual(tail([1, 2, 3]), some([2, 3]))
 * assert.deepStrictEqual(tail([]), none)
 *
 * @since 2.0.0
 */
export function tail<A>(as: Array<A>): Option<Array<A>> {
  return isEmpty(as) ? none : some(as.slice(1))
}

/**
 * Get all but the last element of an array, creating a new array, or `None` if the array is empty
 *
 * @example
 * import { init } from 'fp-ts/lib/Array'
 * import { some, none } from 'fp-ts/lib/Option'
 *
 * assert.deepStrictEqual(init([1, 2, 3]), some([1, 2]))
 * assert.deepStrictEqual(init([]), none)
 *
 * @since 2.0.0
 */
export function init<A>(as: Array<A>): Option<Array<A>> {
  const len = as.length
  return len === 0 ? none : some(as.slice(0, len - 1))
}

/**
 * Keep only a number of elements from the start of an array, creating a new array.
 * `n` must be a natural number
 *
 * @example
 * import { takeLeft } from 'fp-ts/lib/Array'
 *
 * assert.deepStrictEqual(takeLeft(2)([1, 2, 3]), [1, 2])
 *
 * @since 2.0.0
 */
export function takeLeft(n: number): <A>(as: Array<A>) => Array<A> {
  return as => as.slice(0, n)
}

/**
 * Keep only a number of elements from the end of an array, creating a new array.
 * `n` must be a natural number
 *
 * @example
 * import { takeRight } from 'fp-ts/lib/Array'
 *
 * assert.deepStrictEqual(takeRight(2)([1, 2, 3, 4, 5]), [4, 5])
 *
 * @since 2.0.0
 */
export function takeRight(n: number): <A>(as: Array<A>) => Array<A> {
  return as => (n === 0 ? empty : as.slice(-n))
}

/**
 * Calculate the longest initial subarray for which all element satisfy the specified predicate, creating a new array
 *
 * @example
 * import { takeLeftWhile } from 'fp-ts/lib/Array'
 *
 * assert.deepStrictEqual(takeLeftWhile((n: number) => n % 2 === 0)([2, 4, 3, 6]), [2, 4])
 *
 * @since 2.0.0
 */
export function takeLeftWhile<A, B extends A>(refinement: Refinement<A, B>): (as: Array<A>) => Array<B>
export function takeLeftWhile<A>(predicate: Predicate<A>): (as: Array<A>) => Array<A>
export function takeLeftWhile<A>(predicate: Predicate<A>): (as: Array<A>) => Array<A> {
  return as => {
    const i = spanIndexUncurry(as, predicate)
    const init = Array(i)
    for (let j = 0; j < i; j++) {
      init[j] = as[j]
    }
    return init
  }
}

const spanIndexUncurry = <A>(as: Array<A>, predicate: Predicate<A>): number => {
  const l = as.length
  let i = 0
  for (; i < l; i++) {
    if (!predicate(as[i])) {
      break
    }
  }
  return i
}

/**
 * Split an array into two parts:
 * 1. the longest initial subarray for which all elements satisfy the specified predicate
 * 2. the remaining elements
 *
 * @example
 * import { spanLeft } from 'fp-ts/lib/Array'
 *
 * assert.deepStrictEqual(spanLeft((n: number) => n % 2 === 1)([1, 3, 2, 4, 5]), { init: [1, 3], rest: [2, 4, 5] })
 *
 * @since 2.0.0
 */
export function spanLeft<A, B extends A>(
  refinement: Refinement<A, B>
): (as: Array<A>) => { init: Array<B>; rest: Array<A> }
export function spanLeft<A>(predicate: Predicate<A>): (as: Array<A>) => { init: Array<A>; rest: Array<A> }
export function spanLeft<A>(predicate: Predicate<A>): (as: Array<A>) => { init: Array<A>; rest: Array<A> } {
  return as => {
    const i = spanIndexUncurry(as, predicate)
    const init = Array(i)
    for (let j = 0; j < i; j++) {
      init[j] = as[j]
    }
    const l = as.length
    const rest = Array(l - i)
    for (let j = i; j < l; j++) {
      rest[j - i] = as[j]
    }
    return { init, rest }
  }
}

/**
 * Drop a number of elements from the start of an array, creating a new array
 *
 * @example
 * import { dropLeft } from 'fp-ts/lib/Array'
 *
 * assert.deepStrictEqual(dropLeft(2)([1, 2, 3]), [3])
 *
 * @since 2.0.0
 */
export function dropLeft(n: number): <A>(as: Array<A>) => Array<A> {
  return as => as.slice(n, as.length)
}

/**
 * Drop a number of elements from the end of an array, creating a new array
 *
 * @example
 * import { dropRight } from 'fp-ts/lib/Array'
 *
 * assert.deepStrictEqual(dropRight(2)([1, 2, 3, 4, 5]), [1, 2, 3])
 *
 * @since 2.0.0
 */
export function dropRight(n: number): <A>(as: Array<A>) => Array<A> {
  return as => as.slice(0, as.length - n)
}

/**
 * Remove the longest initial subarray for which all element satisfy the specified predicate, creating a new array
 *
 * @example
 * import { dropLeftWhile } from 'fp-ts/lib/Array'
 *
 * assert.deepStrictEqual(dropLeftWhile((n: number) => n % 2 === 1)([1, 3, 2, 4, 5]), [2, 4, 5])
 *
 * @since 2.0.0
 */
export function dropLeftWhile<A>(predicate: Predicate<A>): (as: Array<A>) => Array<A> {
  return as => {
    const i = spanIndexUncurry(as, predicate)
    const l = as.length
    const rest = Array(l - i)
    for (let j = i; j < l; j++) {
      rest[j - i] = as[j]
    }
    return rest
  }
}

/**
 * Find the first index for which a predicate holds
 *
 * @example
 * import { findIndex } from 'fp-ts/lib/Array'
 * import { some, none } from 'fp-ts/lib/Option'
 *
 * assert.deepStrictEqual(findIndex((n: number) => n === 2)([1, 2, 3]), some(1))
 * assert.deepStrictEqual(findIndex((n: number) => n === 2)([]), none)
 *
 * @since 2.0.0
 */
export function findIndex<A>(predicate: Predicate<A>): (as: Array<A>) => Option<number> {
  return as => {
    const len = as.length
    for (let i = 0; i < len; i++) {
      if (predicate(as[i])) {
        return some(i)
      }
    }
    return none
  }
}

/**
 * Find the first element which satisfies a predicate (or a refinement) function
 *
 * @example
 * import { findFirst } from 'fp-ts/lib/Array'
 * import { some } from 'fp-ts/lib/Option'
 *
 * assert.deepStrictEqual(findFirst((x: { a: number, b: number }) => x.a === 1)([{ a: 1, b: 1 }, { a: 1, b: 2 }]), some({ a: 1, b: 1 }))
 *
 * @since 2.0.0
 */
export function findFirst<A, B extends A>(refinement: Refinement<A, B>): (as: Array<A>) => Option<B>
export function findFirst<A>(predicate: Predicate<A>): (as: Array<A>) => Option<A>
export function findFirst<A>(predicate: Predicate<A>): (as: Array<A>) => Option<A> {
  return as => {
    const len = as.length
    for (let i = 0; i < len; i++) {
      if (predicate(as[i])) {
        return some(as[i])
      }
    }
    return none
  }
}

/**
 * Find the first element returned by an option based selector function
 *
 * @example
 * import { findFirstMap } from 'fp-ts/lib/Array'
 * import { some, none } from 'fp-ts/lib/Option'
 *
 * interface Person {
 *   name: string
 *   age?: number
 * }
 *
 * const persons: Array<Person> = [{ name: 'John' }, { name: 'Mary', age: 45 }, { name: 'Joey', age: 28 }]
 *
 * // returns the name of the first person that has an age
 * assert.deepStrictEqual(findFirstMap((p: Person) => (p.age === undefined ? none : some(p.name)))(persons), some('Mary'))
 *
 * @since 2.0.0
 */
export function findFirstMap<A, B>(f: (a: A) => Option<B>): (as: Array<A>) => Option<B> {
  return as => {
    const len = as.length
    for (let i = 0; i < len; i++) {
      const v = f(as[i])
      if (isSome(v)) {
        return v
      }
    }
    return none
  }
}

/**
 * Find the last element which satisfies a predicate function
 *
 * @example
 * import { findLast } from 'fp-ts/lib/Array'
 * import { some } from 'fp-ts/lib/Option'
 *
 * assert.deepStrictEqual(findLast((x: { a: number, b: number }) => x.a === 1)([{ a: 1, b: 1 }, { a: 1, b: 2 }]), some({ a: 1, b: 2 }))
 *
 * @since 2.0.0
 */
export function findLast<A, B extends A>(refinement: Refinement<A, B>): (as: Array<A>) => Option<B>
export function findLast<A>(predicate: Predicate<A>): (as: Array<A>) => Option<A>
export function findLast<A>(predicate: Predicate<A>): (as: Array<A>) => Option<A> {
  return as => {
    const len = as.length
    for (let i = len - 1; i >= 0; i--) {
      if (predicate(as[i])) {
        return some(as[i])
      }
    }
    return none
  }
}

/**
 * Find the last element returned by an option based selector function
 *
 * @example
 * import { findLastMap } from 'fp-ts/lib/Array'
 * import { some, none } from 'fp-ts/lib/Option'
 *
 * interface Person {
 *   name: string
 *   age?: number
 * }
 *
 * const persons: Array<Person> = [{ name: 'John' }, { name: 'Mary', age: 45 }, { name: 'Joey', age: 28 }]
 *
 * // returns the name of the last person that has an age
 * assert.deepStrictEqual(findLastMap((p: Person) => (p.age === undefined ? none : some(p.name)))(persons), some('Joey'))
 *
 * @since 2.0.0
 */
export function findLastMap<A, B>(f: (a: A) => Option<B>): (as: Array<A>) => Option<B> {
  return as => {
    const len = as.length
    for (let i = len - 1; i >= 0; i--) {
      const v = f(as[i])
      if (isSome(v)) {
        return v
      }
    }
    return none
  }
}

/**
 * Returns the index of the last element of the list which matches the predicate
 *
 * @example
 * import { findLastIndex } from 'fp-ts/lib/Array'
 * import { some, none } from 'fp-ts/lib/Option'
 *
 * interface X {
 *   a: number
 *   b: number
 * }
 * const xs: Array<X> = [{ a: 1, b: 0 }, { a: 1, b: 1 }]
 * assert.deepStrictEqual(findLastIndex((x: { a: number }) => x.a === 1)(xs), some(1))
 * assert.deepStrictEqual(findLastIndex((x: { a: number }) => x.a === 4)(xs), none)
 *
 *
 * @since 2.0.0
 */
export function findLastIndex<A>(predicate: Predicate<A>): (as: Array<A>) => Option<number> {
  return as => {
    const len = as.length
    for (let i = len - 1; i >= 0; i--) {
      if (predicate(as[i])) {
        return some(i)
      }
    }
    return none
  }
}

/**
 * @since 2.0.0
 */
export function copy<A>(as: Array<A>): Array<A> {
  const l = as.length
  const r = Array(l)
  for (let i = 0; i < l; i++) {
    r[i] = as[i]
  }
  return r
}

/**
 * @since 2.0.0
 */
export function unsafeInsertAt<A>(i: number, a: A, as: Array<A>): Array<A> {
  const xs = copy(as)
  xs.splice(i, 0, a)
  return xs
}

/**
 * Insert an element at the specified index, creating a new array, or returning `None` if the index is out of bounds
 *
 * @example
 * import { insertAt } from 'fp-ts/lib/Array'
 * import { some } from 'fp-ts/lib/Option'
 *
 * assert.deepStrictEqual(insertAt(2, 5)([1, 2, 3, 4]), some([1, 2, 5, 3, 4]))
 *
 * @since 2.0.0
 */
export function insertAt<A>(i: number, a: A): (as: Array<A>) => Option<Array<A>> {
  return as => (i < 0 || i > as.length ? none : some(unsafeInsertAt(i, a, as)))
}

/**
 * @since 2.0.0
 */
export function unsafeUpdateAt<A>(i: number, a: A, as: Array<A>): Array<A> {
  if (as[i] === a) {
    return as
  } else {
    const xs = copy(as)
    xs[i] = a
    return xs
  }
}

/**
 * Change the element at the specified index, creating a new array, or returning `None` if the index is out of bounds
 *
 * @example
 * import { updateAt } from 'fp-ts/lib/Array'
 * import { some, none } from 'fp-ts/lib/Option'
 *
 * assert.deepStrictEqual(updateAt(1, 1)([1, 2, 3]), some([1, 1, 3]))
 * assert.deepStrictEqual(updateAt(1, 1)([]), none)
 *
 * @since 2.0.0
 */
export function updateAt<A>(i: number, a: A): (as: Array<A>) => Option<Array<A>> {
  return as => (isOutOfBound(i, as) ? none : some(unsafeUpdateAt(i, a, as)))
}

/**
 * @since 2.0.0
 */
export function unsafeDeleteAt<A>(i: number, as: Array<A>): Array<A> {
  const xs = copy(as)
  xs.splice(i, 1)
  return xs
}

/**
 * Delete the element at the specified index, creating a new array, or returning `None` if the index is out of bounds
 *
 * @example
 * import { deleteAt } from 'fp-ts/lib/Array'
 * import { some, none } from 'fp-ts/lib/Option'
 *
 * assert.deepStrictEqual(deleteAt(0)([1, 2, 3]), some([2, 3]))
 * assert.deepStrictEqual(deleteAt(1)([]), none)
 *
 * @since 2.0.0
 */
export function deleteAt(i: number): <A>(as: Array<A>) => Option<Array<A>> {
  return as => (isOutOfBound(i, as) ? none : some(unsafeDeleteAt(i, as)))
}

/**
 * Apply a function to the element at the specified index, creating a new array, or returning `None` if the index is out
 * of bounds
 *
 * @example
 * import { modifyAt } from 'fp-ts/lib/Array'
 * import { some, none } from 'fp-ts/lib/Option'
 *
 * const double = (x: number): number => x * 2
 * assert.deepStrictEqual(modifyAt(1, double)([1, 2, 3]), some([1, 4, 3]))
 * assert.deepStrictEqual(modifyAt(1, double)([]), none)
 *
 * @since 2.0.0
 */
export function modifyAt<A>(i: number, f: (a: A) => A): (as: Array<A>) => Option<Array<A>> {
  return as => (isOutOfBound(i, as) ? none : some(unsafeUpdateAt(i, f(as[i]), as)))
}

/**
 * Reverse an array, creating a new array
 *
 * @example
 * import { reverse } from 'fp-ts/lib/Array'
 *
 * assert.deepStrictEqual(reverse([1, 2, 3]), [3, 2, 1])
 *
 * @since 2.0.0
 */
export function reverse<A>(as: Array<A>): Array<A> {
  return copy(as).reverse()
}

/**
 * Extracts from an array of `Either` all the `Right` elements. All the `Right` elements are extracted in order
 *
 * @example
 * import { rights } from 'fp-ts/lib/Array'
 * import { right, left } from 'fp-ts/lib/Either'
 *
 * assert.deepStrictEqual(rights([right(1), left('foo'), right(2)]), [1, 2])
 *
 * @since 2.0.0
 */
export function rights<E, A>(as: Array<Either<E, A>>): Array<A> {
  const r: Array<A> = []
  const len = as.length
  for (let i = 0; i < len; i++) {
    const a = as[i]
    if (a._tag === 'Right') {
      r.push(a.right)
    }
  }
  return r
}

/**
 * Extracts from an array of `Either` all the `Left` elements. All the `Left` elements are extracted in order
 *
 * @example
 * import { lefts } from 'fp-ts/lib/Array'
 * import { left, right } from 'fp-ts/lib/Either'
 *
 * assert.deepStrictEqual(lefts([right(1), left('foo'), right(2)]), ['foo'])
 *
 * @since 2.0.0
 */
export function lefts<E, A>(as: Array<Either<E, A>>): Array<E> {
  const r: Array<E> = []
  const len = as.length
  for (let i = 0; i < len; i++) {
    const a = as[i]
    if (a._tag === 'Left') {
      r.push(a.left)
    }
  }
  return r
}

/**
 * Sort the elements of an array in increasing order, creating a new array
 *
 * @example
 * import { sort } from 'fp-ts/lib/Array'
 * import { ordNumber } from 'fp-ts/lib/Ord'
 *
 * assert.deepStrictEqual(sort(ordNumber)([3, 2, 1]), [1, 2, 3])
 *
 * @since 2.0.0
 */
export function sort<A>(O: Ord<A>): (as: Array<A>) => Array<A> {
  return as => copy(as).sort(O.compare)
}

/**
 * Apply a function to pairs of elements at the same index in two arrays, collecting the results in a new array. If one
 * input array is short, excess elements of the longer array are discarded.
 *
 * @example
 * import { zipWith } from 'fp-ts/lib/Array'
 *
 * assert.deepStrictEqual(zipWith([1, 2, 3], ['a', 'b', 'c', 'd'], (n, s) => s + n), ['a1', 'b2', 'c3'])
 *
 * @since 2.0.0
 */
export function zipWith<A, B, C>(fa: Array<A>, fb: Array<B>, f: (a: A, b: B) => C): Array<C> {
  const fc = []
  const len = Math.min(fa.length, fb.length)
  for (let i = 0; i < len; i++) {
    fc[i] = f(fa[i], fb[i])
  }
  return fc
}

/**
 * Takes two arrays and returns an array of corresponding pairs. If one input array is short, excess elements of the
 * longer array are discarded
 *
 * @example
 * import { zip } from 'fp-ts/lib/Array'
 *
 * assert.deepStrictEqual(zip([1, 2, 3], ['a', 'b', 'c', 'd']), [[1, 'a'], [2, 'b'], [3, 'c']])
 *
 * @since 2.0.0
 */
export function zip<A, B>(fa: Array<A>, fb: Array<B>): Array<[A, B]> {
  return zipWith(fa, fb, (a, b) => [a, b])
}

/**
 * The function is reverse of `zip`. Takes an array of pairs and return two corresponding arrays
 *
 * @example
 * import { unzip } from 'fp-ts/lib/Array'
 *
 * assert.deepStrictEqual(unzip([[1, 'a'], [2, 'b'], [3, 'c']]), [[1, 2, 3], ['a', 'b', 'c']])
 *
 * @since 2.0.0
 */
export function unzip<A, B>(as: Array<[A, B]>): [Array<A>, Array<B>] {
  const fa = []
  const fb = []

  for (let i = 0; i < as.length; i++) {
    fa[i] = as[i][0]
    fb[i] = as[i][1]
  }

  return [fa, fb]
}

/**
 * Rotate an array to the right by `n` steps
 *
 * @example
 * import { rotate } from 'fp-ts/lib/Array'
 *
 * assert.deepStrictEqual(rotate(2)([1, 2, 3, 4, 5]), [4, 5, 1, 2, 3])
 *
 * @since 2.0.0
 */
export function rotate(n: number): <A>(as: Array<A>) => Array<A> {
  return as => {
    const len = as.length
    if (n === 0 || len <= 1 || len === Math.abs(n)) {
      return as
    } else if (n < 0) {
      return rotate(len + n)(as)
    } else {
      return as.slice(-n).concat(as.slice(0, len - n))
    }
  }
}

/**
 * Test if a value is a member of an array. Takes a `Eq<A>` as a single
 * argument which returns the function to use to search for a value of type `A` in
 * an array of type `Array<A>`.
 *
 * @example
 * import { elem } from 'fp-ts/lib/Array'
 * import { eqNumber } from 'fp-ts/lib/Eq'
 *
 * assert.strictEqual(elem(eqNumber)(1, [1, 2, 3]), true)
 * assert.strictEqual(elem(eqNumber)(4, [1, 2, 3]), false)
 *
 * @since 2.0.0
 */
export function elem<A>(E: Eq<A>): (a: A, as: Array<A>) => boolean {
  return (a, as) => {
    const predicate = (element: A) => E.equals(element, a)
    let i = 0
    const len = as.length
    for (; i < len; i++) {
      if (predicate(as[i])) {
        return true
      }
    }
    return false
  }
}

/**
 * Remove duplicates from an array, keeping the first occurance of an element.
 *
 * @example
 * import { uniq } from 'fp-ts/lib/Array'
 * import { eqNumber } from 'fp-ts/lib/Eq'
 *
 * assert.deepStrictEqual(uniq(eqNumber)([1, 2, 1]), [1, 2])
 *
 * @since 2.0.0
 */
export function uniq<A>(E: Eq<A>): (as: Array<A>) => Array<A> {
  const elemS = elem(E)
  return as => {
    const r: Array<A> = []
    const len = as.length
    let i = 0
    for (; i < len; i++) {
      const a = as[i]
      if (!elemS(a, r)) {
        r.push(a)
      }
    }
    return len === r.length ? as : r
  }
}

/**
 * Sort the elements of an array in increasing order, where elements are compared using first `ords[0]`, then `ords[1]`,
 * etc...
 *
 * @example
 * import { sortBy } from 'fp-ts/lib/Array'
 * import { ord, ordString, ordNumber } from 'fp-ts/lib/Ord'
 *
 * interface Person {
 *   name: string
 *   age: number
 * }
 * const byName = ord.contramap(ordString, (p: Person) => p.name)
 * const byAge = ord.contramap(ordNumber, (p: Person) => p.age)
 *
 * const sortByNameByAge = sortBy([byName, byAge])
 *
 * const persons = [{ name: 'a', age: 1 }, { name: 'b', age: 3 }, { name: 'c', age: 2 }, { name: 'b', age: 2 }]
 * assert.deepStrictEqual(sortByNameByAge(persons), [
 *   { name: 'a', age: 1 },
 *   { name: 'b', age: 2 },
 *   { name: 'b', age: 3 },
 *   { name: 'c', age: 2 }
 * ])
 *
 * @since 2.0.0
 */
export function sortBy<A>(ords: Array<Ord<A>>): (as: Array<A>) => Array<A> {
  return sort(ords.slice(1).reduce(getSemigroup<A>().concat, ords[0]))
}

/**
 * A useful recursion pattern for processing an array to produce a new array, often used for "chopping" up the input
 * array. Typically chop is called with some function that will consume an initial prefix of the array and produce a
 * value and the rest of the array.
 *
 * @example
 * import { Eq, eqNumber } from 'fp-ts/lib/Eq'
 * import { chop, spanLeft } from 'fp-ts/lib/Array'
 *
 * const group = <A>(S: Eq<A>): ((as: Array<A>) => Array<Array<A>>) => {
 *   return chop(as => {
 *     const { init, rest } = spanLeft((a: A) => S.equals(a, as[0]))(as)
 *     return [init, rest]
 *   })
 * }
 * assert.deepStrictEqual(group(eqNumber)([1, 1, 2, 3, 3, 4]), [[1, 1], [2], [3, 3], [4]])
 *
 * @since 2.0.0
 */
export function chop<A, B>(f: (as: NonEmptyArray<A>) => [B, Array<A>]): (as: Array<A>) => Array<B> {
  return as => {
    const result: Array<B> = []
    let cs: Array<A> = as
    while (isNonEmpty(cs)) {
      const [b, c] = f(cs)
      result.push(b)
      cs = c
    }
    return result
  }
}

/**
 * Splits an array into two pieces, the first piece has `n` elements.
 *
 * @example
 * import { splitAt } from 'fp-ts/lib/Array'
 *
 * assert.deepStrictEqual(splitAt(2)([1, 2, 3, 4, 5]), [[1, 2], [3, 4, 5]])
 *
 * @since 2.0.0
 */
export function splitAt(n: number): <A>(as: Array<A>) => [Array<A>, Array<A>] {
  return as => [as.slice(0, n), as.slice(n)]
}

/**
 * Splits an array into length-`n` pieces. The last piece will be shorter if `n` does not evenly divide the length of
 * the array. Note that `chunksOf(n)([])` is `[]`, not `[[]]`. This is intentional, and is consistent with a recursive
 * definition of `chunksOf`; it satisfies the property that
 *
 * ```ts
 * chunksOf(n)(xs).concat(chunksOf(n)(ys)) == chunksOf(n)(xs.concat(ys)))
 * ```
 *
 * whenever `n` evenly divides the length of `xs`.
 *
 * @example
 * import { chunksOf } from 'fp-ts/lib/Array'
 *
 * assert.deepStrictEqual(chunksOf(2)([1, 2, 3, 4, 5]), [[1, 2], [3, 4], [5]])
 *
 *
 * @since 2.0.0
 */
export function chunksOf(n: number): <A>(as: Array<A>) => Array<Array<A>> {
  return as => (isOutOfBound(n - 1, as) ? [as] : chop(splitAt(n))(as))
}

/**
 * Array comprehension
 *
 * ```
 * [ f(x, y, ...) | x ← xs, y ← ys, ..., g(x, y, ...) ]
 * ```
 *
 * @example
 * import { comprehension } from 'fp-ts/lib/Array'
 * import { tuple } from 'fp-ts/lib/function'
 *
 * assert.deepStrictEqual(comprehension([[1, 2, 3], ['a', 'b']], tuple, (a, b) => (a + b.length) % 2 === 0), [
 *   [1, 'a'],
 *   [1, 'b'],
 *   [3, 'a'],
 *   [3, 'b']
 * ])
 *
 * @since 2.0.0
 */
export function comprehension<A, B, C, D, R>(
  input: [Array<A>, Array<B>, Array<C>, Array<D>],
  f: (a: A, b: B, c: C, d: D) => R,
  g?: (a: A, b: B, c: C, d: D) => boolean
): Array<R>
export function comprehension<A, B, C, R>(
  input: [Array<A>, Array<B>, Array<C>],
  f: (a: A, b: B, c: C) => R,
  g?: (a: A, b: B, c: C) => boolean
): Array<R>
export function comprehension<A, R>(input: [Array<A>], f: (a: A) => R, g?: (a: A) => boolean): Array<R>
export function comprehension<A, B, R>(
  input: [Array<A>, Array<B>],
  f: (a: A, b: B) => R,
  g?: (a: A, b: B) => boolean
): Array<R>
export function comprehension<A, R>(input: [Array<A>], f: (a: A) => boolean, g?: (a: A) => R): Array<R>
export function comprehension<R>(
  input: Array<Array<any>>,
  f: (...xs: Array<any>) => R,
  g: (...xs: Array<any>) => boolean = () => true
): Array<R> {
  const go = (scope: Array<any>, input: Array<Array<any>>): Array<R> => {
    if (input.length === 0) {
      return g(...scope) ? [f(...scope)] : empty
    } else {
      return array.chain(input[0], x => go(snoc(scope, x), input.slice(1)))
    }
  }
  return go(empty, input)
}

/**
 * Creates an array of unique values, in order, from all given arrays using a `Eq` for equality comparisons
 *
 * @example
 * import { union } from 'fp-ts/lib/Array'
 * import { eqNumber } from 'fp-ts/lib/Eq'
 *
 * assert.deepStrictEqual(union(eqNumber)([1, 2], [2, 3]), [1, 2, 3])
 *
 * @since 2.0.0
 */
export function union<A>(E: Eq<A>): (xs: Array<A>, ys: Array<A>) => Array<A> {
  const elemE = elem(E)
  return (xs, ys) => concat(xs, ys.filter(a => !elemE(a, xs)))
}

/**
 * Creates an array of unique values that are included in all given arrays using a `Eq` for equality
 * comparisons. The order and references of result values are determined by the first array.
 *
 * @example
 * import { intersection } from 'fp-ts/lib/Array'
 * import { eqNumber } from 'fp-ts/lib/Eq'
 *
 * assert.deepStrictEqual(intersection(eqNumber)([1, 2], [2, 3]), [2])
 *
 * @since 2.0.0
 */
export function intersection<A>(E: Eq<A>): (xs: Array<A>, ys: Array<A>) => Array<A> {
  const elemE = elem(E)
  return (xs, ys) => xs.filter(a => elemE(a, ys))
}

/**
 * Creates an array of array values not included in the other given array using a `Eq` for equality
 * comparisons. The order and references of result values are determined by the first array.
 *
 * @example
 * import { difference } from 'fp-ts/lib/Array'
 * import { eqNumber } from 'fp-ts/lib/Eq'
 *
 * assert.deepStrictEqual(difference(eqNumber)([1, 2], [2, 3]), [1])
 *
 * @since 2.0.0
 */
export function difference<A>(E: Eq<A>): (xs: Array<A>, ys: Array<A>) => Array<A> {
  const elemE = elem(E)
  return (xs, ys) => xs.filter(a => !elemE(a, ys))
}

const identity = <A>(a: A): A => a

/**
 * @since 2.0.0
 */
export const of = <A>(a: A): Array<A> => [a]

/**
 * @since 2.0.0
 */
export const array: Monad1<URI> &
  Foldable1<URI> &
  Unfoldable1<URI> &
  TraversableWithIndex1<URI, number> &
  Alternative1<URI> &
  Extend1<URI> &
  Compactable1<URI> &
  FilterableWithIndex1<URI, number> &
  Witherable1<URI> &
  FunctorWithIndex1<URI, number> &
  FoldableWithIndex1<URI, number> = {
  URI,
  map: (fa, f) => fa.map(a => f(a)),
  mapWithIndex: (fa, f) => fa.map((a, i) => f(i, a)),
  compact: as => array.filterMap(as, identity),
  separate: <B, C>(fa: Array<Either<B, C>>): Separated<Array<B>, Array<C>> => {
    const left: Array<B> = []
    const right: Array<C> = []
    for (const e of fa) {
      if (e._tag === 'Left') {
        left.push(e.left)
      } else {
        right.push(e.right)
      }
    }
    return {
      left,
      right
    }
  },
  filter: <A>(as: Array<A>, predicate: Predicate<A>): Array<A> => {
    return as.filter(predicate)
  },
  filterMap: (as, f) => array.filterMapWithIndex(as, (_, a) => f(a)),
  partition: <A>(fa: Array<A>, predicate: Predicate<A>): Separated<Array<A>, Array<A>> => {
    return array.partitionWithIndex(fa, (_, a) => predicate(a))
  },
  partitionMap: (fa, f) => array.partitionMapWithIndex(fa, (_, a) => f(a)),
  of,
  ap: (fab, fa) => flatten(array.map(fab, f => array.map(fa, f))),
  chain: (fa, f) => {
    let resLen = 0
    const l = fa.length
    const temp = new Array(l)
    for (let i = 0; i < l; i++) {
      const e = fa[i]
      const arr = f(e)
      resLen += arr.length
      temp[i] = arr
    }
    const r = Array(resLen)
    let start = 0
    for (let i = 0; i < l; i++) {
      const arr = temp[i]
      const l = arr.length
      for (let j = 0; j < l; j++) {
        r[j + start] = arr[j]
      }
      start += l
    }
    return r
  },
  reduce: (fa, b, f) => array.reduceWithIndex(fa, b, (_, b, a) => f(b, a)),
  foldMap: M => {
    const foldMapWithIndexM = array.foldMapWithIndex(M)
    return (fa, f) => foldMapWithIndexM(fa, (_, a) => f(a))
  },
  reduceRight: (fa, b, f) => array.reduceRightWithIndex(fa, b, (_, a, b) => f(a, b)),
  unfold: <A, B>(b: B, f: (b: B) => Option<[A, B]>): Array<A> => {
    const ret: Array<A> = []
    let bb = b
    while (true) {
      const mt = f(bb)
      if (isSome(mt)) {
        const [a, b] = mt.value
        ret.push(a)
        bb = b
      } else {
        break
      }
    }
    return ret
  },
  traverse: <F>(F: Applicative<F>): (<A, B>(ta: Array<A>, f: (a: A) => HKT<F, B>) => HKT<F, Array<B>>) => {
    const traverseWithIndexF = array.traverseWithIndex(F)
    return (ta, f) => traverseWithIndexF(ta, (_, a) => f(a))
  },
  sequence: <F>(F: Applicative<F>) => <A>(ta: Array<HKT<F, A>>): HKT<F, Array<A>> => {
    return array.reduce(ta, F.of(array.zero()), (fas, fa) => F.ap(F.map(fas, as => (a: A) => snoc(as, a)), fa))
  },
  zero: () => empty,
  alt: (fx, f) => concat(fx, f()),
  extend: (fa, f) => fa.map((_, i, as) => f(as.slice(i))),
  wither: <F>(F: Applicative<F>): (<A, B>(ta: Array<A>, f: (a: A) => HKT<F, Option<B>>) => HKT<F, Array<B>>) => {
    const traverseF = array.traverse(F)
    return (wa, f) => F.map(traverseF(wa, f), array.compact)
  },
  wilt: <F>(
    F: Applicative<F>
  ): (<A, B, C>(wa: Array<A>, f: (a: A) => HKT<F, Either<B, C>>) => HKT<F, Separated<Array<B>, Array<C>>>) => {
    const traverseF = array.traverse(F)
    return (wa, f) => F.map(traverseF(wa, f), array.separate)
  },
  reduceWithIndex: (fa, b, f) => {
    const l = fa.length
    let r = b
    for (let i = 0; i < l; i++) {
      r = f(i, r, fa[i])
    }
    return r
  },
  foldMapWithIndex: M => (fa, f) => fa.reduce((b, a, i) => M.concat(b, f(i, a)), M.empty),
  reduceRightWithIndex: (fa, b, f) => fa.reduceRight((b, a, i) => f(i, a, b), b),
  traverseWithIndex: <F>(F: Applicative<F>) => <A, B>(
    ta: Array<A>,
    f: (i: number, a: A) => HKT<F, B>
  ): HKT<F, Array<B>> => {
    return array.reduceWithIndex(ta, F.of<Array<B>>(array.zero()), (i, fbs, a) =>
      F.ap(F.map(fbs, bs => (b: B) => snoc(bs, b)), f(i, a))
    )
  },
  partitionMapWithIndex: <A, B, C>(
    fa: Array<A>,
    f: (i: number, a: A) => Either<B, C>
  ): Separated<Array<B>, Array<C>> => {
    const left: Array<B> = []
    const right: Array<C> = []
    for (let i = 0; i < fa.length; i++) {
      const e = f(i, fa[i])
      if (e._tag === 'Left') {
        left.push(e.left)
      } else {
        right.push(e.right)
      }
    }
    return {
      left,
      right
    }
  },
  partitionWithIndex: <A>(
    fa: Array<A>,
    predicateWithIndex: (i: number, a: A) => boolean
  ): Separated<Array<A>, Array<A>> => {
    const left: Array<A> = []
    const right: Array<A> = []
    for (let i = 0; i < fa.length; i++) {
      const a = fa[i]
      if (predicateWithIndex(i, a)) {
        right.push(a)
      } else {
        left.push(a)
      }
    }
    return {
      left,
      right
    }
  },
  filterMapWithIndex: <A, B>(fa: Array<A>, f: (i: number, a: A) => Option<B>): Array<B> => {
    const result: Array<B> = []
    for (let i = 0; i < fa.length; i++) {
      const optionB = f(i, fa[i])
      if (isSome(optionB)) {
        result.push(optionB.value)
      }
    }
    return result
  },
  filterWithIndex: <A>(fa: Array<A>, predicateWithIndex: (i: number, a: A) => boolean): Array<A> => {
    return fa.filter((a, i) => predicateWithIndex(i, a))
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
  filter,
  filterMap,
  filterMapWithIndex,
  filterWithIndex,
  foldMap,
  foldMapWithIndex,
  map,
  mapWithIndex,
  partition,
  partitionMap,
  partitionMapWithIndex,
  partitionWithIndex,
  reduce,
  reduceRight,
  reduceRightWithIndex,
  reduceWithIndex,
  compact,
  separate
} = pipeable(array)

export {
  alt,
  ap,
  apFirst,
  apSecond,
  chain,
  chainFirst,
  duplicate,
  extend,
  filter,
  filterMap,
  filterMapWithIndex,
  filterWithIndex,
  foldMap,
  foldMapWithIndex,
  map,
  mapWithIndex,
  partition,
  partitionMap,
  partitionMapWithIndex,
  partitionWithIndex,
  reduce,
  reduceRight,
  reduceRightWithIndex,
  reduceWithIndex,
  compact,
  separate
}
