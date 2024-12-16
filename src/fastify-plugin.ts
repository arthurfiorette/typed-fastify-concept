import {
  FastifyInstance,
  InternalFastifyInstance,
  TypedFastifyPluginAsync,
  TypedPlugin
} from './fastify';

// Updated declaration to infer the plugin type. This requires the plugin to return the modified instance.
// The same approach applies but includes extra unions to support both callback and async plugins.
export declare function safeFp<Plugin extends TypedPlugin>(
  factory: (scope: FastifyInstance) => Promise<InternalFastifyInstance<Plugin>>
): TypedFastifyPluginAsync<Plugin>;
