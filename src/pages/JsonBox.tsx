import { useState } from 'react';
import './Popup.css';

interface JsonBoxProps {
  jsonData: string;
}

export default function JsonBox({ jsonData }: JsonBoxProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonData);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Fehler beim Kopieren:", err);
    }
  };

  return (
    <div className='element_box json_box_container'>
      {/* Kopfzeile mit dem Copy-Button in der Ecke */}
      <div className='json_box_header'>
        <span className='json_box_label'>
          Playlist JSON
        </span>
        <div 
          onClick={handleCopy}
          className={`copy_btn ${copied ? 'copied' : ''}`}
        >
          {copied ? "Copied!" : "Copy"}
        </div>
      </div>

      {/* Die Textbox mit dem formatierten JSON-String */}
      <div className='json_content'>
        {jsonData}
      </div>
    </div>
  );
}