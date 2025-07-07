import React from 'react';

interface Props {
  stepNumber: number;
}

export const ORDINALS: Record<number,string> = {
  1: 'первом',
  2: 'втором',
  3: 'третьем',
  4: 'четвёртом',
  5: 'пятом',
  6: 'шестом',
  7: 'седьмом',
  8: 'восьмом',
};

export function ProgressBanner({ stepNumber }: Props) {
  return (
    <div className="bg-green-50 border-l-4 border-green-500 text-green-800 p-4 mb-6 rounded">
      <p className="font-semibold">
        Вы остановились на {ORDINALS[stepNumber]} шаге.
      </p>
      <p>Можете продолжить выкуп.</p>
    </div>
  );
}
