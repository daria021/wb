// ReferralGlowingButton.tsx
import React from 'react';
import styled, { keyframes } from 'styled-components';

// Анимация вращения конусного градиента бордера
const rotate360 = keyframes`
    to { transform: rotate(360deg); }
`;

// Анимация блика по тексту
const textShine = keyframes`
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
`;

// Стили кнопки с градиентным бордером
const StyledButton = styled.button`
    display: block;
    margin: 1rem auto;
    position: relative;
    padding: 1rem 1.5rem;
    font-size: 1.125rem;
    font-weight: 600;
    color: #6b7280;
    background: linear-gradient(135deg, #ffffff, #f5f5f5) padding-box;
    border-radius: 999px;
    border: 2px solid transparent;
    cursor: pointer;
    overflow: hidden;

    /* Градиентный бордер через псевдоэлемент */
    &::before {
        content: '';
        position: absolute;
        top: -2px;
        left: -2px;
        right: -2px;
        bottom: -2px;
        border-radius: inherit;
        border: 2px solid transparent;
        border-image: conic-gradient(
                rgba(255,255,255,0.6) 0deg,
                rgba(255,255,255,0)   90deg,
                rgba(255,255,255,0)   270deg,
                rgba(255,255,255,0.6) 360deg
        ) 1;
        animation: ${rotate360} 6s linear infinite;
        pointer-events: none;
        z-index: 0;
    }

    /* Контейнер для текста */
    & > span {
        position: relative;
        display: inline-block;
        z-index: 1;
    }

    /* Градиентный блик текста */
    & > span::after {
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
        animation: ${textShine} 3s ease-out forwards;
        pointer-events: none;
    }
`;


