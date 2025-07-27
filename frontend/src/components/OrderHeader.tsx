import {useCallback, useState} from "react";

interface OrderHeaderProps {
  transactionCode: string;
}

const OrderHeader: React.FC<OrderHeaderProps> = ({ transactionCode }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => {
        // можно добавить обработку ошибки
      });
  }, []);

  return (
    <div className="text-sm text-gray-600 mb-2 flex items-center gap-2">
      <span>Код сделки:</span>
      <button
        onClick={() => copyToClipboard(transactionCode)}
        className="font-medium text-brand underline hover:no-underline cursor-pointer focus:outline-none"
        title="Кликните, чтобы скопировать"
      >
        {transactionCode}
      </button>
      {copied && (
        <span className="text-xs text-brand">Скопировано!</span>
      )}
    </div>
  );
};

export default OrderHeader;