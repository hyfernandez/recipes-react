import type { Difficulty } from '../types/api'

// Record<Difficulty, string> forces one label per difficulty: if the backend adds a value to the
// Difficulty type, the compiler flags this object until the label is added.
const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
}

interface Props {
  difficulty: Difficulty
}

export function DifficultyBadge({ difficulty }: Props) {
  return <span className={`badge badge--${difficulty}`}>{DIFFICULTY_LABEL[difficulty]}</span>
}
