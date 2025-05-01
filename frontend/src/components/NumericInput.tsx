// components/NumericInput.tsx

import React from 'react';

interface NumericInputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    name: string;
    value: string;
    onValueChange: (name: string, value: string) => void;
}

export function NumericInput({
                                 name,
                                 value,
                                 onValueChange,
                                 onFocus,
                                 ...rest // сюда попадут className, onKeyDown и т. д.
                             }: NumericInputProps) {

    const handleFocus: React.FocusEventHandler<HTMLInputElement> = e => {
        if (e.target.value === '0') {
            onValueChange(name, '');
        }
        onFocus?.(e);
    };

    const handleChange: React.ChangeEventHandler<HTMLInputElement> = e => {
        const digits = e.target.value.replace(/\D/g, '');
        // если пусто — сохраняем пустую строку
        onValueChange(name, digits);
        // ставим курсор в конец
        window.requestAnimationFrame(() => {
            const input = e.target as HTMLInputElement;
            input.selectionStart = input.selectionEnd = input.value.length;
        });
    };

    return (
        <input
            {...rest}
            name={name}
            type="text"
            inputMode="numeric"
            pattern="\d*"
            value={value}
            onFocus={handleFocus}
            onChange={handleChange}
        />
    );
}
