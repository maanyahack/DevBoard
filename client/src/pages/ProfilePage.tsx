import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { profileSchema, type ProfileValues } from '@/features/profile/schema';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();

  const currentName = (user?.user_metadata?.display_name as string | undefined) ?? '';
  const currentAvatar = (user?.user_metadata?.avatar_url as string | undefined) ?? '';

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    // Prefill with the user's existing values so the form is a real editor.
    values: { displayName: currentName, avatarUrl: currentAvatar },
  });

  const mutation = useMutation({
    mutationFn: updateProfile,
  });

  // Live preview of the avatar as the user types a URL.
  const watchedAvatar = watch('avatarUrl');
  const watchedName = watch('displayName');
  const previewName = watchedName || currentName || user?.email || 'User';
  const initials = previewName.trim().slice(0, 2).toUpperCase();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Profile</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Manage how you appear across DevNest.
      </p>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-8">
        {/* Avatar preview + identity */}
        <div className="flex items-center gap-4">
          {watchedAvatar ? (
            <img
              src={watchedAvatar}
              alt={previewName}
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-lg font-semibold text-emerald-700">
              {initials}
            </span>
          )}
          <div>
            <p className="font-medium text-slate-900 dark:text-slate-100">{previewName}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
          </div>
        </div>

        <div className="my-6 h-px bg-slate-100 dark:bg-slate-700" />

        <form
          onSubmit={handleSubmit((values) => mutation.mutate(values))}
          className="space-y-5"
          noValidate
        >
          <Input
            id="displayName"
            label="Display name"
            placeholder="Ada Lovelace"
            error={errors.displayName?.message}
            {...register('displayName')}
          />
          <Input
            id="avatarUrl"
            label="Avatar URL"
            placeholder="https://example.com/avatar.png"
            error={errors.avatarUrl?.message}
            {...register('avatarUrl')}
          />

          {mutation.isError && (
            <p className="text-sm text-red-500">{(mutation.error as Error).message}</p>
          )}
          {mutation.isSuccess && !isDirty && (
            <p className="text-sm text-emerald-600">Profile updated.</p>
          )}

          <div className="flex justify-end">
            <Button type="submit" isLoading={mutation.isPending} disabled={!isDirty}>
              Save changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
