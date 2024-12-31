import { HttpPostIngressEventPublisher } from '@backstage/plugin-events-backend';
import { Router } from 'express';
import { PluginEnvironment } from '../types';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  const eventsRouter = Router();

  const http = HttpPostIngressEventPublisher.fromConfig({
    config: env.config,
    events: env.events,
    logger: env.logger,
  });
  http.bind(eventsRouter);

  return eventsRouter;
}
