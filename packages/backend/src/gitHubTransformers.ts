import {
  TeamTransformer,
  UserTransformer,
  defaultUserTransformer,
} from '@backstage/plugin-catalog-backend-module-github';
import { createBackendModule } from '@backstage/backend-plugin-api';
import { githubOrgEntityProviderTransformsExtensionPoint } from '@backstage/plugin-catalog-backend-module-github-org';

// NOTE : this currently does not work because we aren't on GitHub Enterprise.
// I am keeping this around in case we ever switch
export const gitHubUserTransformer: UserTransformer = async (user, ctx) => {
  // invoke the default transformer
  const backstageUser = await defaultUserTransformer(user, ctx);

  // add the users email if it is a Tyler Tech email
  if (backstageUser && user.organizationVerifiedDomainEmails?.length) {
    backstageUser.spec.profile!.email = user.organizationVerifiedDomainEmails[0];
  }

  return backstageUser;
};

// Wrapping these functions in a Module allows us to inject them into the Catalog plugin easily
export default createBackendModule({
  pluginId: 'catalog',
  moduleId: 'github-org-extensions',
  register(env) {
    env.registerInit({
      deps: {
        githubOrg: githubOrgEntityProviderTransformsExtensionPoint,
      },
      async init({ githubOrg }) {
        githubOrg.setUserTransformer(gitHubUserTransformer);
      },
    });
  },
});
