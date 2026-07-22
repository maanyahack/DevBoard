import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
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
    values: { displayName: currentName, avatarUrl: currentAvatar },
  });

  const mutation = useMutation({
    mutationFn: updateProfile,
  });

  const watchedAvatar = watch('avatarUrl');
  const watchedName = watch('displayName');
  const previewName = watchedName || currentName || user?.email || 'User';
  const initials = previewName.trim().slice(0, 2).toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto max-w-2xl"
    >
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Profile</h1>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">
        Manage how you appear across DevNest.
      </p>

      <div className="mt-8 card-highlight rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 shadow-[var(--shadow-card)] sm:p-8">
        {/* Avatar preview + identity */}
        <div className="flex items-center gap-4">
          <div className="group relative">
            {watchedAvatar ? (
              <img
                src={watchedAvatar}
                alt={previewName}
                className="h-16 w-16 rounded-full object-cover ring-2 ring-[var(--border-subtle)]"
              />
            ) : (
              <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-lg font-semibold text-emerald-700 ring-2 ring-emerald-200/60 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/20">
                {initials}
              </span>
            )}
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-slate-100">{previewName}</p>
            <p className="mt-0.5 text-sm text-[var(--text-secondary)]">{user?.email}</p>
          </div>
        </div>

        <div className="my-6 h-px bg-[var(--border-subtle)]" />

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

          <AnimatePresence>
            {mutation.isSuccess && !isDirty && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300"
              >
                <CheckCircle2 className="h-4 w-4" />
                Profile updated successfully.
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-end">
            <Button type="submit" isLoading={mutation.isPending} disabled={!isDirty}>
              Save changes
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
