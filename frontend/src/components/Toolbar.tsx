import type { StrokeConfig } from '../types';
import './Toolbar.css';

function Toolbar({
  strokeConfig,
  setStrokeConfig,
}: {
  strokeConfig: StrokeConfig;
  setStrokeConfig: React.Dispatch<React.SetStateAction<StrokeConfig>>;
}) {
  return (
    <div className='toolbarDiv'>
      <input
        type='color'
        value={strokeConfig.color}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setStrokeConfig((prev) => ({ ...prev, color: e.target.value }));
        }}
      />
      <input
        type='number'
        value={strokeConfig.size}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setStrokeConfig((prev) => ({
            ...prev,
            size: parseInt(e.target.value),
          }));
        }}
      />
    </div>
  );
}

export default Toolbar;

