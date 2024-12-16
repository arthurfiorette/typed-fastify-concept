import { FastifyInstance, safeFastify, PluginType } from './fastify';
import { safeFp } from './fastify-plugin';

const innerPlugin = safeFp(async (instance: FastifyInstance) => {
  instance.safeDecorate('inner', true);
  return instance;
});

const outer = safeFp(async (instance: FastifyInstance) => {
  instance.safeDecorate('outer', true);
  instance.safeRegister(innerPlugin);
  return instance;
});

// Plugin authors would export their plugin and a typing for those who want to add it as a dependency to another plugin.
export type DependencyType = PluginType<typeof dependency>;
const dependency = safeFp(async (instance: FastifyInstance) => {
  instance.safeDecorate('dep', 321);
  return instance;
});

// anything that matches (instance: FastifyInstance<{ fastify: { dep: number } }>)
const withDependency = safeFp(async (instance: FastifyInstance<DependencyType>) => {
  // works!
  instance.dep;

  instance.safeDecorate('withDep', 'hello');

  return instance;
});

const instance: FastifyInstance = safeFastify();

instance.safeRegister(outer);

//@ts-expect-error - inner is not registered (yet)
instance.safeRegister(withDependency);

instance.safeRegister(dependency);

instance.safeRegister(withDependency);

instance.safeDecorateRequest('testReq', { num: 1 });

instance.safeDecorateReply('testRep', { str: '' });

// everything valid!
instance.safeGet('/', {}, function (request, reply) {
  this.inner;
  this.outer;
  this.dep;
  this.withDep;

  reply.testRep.str;
  request.testReq.num;
});
