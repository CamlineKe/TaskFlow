import Project from '../models/project.model';

type ProjectAccessShape = {
  owner?: unknown;
  members?: unknown[];
};

export const objectIdToString = (value: unknown): string => {
  if (!value) {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  const maybeObjectId = value as { toHexString?: () => string };
  if (typeof maybeObjectId.toHexString === 'function') {
    return maybeObjectId.toHexString();
  }

  const maybeDocument = value as { _id?: unknown; toString?: () => string };
  if (maybeDocument._id && maybeDocument._id !== value) {
    return objectIdToString(maybeDocument._id);
  }

  if (typeof maybeDocument.toString === 'function') {
    return maybeDocument.toString();
  }

  return '';
};

export const objectIdEquals = (left: unknown, right: unknown): boolean =>
  objectIdToString(left) === objectIdToString(right);

export const objectIdArrayIncludes = (values: unknown[] | undefined, id: unknown): boolean =>
  Array.isArray(values) && values.some((value) => objectIdEquals(value, id));

export const userCanAccessProject = (
  project: ProjectAccessShape | null | undefined,
  userId: string
): boolean => {
  if (!project) {
    return false;
  }

  return objectIdEquals(project.owner, userId) || objectIdArrayIncludes(project.members, userId);
};

export const getProjectParticipantIds = (
  project: ProjectAccessShape | null | undefined
): string[] => {
  if (!project) {
    return [];
  }

  const ids = [
    objectIdToString(project.owner),
    ...(project.members || []).map(objectIdToString),
  ].filter(Boolean);

  return [...new Set(ids)];
};

export const getAuthorizedProject = async (
  projectId: string,
  userId: string,
  select = '_id owner members board'
) =>
  Project.findOne({
    _id: projectId,
    $or: [{ owner: userId }, { members: userId }],
  })
    .select(select)
    .lean();
