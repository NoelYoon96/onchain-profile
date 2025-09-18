import { z } from 'zod';

export const PROFILE_SCHEMA_VERSION = '1';

export type ProfilePayload = {
  version: typeof PROFILE_SCHEMA_VERSION;
  address: string;
  handle: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  website?: string;
  twitter?: string;
  telegram?: string;
};

const optionalString = (limit?: number) => {
  const base = limit ? z.string().trim().max(limit) : z.string().trim();
  return base.optional().or(z.literal('')).optional();
};

export const profileSchema = z.object({
  version: z.string().optional(),
  address: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^0x[a-f0-9]{40}$/i, '유효한 이더리움 주소를 입력하세요.'),
  handle: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, '핸들은 최소 3자 이상이어야 합니다.')
    .max(32, '핸들은 32자 이하로 입력해주세요.')
    .regex(/^[a-z0-9-]+$/i, '영문, 숫자, 하이픈만 사용할 수 있어요.'),
  displayName: optionalString(64),
  bio: optionalString(200),
  avatarUrl: z
    .string()
    .trim()
    .url('올바른 URL을 입력하세요.')
    .optional()
    .or(z.literal(''))
    .optional(),
  website: z
    .string()
    .trim()
    .url('올바른 URL을 입력하세요.')
    .optional()
    .or(z.literal(''))
    .optional(),
  twitter: optionalString(),
  telegram: optionalString(),
});

export const signedProfileSchema = profileSchema.extend({
  signedAt: z.string().datetime({ message: '서명 시간이 올바르지 않습니다.' }),
  signature: z
    .string()
    .regex(/^0x[a-fA-F0-9]{130}$/u, '서명 값이 올바르지 않습니다.'),
});

export type ProfileInput = z.infer<typeof profileSchema>;
export type SignedProfileInput = z.infer<typeof signedProfileSchema>;

export function normalizeProfileInput(input: ProfileInput): ProfilePayload {
  const payload: ProfilePayload = {
    version: PROFILE_SCHEMA_VERSION,
    address: input.address.toLowerCase(),
    handle: input.handle.toLowerCase(),
  };

  const append = (key: keyof ProfilePayload, value?: string | null) => {
    const trimmed = value?.trim();
    if (trimmed) {
      payload[key] = trimmed;
    }
  };

  append('displayName', input.displayName ?? undefined);
  append('bio', input.bio ?? undefined);
  append('avatarUrl', input.avatarUrl ?? undefined);
  append('website', input.website ?? undefined);
  append('twitter', input.twitter ? input.twitter.replace(/^@/, '') : undefined);
  append('telegram', input.telegram ? input.telegram.replace(/^@/, '') : undefined);

  return payload;
}
