import { useRef } from 'react';
import { CanvasTools, type CanvasTool } from '../types';
import './Toolbar.css';

function Toolbar({
  toolType,
  setToolType,
  toolSize,
  setToolSize,
  strokeColor,
  setStrokeColor,
  onClear,
}: {
  toolType: CanvasTool;
  setToolType: React.Dispatch<React.SetStateAction<CanvasTool>>;
  toolSize: number;
  setToolSize: React.Dispatch<React.SetStateAction<number>>;
  strokeColor: string;
  setStrokeColor: React.Dispatch<React.SetStateAction<string>>;
  onClear: () => void;
}) {
  const colorPickerRef = useRef<HTMLInputElement>(null);
  return (
    <div className='toolbarDiv'>
      <input
        type='color'
        ref={colorPickerRef}
        value={strokeColor}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setStrokeColor(e.target.value);
        }}
      />
      <input
        type='number'
        value={toolSize}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setToolSize(parseFloat(e.target.value));
        }}
      />
      <div>
        <button
          onClick={() => {
            setToolType(CanvasTools.PEN);
          }}
        >
          P
        </button>
        <button
          onClick={() => {
            setToolType(CanvasTools.ERASER);
          }}
        >
          E
        </button>
        <button onClick={onClear}>
          Clear
        </button>
      </div>
    </div>
  );
}

export default Toolbar;

