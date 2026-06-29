import { Types } from 'mongoose';
import {
  getProjectParticipantIds,
  objectIdArrayIncludes,
  objectIdEquals,
  objectIdToString,
  userCanAccessProject,
} from './access.util';

describe('access utilities', () => {
  it('normalizes string, ObjectId, and populated document IDs', () => {
    const id = new Types.ObjectId();

    expect(objectIdToString(id)).toBe(id.toString());
    expect(objectIdToString(id.toString())).toBe(id.toString());
    expect(objectIdToString({ _id: id })).toBe(id.toString());
  });

  it('compares object IDs across common Mongoose shapes', () => {
    const id = new Types.ObjectId();

    expect(objectIdEquals(id, id.toString())).toBe(true);
    expect(objectIdEquals({ _id: id }, id.toString())).toBe(true);
    expect(objectIdArrayIncludes([new Types.ObjectId(), id], id.toString())).toBe(true);
  });

  it('allows project owners and members', () => {
    const ownerId = new Types.ObjectId();
    const memberId = new Types.ObjectId();

    const project = {
      owner: ownerId,
      members: [{ _id: memberId }],
    };

    expect(userCanAccessProject(project, ownerId.toString())).toBe(true);
    expect(userCanAccessProject(project, memberId.toString())).toBe(true);
    expect(userCanAccessProject(project, new Types.ObjectId().toString())).toBe(false);
  });

  it('returns unique participant IDs', () => {
    const ownerId = new Types.ObjectId();
    const memberId = new Types.ObjectId();

    expect(getProjectParticipantIds({
      owner: ownerId,
      members: [memberId, { _id: memberId }, ownerId],
    })).toEqual([ownerId.toString(), memberId.toString()]);
  });
});
