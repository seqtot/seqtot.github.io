import { MeasureInfo } from './types';

export function getBackgroundAlternateWidth(
  atomWidth: number,
  measure: MeasureInfo
): number {
  // const minAlternate = 100;
  // const maxAlternate = 200;

  // let alternate = (measure.atomInQuarter * measure.upper) / measure.lower;
  let atomInBar = measure.atomInQuarter * measure.upper;

  // If a measure is too big, try alternating with each beat
  // if (atomInBar * atomWidth > maxAlternate) {
  //   atomInBar /= measure.upper;
  //
  //   // If it's still to big, subdivide beat
  //   while (atomInBar * atomWidth > maxAlternate) atomInBar /= 2;
  // } else {
  //   // If it's too small, multiply measure by 2
  //   while (atomInBar * atomWidth < minAlternate) atomInBar *= 2;
  // }

  return atomInBar;
}
