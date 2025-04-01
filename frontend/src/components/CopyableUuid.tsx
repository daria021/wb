import React, { useState } from 'react';

interface CopyableUuidProps {
    uuid: string;
}

const CopyableUuid: React.FC<CopyableUuidProps> = ({ uuid }) => {
    const [copied, setCopied] = useState(false);
    const truncated = `${uuid.slice(0, 2)}...${uuid.slice(-2)}`;

    const handleClick = async () => {
        try {
            await navigator.clipboard.writeText(uuid);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Ошибка при копировании UUID', err);
        }
    };

    return (
        <span onClick={handleClick} className="relative inline-block cursor-pointer text-blue-600">
      {truncated}
            {copied && (
                <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded shadow-lg text-center">

                    Скопировано
                </div>
            )}
    </span>
    );
};

export default CopyableUuid;
