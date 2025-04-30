// ReferralGlowingButton.tsx
import React from 'react';
import styled, { keyframes } from 'styled-components';


// Анимация скользящего блика по тексту
const textShine = keyframes`
    0%   { background-position: -150% 0; }
    100% { background-position: 150% 0; }
`;


// Основная кнопка с псевдоэлементами для эффекта
const StyledButton = styled.button`
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 1rem 1.5rem;        /* text-lg */
    font-size: 1.125rem;         /* 18px */
    font-weight: 600;
    color: #6b7280;              /* gray-500 */
    background: linear-gradient(135deg, #ffffff, #f5f5f5);
    border: none;
    border-radius: 999px;
    cursor: pointer;
    overflow: hidden;



    /* Контейнер текста */
    & > span {
        position: relative;
        display: inline-block;
        z-index: 1;
        overflow: hidden;
    }

    /* Псевдоэлемент — градиентный блик текста */
    & > span::before {
        content: attr(data-text);
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent);
        background-size: 200% 100%;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        animation: ${textShine} 1.5s ease-out forwards;
        pointer-events: none;
    }
`;

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    onClick: () => void;
}

export const ReferralGlowingButton: React.FC<Props> = ({ onClick, className }) => (
        <StyledButton onClick={onClick} className={className}>
            <span data-text="Реферальная программа">Реферальная программа</span>
        </StyledButton>
);
