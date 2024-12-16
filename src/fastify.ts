import * as fst from 'fastify';

// These are all the possible type overrides a plugin can have
export type TypedPlugin = {
  fastify?: Record<string, unknown>;
  request?: Record<string, unknown>;
  reply?: Record<string, unknown>;
  // dependencies of this plugin
  deps?: TypedPlugin;
};

// Since an interface cannot extend a generic parameter field, we need to maintain two types:
// this one, and the "internal" interface with all actual declarations. This type will extend all plugin fields.
export type FastifyInstance<Plugin extends TypedPlugin = Record<never, never>> =
  InternalFastifyInstance<Plugin> & Plugin['fastify'];

// This demonstrates that by maintaining the above nomenclature, existing code can be reused partially.
// Some adjustments will be needed for generics.
export declare function safeFastify(): FastifyInstance;

// The internal interface needs to be defined as an interface to allow for assertions in return types.
export interface InternalFastifyInstance<Plugin extends TypedPlugin>
  extends fst.FastifyInstance {
  // Safe methods exist because the original Fastify instance includes these declarations.
  // Once typings are updated, these methods can be renamed to match the original method names.
  safeRegister<P extends TypedPlugin >(
    plugin: Plugin extends P['deps'] ? TypedFastifyPluginAsync<P> : never
  ): asserts this is FastifyInstance<P & Plugin>;

  safeDecorate<K extends string, P>(
    key: K,
    value: P
  ): asserts this is FastifyInstance<Plugin & { fastify: Record<K, P> }>;

  safeDecorateRequest<K extends string, P>(
    key: K,
    value: P
  ): asserts this is FastifyInstance<Plugin & { request: Record<K, P> }>;

  safeDecorateReply<K extends string, P>(
    key: K,
    value: P
  ): asserts this is FastifyInstance<Plugin & { reply: Record<K, P> }>;

  // This method can be removed along with AssertedFastifyRequest and AssertedFastifyReply
  safeGet(
    path: string,
    opts: fst.RouteShorthandOptions,
    handler: TypedRouteHandlerMethod<Plugin>
  ): void;
}

// Since request and reply are types, this modification could extend their respective types.
export type AssertedFastifyRequest<Plugin extends TypedPlugin> = fst.FastifyRequest &
  Plugin['request'];
export type AssertedFastifyReply<Plugin extends TypedPlugin> = fst.FastifyReply &
  Plugin['reply'];

// If request and reply types are updated, this would require adding another generic parameter to the original definition.
export type TypedRouteHandlerMethod<Plugin extends TypedPlugin = Record<never, never>> = (
  this: FastifyInstance<Plugin>,
  request: AssertedFastifyRequest<Plugin>,
  reply: AssertedFastifyReply<Plugin>
) => void;

// Similarly, a new generic parameter would need to be added here.
export type TypedFastifyPluginAsync<Plugin extends TypedPlugin = Record<never, never>> = (
  instance: FastifyInstance<Plugin>
) => Promise<void>;

// New helpers! (but obviously with better names xd)
export type PluginType<T extends TypedFastifyPluginAsync> =
  T extends TypedFastifyPluginAsync<infer P> ? Simplify<P> : never;

type Simplify<T> = { [Key in keyof T]: T[Key] };
