import React from 'react';
import styles from './index.module.css';

interface iTooltipProps {
    children: React.ReactNode;
    textTooltip: string;
}

export default function Tooltip({children, textTooltip}: iTooltipProps) {

    return (
        <div className={styles.tooltip}>
            {children}
            <span className={`${styles.tooltiptext} text-gray-900`}>{textTooltip}</span>
        </div>
    );
}
