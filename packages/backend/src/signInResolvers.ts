import { SignInResolver } from '@backstage/plugin-auth-node';
import { stringifyEntityRef, DEFAULT_NAMESPACE } from '@backstage/catalog-model';

export const tylerTechSignInResolver: SignInResolver = async (info, ctx) => {
  const { profile: { email } } = info;

  // Profiles are not always guaranteed to to have an email address.
  // You can also find more provider-specific information in `info.result`.
  // It typically contains a `fullProfile` object as well as ID and/or access
  // tokens that you can use for additional lookups.
  if (!email) {
    throw new Error('Login failed: user profile contained no email');
  }

  const [localPart, domain] = email.split('@');

  if (domain !== 'tylertech.com') {
    throw new Error(`Login failed: '${profile.email}' does not belong to the expected domain.`);
  }

  // `stringifyEntityRef` ensures the reference is correctly formatted
  const userEntity = stringifyEntityRef({
    kind: 'User',
    name: localPart,
    namespace: DEFAULT_NAMESPACE,
  });
  return ctx.issueToken({
    claims: {
      sub: userEntity,
      ent: [userEntity],
    },
  });
}
