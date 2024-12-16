import { FastifyInstance, safeFastify } from './fastify';
import { safeFp } from './fastify-plugin';

const innerPlugin = safeFp(async (instance: FastifyInstance) => {
  instance.safeDecorate('inner', true);
  return instance;
});

const plugin = safeFp(async (instance: FastifyInstance) => {
  instance.safeDecorate('outer', true);
  instance.safeRegister(innerPlugin);
  return instance;
});

const instance: FastifyInstance = safeFastify();

instance.safeRegister(plugin);

instance.safeDecorateRequest('testReq', { num: 1 });

instance.safeDecorateReply('testRep', { str: '' });

instance.safeGet('/', {}, function (request, reply) {
  // everything valid!
  this.inner;
  this.outer;
  reply.testRep.str;
  request.testReq.num;
});
