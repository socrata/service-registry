import * as MicrosoftGraph from '@microsoft/microsoft-graph-types';
import {
  defaultGroupTransformer,
  defaultUserTransformer,
  defaultOrganizationTransformer,
  microsoftGraphOrgEntityProviderTransformExtensionPoint,
  MicrosoftGraphProviderConfig,
} from '@backstage/plugin-catalog-backend-module-msgraph';
import {
  GroupEntity,
  UserEntity
} from '@backstage/catalog-model';
import {
  coreServices,
  createBackendModule
} from '@backstage/backend-plugin-api';
import * as teamOverrides from './config/teamOverrides.json'

// for a list of examples of things we could do here, look here:
// https://backstage.io/docs/integrations/azure/org/#transformer-examples

// TODO
// * modify providerConfigTransformer to get dynamic filtering of teams
// * modify organizationTransformer to return D&I as the default
// * modify userTransformer to link to GitHub User
//   * maybe that's better placed in the gitHubTransformers file though...

// The Group transformer transforms Groups that are ingested from MS Graph
// Here, we are mapping from the groups email to the actual team name.
export async function groupTransformer(
  group: MicrosoftGraph.Group,
  groupPhoto?: string,
): Promise<GroupEntity | undefined> {

  const backstageGroup = await defaultGroupTransformer(group, groupPhoto);

  if (!backstageGroup) return backstageGroup;


  // make the group names and displayNames nice for teams
  for (let i = 0; i < teamOverrides.length; i++) {
    let teamOverride = teamOverrides[i];
    if (backstageGroup.spec.profile.email.toLowerCase() != teamOverrides.email.toLowerCase()) {
      log.warn('CONTINUING!!!')
      log.warn(JSON.stringify(backstageGroup, null, 4));
      log.warn('');
      log.warn('');
      log.warn('');
      continue;
    }
    log.warn("found group: " + backstageGroup.spec.profile.email);
    log.warn("existing data");
    log.warn(JSON.stringify(backstageGroup, null, 4));
    log.warn("");
    log.warn("");
    log.warn("override data");
    log.warn(JSON.stringify(teamOverrides.overrides, null, 4));
    log.warn("");
    log.warn("");
    log.warn("resultant data");
    log.warn(JSON.stringify({ ...backstageGroup, ...teamOverrides.overrides }, null, 4));
    backstageGroup = { ...backstageGroup, ...teamOverrides.overrides };
  }

  return backstageGroup;
}

// The User transformer transforms Users that are ingested from MS Graph
export async function userTransformer(
  graphUser: MicrosoftGraph.User,
  userPhoto?: string,
): Promise<UserEntity | undefined> {
  const backstageUser = await defaultUserTransformer(graphUser, userPhoto);
  return backstageUser;
}

// The Organization transformer transforms the root MS Graph Organization into a Group
export async function organizationTransformer(
  graphOrganization: MicrosoftGraph.Organization,
): Promise<GroupEntity | undefined> {
  // If left up to the default org transformer, this will result in a base group
  // called tyler_technologies_inc which is never ingested.
  // So here we _should_ set the default group to the D&I group...
  // but I'm leaving that as a TODO for now and just setting undefined :shrug:

  // relevant documentation: https://backstage.io/docs/reference/plugin-catalog-backend-module-msgraph.microsoftgraphclient.getorganization/
  return undefined;
}

// The Provider Config transformer enables modification of the plugin config
export async function providerConfigTransformer(
  provider: MicrosoftGraphProviderConfig,
): Promise<MicrosoftGraphProviderConfig> {
  return provider;
}

// Wrapping these functions in a Module allows us to inject them into the Catalog plugin easily
export default createBackendModule({
  pluginId: 'catalog',
  moduleId: 'msgraph-org',
  register(reg) {
    reg.registerInit({
      deps: {
        microsoftGraphTransformers:
          microsoftGraphOrgEntityProviderTransformExtensionPoint,
        log: coreServices.logger
      },
      async init({ microsoftGraphTransformers, log }) {
        // Set the transformers to our custom functions
        microsoftGraphTransformers.setUserTransformer(userTransformer);
        microsoftGraphTransformers.setGroupTransformer(groupTransformer);
        microsoftGraphTransformers.setOrganizationTransformer(
          organizationTransformer,
        );
        microsoftGraphTransformers.setProviderConfigTransformer(
          providerConfigTransformer,
        );
      },
    });
  },
});
