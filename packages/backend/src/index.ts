import { createBackend } from '@backstage/backend-defaults';
//import { eventsModuleGithubEventRouter } from '@backstage/plugin-events-backend-module-github/alpha';
//import { eventsModuleGithubWebhook } from '@backstage/plugin-events-backend-module-github/alpha';
import { oktaAuthenticator } from '@backstage/plugin-auth-backend-module-okta-provider';
import { authProvidersExtensionPoint, createOAuthProviderFactory } from '@backstage/plugin-auth-node';

import {
  microsoftGraphOrgEntityProviderTransformExtensionPoint
} from '@backstage/plugin-catalog-backend-module-msgraph/alpha';

const backend = createBackend();

// TODO - do we still need the scaffolders?

backend.add(import('@backstage/plugin-app-backend'));
backend.add(import('@backstage/plugin-scaffolder-backend'));
backend.add(import('@backstage/plugin-scaffolder-backend-module-github'));
backend.add(import('@backstage/plugin-techdocs-backend'));

// auth plugin
backend.add(import('@backstage/plugin-auth-backend'));
backend.add(import('@backstage/plugin-auth-backend-module-okta-provider'));

// events plugin
// TODO - either remove these or re-enable
//      - (predicated on the TODOs on eventsModuleGithub...)
//backend.add(import('@backstage/plugin-events-backend'))

// catalog plugin
backend.add(import('@backstage/plugin-catalog-backend'));
backend.add(import('@backstage/plugin-catalog-backend-module-scaffolder-entity-model'));

// microsoft graph org module
backend.add(import('@backstage/plugin-catalog-backend-module-msgraph'));
// microsoft graph extensions (custom transformers)
backend.add(import('./microsoftGraphTransformers'));

// github org provider
backend.add(import('@backstage/plugin-catalog-backend-module-github'));
//backend.add(eventsModuleGithubEventRouter); // TODO - either remove these or re-enable
//backend.add(eventsModuleGithubWebhook);     // TODO - either remove these or re-enable
backend.add(import('@backstage/plugin-catalog-backend-module-github-org'));
// github org extensions (custom transformers)
backend.add(import('./gitHubTransformers'));

// See https://backstage.io/docs/features/software-catalog/configuration#subscribing-to-catalog-errors
// this enables logging of errors from the catalog
backend.add(import('@backstage/plugin-catalog-backend-module-logs'));

// permission plugin
backend.add(import('@backstage/plugin-permission-backend'));
// See https://backstage.io/docs/permissions/getting-started for how to create your own permission policy
backend.add(import('@backstage/plugin-permission-backend-module-allow-all-policy'));

// search plugin
backend.add(import('@backstage/plugin-search-backend'));

// search engine
// See https://backstage.io/docs/features/search/search-engines
backend.add(import('@backstage/plugin-search-backend-module-pg'));

// search collators
backend.add(import('@backstage/plugin-search-backend-module-catalog'));
backend.add(import('@backstage/plugin-search-backend-module-techdocs'));

backend.start();
