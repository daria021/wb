import React from "react";

export interface NumericInputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    name: string;
    value: string;
    onValueChange: (field: string, value: string) => void;
}

export const NumericInput = React.forwardRef<HTMLInputElement, NumericInputProps>(
    (
        {
            name,
            value,
            onValueChange,
            onFocus,
            onKeyDown,
            className,
            ...rest
        },
        ref
    ) => {
        // при фокусе очищаем "0"
        const handleFocus: React.FocusEventHandler<HTMLInputElement> = (e) => {
            if (e.target.value === "0") {
                onValueChange(name, "");
            }
            onFocus?.(e);
        };

        // при вводе оставляем только цифры
        const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
            const digits = e.target.value.replace(/\D/g, "");
            onValueChange(name, digits);
            // курсор в конец
            window.requestAnimationFrame(() => {
                e.target.selectionStart = e.target.selectionEnd = e.target.value.length;
            });
        };

        return (
            <input
                ref={ref}
                name={name}
                value={value}
                type="text"
                inputMode="numeric"
                onFocus={handleFocus}
                onChange={handleChange}
                onKeyDown={onKeyDown}
                className={className}
                {...rest}
            />
        );
    }
);
