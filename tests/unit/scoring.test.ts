import { describe, expect, it, vi } from 'vitest';

import type { GradePayload } from '../../services/api';
import { DEFAULT_GRADES } from '../../services/constants';
import {
  getDefaultGrades,
  getGradeColor,
  getRankedGradeColor,
} from '../../services/grades';
import { getMajorityGrade } from '../../services/majorityJudgment';

const grade = (id: number, name: string, value: number): GradePayload => ({
  id,
  name,
  description: '',
  value,
});

describe('getMajorityGrade', () => {
  it('throws for an empty merit profile', () => {
    expect(() => getMajorityGrade({})).toThrow('Merit profile is empty');
  });

  it('returns the grade reached by an absolute majority', () => {
    expect(getMajorityGrade({ 0: 1, 1: 1, 2: 0, 3: 3 })).toBe(3);
  });

  it('favors the lower grade on an exact tie', () => {
    expect(getMajorityGrade({ 0: 1, 1: 1 })).toBe(0);
  });

  it('sorts numeric grade keys before counting', () => {
    expect(getMajorityGrade({ 4: 2, 1: 3 })).toBe(1);
  });

  it('handles a single grade', () => {
    expect(getMajorityGrade({ 6: 10 })).toBe(6);
  });
});

describe('grade helpers', () => {
  it('maps default grades to translated, descending values', () => {
    const translated = getDefaultGrades((key) => `translated:${key}`);

    expect(translated.map((item) => item.name)).toEqual(
      DEFAULT_GRADES.map((key) => `translated:${key}`)
    );
    expect(translated.map((item) => item.value)).toEqual(
      DEFAULT_GRADES.map((_, index) => DEFAULT_GRADES.length - 1 - index)
    );
    expect(translated.every((item) => item.active)).toBe(true);
  });

  it('returns the exact palette when all colors are used', () => {
    expect(getGradeColor(0, 7)).toBe('#990000');
    expect(getGradeColor(6, 7)).toBe('#3A9918');
  });

  it('centers a smaller palette', () => {
    expect(getGradeColor(0, 5)).toBe('#C23D13');
    expect(getGradeColor(4, 5)).toBe('#A0CF1C');
  });

  it('rejects more grades than colors', () => {
    expect(() => getGradeColor(0, 8)).toThrow('More grades');
  });

  it('ranks colors by grade value', () => {
    const grades = [
      grade(0, 'Low', 1),
      grade(1, 'Middle', 2),
      grade(2, 'High', 3),
    ];

    expect(getRankedGradeColor(0, grades)).toBe('#C27C13');
    expect(getRankedGradeColor(1, grades)).toBe('#C2B113');
    expect(getRankedGradeColor(2, grades)).toBe('#D3D715');
  });

  it('returns undefined for unknown grades', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    expect(getRankedGradeColor(0, [])).toBeUndefined();
    expect(getRankedGradeColor(-1, [grade(0, 'Only', 1)])).toBeUndefined();
    expect(warn).toHaveBeenCalled();
  });
});
