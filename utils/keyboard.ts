
import React from 'react';

/**
 * Handles the Enter key press on an input element to move focus to the next input.
 * Prevent default submission if it's a form.
 */
export const handleEnterKey = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter') {
        if (e.nativeEvent.isComposing) return;
        e.preventDefault();

        const form = e.currentTarget.closest('form') || document.body;
        const focusableElements = form.querySelectorAll(
            'input:not([disabled]):not([type="hidden"]), textarea:not([disabled]), select:not([disabled]), button:not([disabled])'
        );

        // Convert NodeList to Array
        const focusableArray = Array.from(focusableElements) as HTMLElement[];
        const currentIndex = focusableArray.indexOf(e.currentTarget as HTMLElement);

        if (currentIndex !== -1 && currentIndex < focusableArray.length - 1) {
            focusableArray[currentIndex + 1].focus();
        }
    }
};
