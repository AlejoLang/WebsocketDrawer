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
  const sizePickerRef = useRef<HTMLInputElement>(null);
  return (
    <div className='toolbarDiv'>
      <input
        type='color'
        ref={colorPickerRef}
        value={strokeColor}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setStrokeColor(e.target.value);
          setToolType(CanvasTools.PEN);
        }}
      />
      <input
        type='number'
        value={toolSize}
        ref={sizePickerRef}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setToolSize(parseFloat(e.target.value));
        }}
        onWheel={(e: React.WheelEvent<HTMLInputElement>) => {
          if (!sizePickerRef.current) {
            return;
          }
          if (e.deltaY < 0) {
            sizePickerRef.current.value = (
              parseInt(sizePickerRef.current.value ?? 0) + 1
            ).toString();
          } else if (e.deltaY > 0) {
            sizePickerRef.current.value = (
              parseInt(sizePickerRef.current.value ?? 1) - 1
            ).toString();
          }
          setToolSize(parseFloat(sizePickerRef.current.value));
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
        <button onClick={onClear}>Clear</button>
      </div>
    </div>
  );
}

export default Toolbar;

