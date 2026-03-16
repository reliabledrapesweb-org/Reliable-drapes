"use client";

import { useState } from "react";
import type { Store } from "@/lib/actions/stores";

type IndiaStoreMapProps = {
  stores: Store[];
};

const STATE_COORDS: Record<string, { x: number; y: number }> = {
  "Jammu & Kashmir": { x: 150, y: 42 },
  "Jammu and Kashmir": { x: 150, y: 42 },
  "Himachal Pradesh": { x: 178, y: 80 },
  Punjab: { x: 152, y: 100 },
  Uttarakhand: { x: 215, y: 88 },
  Haryana: { x: 168, y: 118 },
  Delhi: { x: 182, y: 132 },
  "New Delhi": { x: 182, y: 132 },
  Rajasthan: { x: 118, y: 178 },
  "Uttar Pradesh": { x: 235, y: 158 },
  Bihar: { x: 300, y: 172 },
  "West Bengal": { x: 325, y: 218 },
  Jharkhand: { x: 295, y: 205 },
  Odisha: { x: 290, y: 258 },
  "Madhya Pradesh": { x: 205, y: 218 },
  Chhattisgarh: { x: 255, y: 252 },
  Gujarat: { x: 88, y: 235 },
  Maharashtra: { x: 162, y: 298 },
  Goa: { x: 138, y: 345 },
  Karnataka: { x: 165, y: 368 },
  Kerala: { x: 168, y: 428 },
  "Tamil Nadu": { x: 215, y: 408 },
  "Andhra Pradesh": { x: 225, y: 328 },
  Telangana: { x: 210, y: 295 },
  Assam: { x: 385, y: 162 },
  Meghalaya: { x: 370, y: 178 },
  Manipur: { x: 405, y: 182 },
  Mizoram: { x: 398, y: 205 },
  Nagaland: { x: 410, y: 168 },
  Tripura: { x: 380, y: 198 },
  Sikkim: { x: 342, y: 152 },
  "Arunachal Pradesh": { x: 405, y: 138 },
  Ladakh: { x: 160, y: 22 },
  Puducherry: { x: 228, y: 388 },
  Chandigarh: { x: 164, y: 92 },
};

const INDIA_OUTLINE =
  "M175 12 C185 8,198 18,194 38 L190 55 205 65 222 78 242 88 262 100 282 108 302 115 322 125 342 132 355 128 375 130 392 120 408 128 418 142 412 158 400 168 410 180 402 198 388 208 376 198 362 188 350 178 340 172 330 178 324 192 328 208 332 222 324 238 310 250 296 262 285 280 272 298 258 315 245 335 232 355 225 375 230 395 222 418 208 438 195 455 188 472 182 480 175 475 165 460 155 442 145 425 140 405 135 385 130 365 126 348 132 328 142 310 148 292 140 275 130 258 115 245 100 235 85 228 72 220 62 210 55 198 62 185 78 172 92 162 108 152 118 140 128 128 135 115 140 100 148 82 155 62 162 42 168 25Z";

export function IndiaStoreMap({ stores }: IndiaStoreMapProps) {
  const [tooltip, setTooltip] = useState<{
    state: string;
    count: number;
    x: number;
    y: number;
  } | null>(null);

  const storesByState = stores.reduce<Record<string, number>>((acc, store) => {
    if (store.state) {
      acc[store.state] = (acc[store.state] || 0) + 1;
    }
    return acc;
  }, {});

  const stateEntries = Object.entries(storesByState)
    .map(([state, count]) => {
      const coords = STATE_COORDS[state];
      if (!coords) return null;
      return { state, count, ...coords };
    })
    .filter(Boolean) as {
    state: string;
    count: number;
    x: number;
    y: number;
  }[];

  return (
    <div className="relative">
      <svg
        viewBox="0 0 470 500"
        className="mx-auto h-auto w-full max-w-md sm:max-w-lg"
        role="img"
        aria-label="Map of India showing store locations"
      >
        {/* India outline */}
        <path
          d={INDIA_OUTLINE}
          fill="#f3f0ff"
          stroke="#2F2582"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* State markers */}
        {stateEntries.map((entry) => (
          <g
            key={entry.state}
            onMouseEnter={() =>
              setTooltip({
                state: entry.state,
                count: entry.count,
                x: entry.x,
                y: entry.y,
              })
            }
            onMouseLeave={() => setTooltip(null)}
            onTouchStart={() =>
              setTooltip({
                state: entry.state,
                count: entry.count,
                x: entry.x,
                y: entry.y,
              })
            }
            onTouchEnd={() => setTooltip(null)}
            className="cursor-pointer"
          >
            {/* Pulse ring */}
            <circle
              cx={entry.x}
              cy={entry.y}
              r="10"
              fill="#2F2582"
              opacity="0.15"
              className="animate-ping"
              style={{ transformOrigin: `${entry.x}px ${entry.y}px` }}
            />
            {/* Dot */}
            <circle
              cx={entry.x}
              cy={entry.y}
              r="6"
              fill="#2F2582"
              stroke="white"
              strokeWidth="2"
            />
            {/* Store count badge */}
            {entry.count > 1 && (
              <text
                x={entry.x}
                y={entry.y + 1}
                textAnchor="middle"
                dominantBaseline="central"
                fill="white"
                fontSize="7"
                fontWeight="bold"
              >
                {entry.count}
              </text>
            )}
          </g>
        ))}
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg bg-gray-900 px-3 py-1.5 text-sm text-white shadow-lg"
          style={{
            left: `${(tooltip.x / 470) * 100}%`,
            top: `${(tooltip.y / 500) * 100}%`,
          }}
        >
          <p className="font-semibold">{tooltip.state}</p>
          <p className="text-xs text-gray-300">
            {tooltip.count} store{tooltip.count !== 1 ? "s" : ""}
          </p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
}
