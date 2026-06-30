import type { QueryClient } from '@tanstack/react-query';

export const queryKeys = {
  dashboard: ['dashboard'] as const,
  projects: ['projects'] as const,
  project: (projectId: string) => ['project', projectId] as const,
  tasks: ['tasks'] as const,
  task: (taskId: string | null) => ['task', taskId] as const,
  board: (projectId: string) => ['board', projectId] as const,
  userProfile: ['user-profile'] as const,
  userStats: ['user-stats'] as const,
};

export function invalidateTaskViews(
  queryClient: QueryClient,
  options: { projectId?: string; taskId?: string | null } = {}
) {
  const { projectId, taskId } = options;

  queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
  queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });

  if (projectId) {
    queryClient.invalidateQueries({ queryKey: queryKeys.project(projectId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.board(projectId) });
  }

  if (taskId) {
    queryClient.invalidateQueries({ queryKey: queryKeys.task(taskId) });
  }
}
