import {
  TeamTransformer,
  UserTransformer,
  defaultUserTransformer,
} from '@backstage/plugin-catalog-backend-module-github';

// NOTE : this currently does not work because we aren't on GitHub Enterprise
// keeping this around in case we ever switch
export const tylerTechUserTransformer: UserTransformer = async (user, ctx) => {
  // invoke the default transformer
  const backstageUser = await defaultUserTransformer(user, ctx);

  // add the users email if it is a Tyler Tech email
  if (backstageUser && user.organizationVerifiedDomainEmails?.length) {
    backstageUser.spec.profile!.email = user.organizationVerifiedDomainEmails[0];
  }

  return backstageUser;
};

