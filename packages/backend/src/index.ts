import { createBackend } from '@backstage/backend-defaults';
import { eventsModuleGithubEventRouter } from '@backstage/plugin-events-backend-module-github/alpha';
import { eventsModuleGithubWebhook } from '@backstage/plugin-events-backend-module-github/alpha';
import { createBackendModule } from '@backstage/backend-plugin-api';
import { githubOrgEntityProviderTransformsExtensionPoint } from '@backstage/plugin-catalog-backend-module-github-org';
import { oktaAuthenticator } from '@backstage/plugin-auth-backend-module-okta-provider';
import { authProvidersExtensionPoint, createOAuthProviderFactory } from '@backstage/plugin-auth-node';
import { tylerTechUserTransformer } from './transformers';
import { signInResolver } from './signInResolvers';

// create custom module to link up custom user transformers (for the catalog)
const githubOrgModule = createBackendModule({
  pluginId: 'catalog',
  moduleId: 'github-org-extensions',
  register(env) {
    env.registerInit({
      deps: {
        githubOrg: githubOrgEntityProviderTransformsExtensionPoint,
      },
      async init({ githubOrg }) {
        githubOrg.setUserTransformer(tylerTechUserTransformer);
      },
    });
  },
});


// create custom module to allow any tylertech email
// NOTE: someday we should remove this in favor of matching users in the catalog
const authModuleWithCustomResolver = createBackendModule({
  pluginId: 'auth',
  moduleId: 'auth-provider-allow-tylertech-skip-catalog',
  register(reg) {
    reg.registerInit({
      deps: { providers: authProvidersExtensionPoint },
      async init({ providers }) {
        providers.registerProvider({
          providerId: 'okta',
          factory: createOAuthProviderFactory({
            authenticator: oktaAuthenticator,
            signInResolver
          }),
        });
      },
    });
  },
});


const backend = createBackend();

// TODO - do we still need the scaffolders?

backend.add(import('@backstage/plugin-app-backend'));
backend.add(import('@backstage/plugin-scaffolder-backend'));
backend.add(import('@backstage/plugin-scaffolder-backend-module-github'));
backend.add(import('@backstage/plugin-techdocs-backend'));

// auth plugin
backend.add(import('@backstage/plugin-auth-backend'));
backend.add(authModuleWithCustomResolver);

// events plugin
backend.add(import('@backstage/plugin-events-backend'))

// catalog plugin
backend.add(import('@backstage/plugin-catalog-backend'));
backend.add(import('@backstage/plugin-catalog-backend-module-scaffolder-entity-model'));
backend.add(import('@backstage/plugin-catalog-backend-module-github'));

// github org provider
backend.add(eventsModuleGithubEventRouter);
backend.add(eventsModuleGithubWebhook);
backend.add(import('@backstage/plugin-catalog-backend-module-github-org'));
backend.add(githubOrgModule);

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
