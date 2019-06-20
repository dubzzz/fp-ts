import { Alt3 } from './Alt';
import { Bifunctor3 } from './Bifunctor';
import * as E from './Either';
import { Monad3 } from './Monad';
import { MonadThrow3 } from './MonadThrow';
import { Monoid } from './Monoid';
import { Reader } from './Reader';
import { Semigroup } from './Semigroup';
import Either = E.Either;
declare module './HKT' {
    interface URItoKind3<R, E, A> {
        ReaderEither: ReaderEither<R, E, A>;
    }
}
/**
 * @since 2.0.0
 */
export declare const URI = "ReaderEither";
/**
 * @since 2.0.0
 */
export declare type URI = typeof URI;
/**
 * @since 2.0.0
 */
export interface ReaderEither<R, E, A> extends Reader<R, Either<E, A>> {
}
/**
 * @since 2.0.0
 */
export declare const left: <R, E = never, A = never>(e: E) => ReaderEither<R, E, A>;
/**
 * @since 2.0.0
 */
export declare const right: <R, E = never, A = never>(a: A) => ReaderEither<R, E, A>;
/**
 * @since 2.0.0
 */
export declare const rightReader: <R, E = never, A = never>(ma: Reader<R, A>) => ReaderEither<R, E, A>;
/**
 * @since 2.0.0
 */
export declare const leftReader: <R, E = never, A = never>(me: Reader<R, E>) => ReaderEither<R, E, A>;
/**
 * @since 2.0.0
 */
export declare function fold<R, E, A, B>(onLeft: (e: E) => Reader<R, B>, onRight: (a: A) => Reader<R, B>): (ma: ReaderEither<R, E, A>) => Reader<R, B>;
/**
 * @since 2.0.0
 */
export declare function getOrElse<R, E, A>(f: (e: E) => Reader<R, A>): (ma: ReaderEither<R, E, A>) => Reader<R, A>;
/**
 * @since 2.0.0
 */
export declare function orElse<R, E, A, M>(f: (e: E) => ReaderEither<R, M, A>): (ma: ReaderEither<R, E, A>) => ReaderEither<R, M, A>;
/**
 * @since 2.0.0
 */
export declare const swap: <R, E, A>(ma: ReaderEither<R, E, A>) => ReaderEither<R, A, E>;
/**
 * @since 2.0.0
 */
export declare function getSemigroup<R, E, A>(S: Semigroup<A>): Semigroup<ReaderEither<R, E, A>>;
/**
 * @since 2.0.0
 */
export declare function getApplySemigroup<R, E, A>(S: Semigroup<A>): Semigroup<ReaderEither<R, E, A>>;
/**
 * @since 2.0.0
 */
export declare function getApplyMonoid<R, E, A>(M: Monoid<A>): Monoid<ReaderEither<R, E, A>>;
/**
 * @since 2.0.0
 */
export declare function ask<R, E = never>(): ReaderEither<R, E, R>;
/**
 * @since 2.0.0
 */
export declare function asks<R, E = never, A = never>(f: (r: R) => A): ReaderEither<R, E, A>;
/**
 * @since 2.0.0
 */
export declare function local<Q, R>(f: (f: Q) => R): <E, A>(ma: ReaderEither<R, E, A>) => ReaderEither<Q, E, A>;
/**
 * @since 2.0.0
 */
export declare const readerEither: Monad3<URI> & Bifunctor3<URI> & Alt3<URI> & MonadThrow3<URI>;
declare const alt: <R, E, A>(that: () => ReaderEither<R, E, A>) => (fa: ReaderEither<R, E, A>) => ReaderEither<R, E, A>, ap: <R, E, A>(fa: ReaderEither<R, E, A>) => <B>(fab: ReaderEither<R, E, (a: A) => B>) => ReaderEither<R, E, B>, apFirst: <R, E, B>(fb: ReaderEither<R, E, B>) => <A>(fa: ReaderEither<R, E, A>) => ReaderEither<R, E, A>, apSecond: <R, E, B>(fb: ReaderEither<R, E, B>) => <A>(fa: ReaderEither<R, E, A>) => ReaderEither<R, E, B>, bimap: <E, G, A, B>(f: (e: E) => G, g: (a: A) => B) => <R>(fa: ReaderEither<R, E, A>) => ReaderEither<R, G, B>, chain: <R, E, A, B>(f: (a: A) => ReaderEither<R, E, B>) => (ma: ReaderEither<R, E, A>) => ReaderEither<R, E, B>, chainFirst: <R, E, A, B>(f: (a: A) => ReaderEither<R, E, B>) => (ma: ReaderEither<R, E, A>) => ReaderEither<R, E, A>, flatten: <R, E, A>(mma: ReaderEither<R, E, ReaderEither<R, E, A>>) => ReaderEither<R, E, A>, map: <A, B>(f: (a: A) => B) => <R, E>(fa: ReaderEither<R, E, A>) => ReaderEither<R, E, B>, mapLeft: <E, G, A>(f: (e: E) => G) => <R>(fa: ReaderEither<R, E, A>) => ReaderEither<R, G, A>, fromEither: <R, E, A>(ma: E.Either<E, A>) => ReaderEither<R, E, A>, fromOption: <E>(onNone: () => E) => <R, A>(ma: import("./Option").Option<A>) => ReaderEither<R, E, A>, fromPredicate: {
    <E, A, B extends A>(refinement: import("./function").Refinement<A, B>, onFalse: (a: A) => E): <U>(a: A) => ReaderEither<U, E, B>;
    <E, A>(predicate: import("./function").Predicate<A>, onFalse: (a: A) => E): <R>(a: A) => ReaderEither<R, E, A>;
}, filterOrElse: {
    <E, A, B extends A>(refinement: import("./function").Refinement<A, B>, onFalse: (a: A) => E): <R>(ma: ReaderEither<R, E, A>) => ReaderEither<R, E, B>;
    <E, A>(predicate: import("./function").Predicate<A>, onFalse: (a: A) => E): <R>(ma: ReaderEither<R, E, A>) => ReaderEither<R, E, A>;
};
export { alt, ap, apFirst, apSecond, bimap, chain, chainFirst, flatten, map, mapLeft, fromEither, fromOption, fromPredicate, filterOrElse };
