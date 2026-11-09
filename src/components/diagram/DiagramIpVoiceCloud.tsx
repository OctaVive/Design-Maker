import React from 'react';
import { SbcClusterSvg } from './diagramSvgs';
import { generateCloudPath } from './diagramGeometry';

export interface DiagramIpVoiceCloudProps {
  CORE_Y: number;
  TOTAL_WIDTH: number;
  ipVoiceAccessNetworkText: string;
  sbcClusterText: string;
  customSizes: Record<string, { scale?: number; width?: number; height?: number }>;
  customOffsets: Record<string, { x: number; y: number }>;
  startRightDrag: (id: string, e: React.MouseEvent) => void;
  startResizeDrag: (id: string, type: any, e: React.MouseEvent, currentScale?: number, baseW?: number, baseH?: number) => void;
  handleResetItemSize: (id: string) => void;
  resizeDragState: { id: string } | null;
  cloudW?: number;
  cloudCenterX?: number;
}

export function DiagramIpVoiceCloud({
  CORE_Y,
  TOTAL_WIDTH,
  ipVoiceAccessNetworkText,
  sbcClusterText,
  customSizes,
  customOffsets,
  startRightDrag,
  startResizeDrag,
  handleResetItemSize,
  resizeDragState,
  cloudW: cloudWProp,
  cloudCenterX: cloudCenterXProp,
}: DiagramIpVoiceCloudProps) {
  const sbcScale = customSizes['sbc-cluster']?.scale || 1;
  const cloudW = cloudWProp ?? Math.min(TOTAL_WIDTH - 60, 840);
  const cloudCenterX = cloudCenterXProp ?? (TOTAL_WIDTH / 2);
  const cloudH = 140;

  return (
    <div 
      className="absolute z-10 select-none"
      style={{ 
        top: CORE_Y, 
        left: `${cloudCenterX}px`,
        width: `${cloudW}px`,
        height: `${cloudH}px`,
        transform: 'translateX(-50%)'
      }}
    >
      <svg 
        width={cloudW} 
        height={cloudH} 
        viewBox={`0 0 ${cloudW} ${cloudH}`} 
        className="absolute inset-0 overflow-visible pointer-events-none"
      >
        <defs>
          <linearGradient id="ipVoiceCloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#dbeafe" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#bfdbfe" stopOpacity="0.85" />
          </linearGradient>
        </defs>
        <path 
          d={generateCloudPath(cloudW, cloudH)} 
          fill="url(#ipVoiceCloudGrad)"
          stroke="#2563eb" 
          strokeWidth="2.5" 
          style={{ filter: 'drop-shadow(0 4px 12px rgba(37, 99, 235, 0.15))' }}
        />
      </svg>

      {/* Gecentreerde titel met voldoende marge vanaf het SBC Cluster element */}
      <div className="absolute inset-y-0 left-[210px] right-6 flex items-center justify-center pointer-events-none z-15">
        <span className="text-2xl sm:text-3xl md:text-4xl text-slate-800 font-light select-none tracking-tight text-center">
          {ipVoiceAccessNetworkText}
        </span>
      </div>

      {/* SBC Cluster Node (AudioCodes Mediant™ 4000B) */}
      <div 
        className="absolute left-6 top-1/2 flex flex-col items-center select-none cursor-grab active:cursor-grabbing z-20 group/sbc"
        style={{
          transform: `translate(${customOffsets['sbc-cluster']?.x || 0}px, calc(-50% + ${customOffsets['sbc-cluster']?.y || 0}px))`,
        }}
        onMouseDown={e => startRightDrag('sbc-cluster', e)}
        onContextMenu={e => e.preventDefault()}
        title="SBC Cluster (AudioCodes Mediant™ 4000B)"
      >
        <div className="relative">
          <SbcClusterSvg width={175 * sbcScale} height={35 * sbcScale} />
          <div 
            onMouseDown={(e) => startResizeDrag('sbc-cluster', 'router', e, sbcScale, 175, 35)}
            onDoubleClick={(e) => {
              e.stopPropagation();
              handleResetItemSize('sbc-cluster');
            }}
            className="opacity-0 group-hover/sbc:opacity-100 transition-opacity absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 hover:bg-blue-600 border border-white rounded-full shadow cursor-nwse-resize z-40 flex items-center justify-center text-[9px] text-white"
            title="Sleep om SBC Cluster te vergroten of verkleinen (dubbelklik voor 100%)"
          >
            ⤡
          </div>
          {resizeDragState?.id === 'sbc-cluster' && (
            <div className="absolute -bottom-6 right-0 bg-slate-900 text-white text-[10px] font-mono px-1.5 py-0.5 rounded shadow pointer-events-none z-50 whitespace-nowrap">
              {Math.round(sbcScale * 100)}%
            </div>
          )}
        </div>
        <span className="text-xs font-bold text-slate-800 bg-transparent px-1 py-0.5 whitespace-nowrap mt-1 select-none">
          {sbcClusterText}
        </span>
      </div>
    </div>
  );
}
