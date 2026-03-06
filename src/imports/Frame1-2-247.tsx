import svgPaths from "./svg-a20ng8n06i";
import imgCaptureDecran20260214A1801541 from "../assets/859db686667837a003e4abd3af73fc86e50a2f30.png";

const ALTITUDE_COLORS = ["#15803D", "#22C55E", "#84CC16", "#EAB308", "#F59E0B", "#F97316", "#DC2626"];
const ALTITUDE_SEGMENTS = [
  "M72.7051 93.75H0L4.65332 81.75H68.0518L72.7051 93.75Z",
  "M67.6885 80.8125H5.0166L9.66992 68.8125H63.0352L67.6885 80.8125Z",
  "M62.6719 67.875H10.0332L14.6865 55.875H58.0186L62.6719 67.875Z",
  "M57.6553 54.9375H15.0498L19.7031 42.9375H53.002L57.6553 54.9375Z",
  "M52.6387 42H20.0664L24.7197 30H47.9854L52.6387 42Z",
  "M47.6221 29.0625H25.083L29.7363 17.0625H42.9688L47.6221 29.0625Z",
  "M42.6055 16.125H30.0996L36.3525 0L42.6055 16.125Z",
];

const getAltitudeLevel = (altitude: number) => {
  if (altitude < 1500) return 0;
  if (altitude < 2500) return 1;
  if (altitude < 3500) return 2;
  if (altitude < 4500) return 3;
  if (altitude < 5500) return 4;
  if (altitude < 7000) return 5;
  return 6;
};

export function Component2({ className, bpmText = "-" }: { className?: string; bpmText?: string }) {
  return (
    <div className={className || "absolute h-[190.781px] left-[1196.51px] top-[724.92px] w-[430.219px]"} data-name="Component 3">
      <div className="absolute inset-[0.75%_-0.22%_-0.49%_2.38%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 420.928 190.289">
          <path d={svgPaths.p27b7a480} fill="var(--fill-0, #5F93AB)" fillOpacity="0.3" id="Vector 1" stroke="var(--stroke-0, #5F93AB)" strokeWidth="1.875" />
        </svg>
      </div>
      <div className="absolute inset-[-0.02%_12.6%_41.32%_62.53%]" data-name="heart">
        <div className="absolute flex inset-0 items-center justify-center">
          <div className="-rotate-45 flex-none size-[56px]">
            <div className="relative size-full" data-name="Union">
              <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 77.4482 77.4482">
                <g id="Union">
                  <mask fill="white" id="path-1-inside-1_2_136">
                    <path d={svgPaths.p31445200} />
                  </mask>
                  <path d={svgPaths.p215686c0} fill="var(--stroke-0, #C6FF8D)" mask="url(#path-1-inside-1_2_136)" />
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute inset-[2.6%_10.27%_38.17%_63.46%]" data-name="heart">
        <div className="absolute flex inset-0 items-center justify-center">
          <div className="-rotate-45 flex-none size-[56px]">
            <div className="relative size-full" data-name="Union">
              <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 79.9033 79.9033">
                <g id="Union">
                  <mask fill="white" id="path-1-inside-1_2_257">
                    <path d={svgPaths.p835f300} />
                  </mask>
                  <path d={svgPaths.p27557700} fill="var(--stroke-0, #7CA6B9)" mask="url(#path-1-inside-1_2_257)" />
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute inset-[36.14%_41.65%_11.97%_30.69%]" data-name="135">
        <svg className="block size-full overflow-visible" fill="none" preserveAspectRatio="none" viewBox="0 0 122.76 102.76">
          <text
            x="2"
            y="80"
            fill="white"
            fontFamily="Inter, Arial, sans-serif"
            fontSize="70"
            fontWeight="800"
            stroke="#5F93AB"
            strokeWidth="1.8"
            paintOrder="stroke fill"
          >
            {bpmText}
          </text>
          <text
            x="170"
            y="81"
            fill="white"
            fontFamily="Inter, Arial, sans-serif"
            fontSize="28"
            fontWeight="800"
            stroke="#5F93AB"
            strokeWidth="1.2"
            paintOrder="stroke fill"
          >
            BPM
          </text>
        </svg>
      </div>
    </div>
  );
}

export function Component3({
  className,
  timeText = "11:42",
  batteryText = "80",
}: {
  className?: string;
  timeText?: string;
  batteryText?: string;
}) {
  return (
    <div className={className || "absolute h-[94px] left-[1328.53px] top-[-2.13px] w-[298px]"} data-name="Component 4">
      <p
        className="absolute z-20 font-['Inter:Extra_Bold',sans-serif] font-extrabold inset-[0_28.86%_27.66%_11.74%] leading-[normal] not-italic text-[64px] whitespace-pre-wrap"
        style={{ color: "#FFFFFF", WebkitTextFillColor: "#FFFFFF", opacity: 1 }}
      >
        {timeText}
      </p>
      <div className="absolute z-20 inset-[13.83%_2.01%_58.51%_74.5%]" data-name="Vector">
        <div className="absolute inset-0 rounded-[12px] bg-[#9BD486] border border-[#9BD486] flex items-center justify-center">
          <span
            className="relative z-30 text-[#5F93AB] font-extrabold leading-none"
            style={{ fontFamily: "Inter, Arial, sans-serif", fontSize: "56px", transform: "scale(0.45)" }}
          >
            {batteryText}
          </span>
        </div>
      </div>
      <div className="absolute flex inset-[2.13%_0_0_0] items-center justify-center">
        <div className="-scale-y-100 flex-none h-[92px] w-[298px]">
          <div className="relative size-full">
            <div className="absolute inset-[-0.32%_-0.31%_-1.02%_1.94%]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 293.159 93.2294">
                <path d={svgPaths.p11e75100} fill="var(--fill-0, #5F93AB)" fillOpacity="0.3" id="Vector 3" stroke="var(--stroke-0, #5F93AB)" strokeWidth="1.875" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Vector({ className, altitudeText = "1878" }: { className?: string; altitudeText?: string }) {
  const parsedAltitude = Number(altitudeText);
  const activeLevel = Number.isFinite(parsedAltitude) ? getAltitudeLevel(Math.max(0, parsedAltitude)) : -1;

  return (
    <div className={className || "absolute h-[190.781px] left-[1.34px] top-[724.92px] w-[430.219px]"}>
      <div className="absolute flex inset-0 items-center justify-center">
        <div className="-scale-y-100 flex-none h-[190.781px] rotate-180 w-[430.219px]">
          <div className="relative size-full">
            <div className="absolute inset-[0.75%_-0.22%_-0.49%_2.38%]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 420.928 190.289">
                <path d={svgPaths.p27b7a480} fill="var(--fill-0, #5F93AB)" fillOpacity="0.3" id="Vector 2" stroke="var(--stroke-0, #5F93AB)" strokeWidth="1.875" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute inset-[38.21%_29.21%_12.26%_29.19%]" data-name="1878 M">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 182.719 98.25">
          <text
            x="6"
            y="76"
            fill="white"
            fontFamily="Inter, Arial, sans-serif"
            fontSize="64"
            fontWeight="800"
            stroke="#5F93AB"
            strokeWidth="1.7"
            paintOrder="stroke fill"
          >
            {altitudeText}
          </text>
          <text
            x="145"
            y="76"
            fill="white"
            fontFamily="Inter, Arial, sans-serif"
            fontSize="46"
            fontWeight="800"
            stroke="#5F93AB"
            strokeWidth="1.4"
            paintOrder="stroke fill"
          >
            M
          </text>
        </svg>
      </div>
      <div className="absolute inset-[38.6%_76.61%_12.26%_6.49%]" data-name="Subtract">
        <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 72.7051 93.75">
          <path d={svgPaths.p322bfd80} fill="var(--fill-0, #5F93AB)" fillOpacity="0.68" id="Subtract" />
        </svg>
      </div>
      <div className="absolute inset-[38.6%_76.61%_12.26%_6.49%]" data-name="Subtract">
        <div className="absolute inset-0">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 72.7051 93.75">
            {ALTITUDE_SEGMENTS.map((segmentPath, level) => {
              const isActive = level === activeLevel;
              const color = ALTITUDE_COLORS[level];
              return (
                <path
                  key={level}
                  d={segmentPath}
                  fill={isActive ? color : "#FFFFFF"}
                  fillOpacity={isActive ? 0.5 : 0.12}
                  stroke={isActive ? color : "#FFFFFF"}
                  strokeOpacity={isActive ? 1 : 0.45}
                  strokeWidth={1.5}
                />
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}

export function Component1({
  className,
  speedText = "-",
  maxSpeedText = "-",
  avgSpeedText = "-",
}: {
  className?: string;
  speedText?: string;
  maxSpeedText?: string;
  avgSpeedText?: string;
}) {
  return (
    <div className={className || "absolute h-[190.781px] left-[607.66px] top-[724.92px] w-[412.125px]"} data-name="Component 2">
      <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 412.125 190.781">
        <g id="Subtract">
          <mask fill="white" id="path-1-inside-1_2_132">
            <path d={svgPaths.p26107ff2} />
          </mask>
          <path d={svgPaths.p26107ff2} fill="var(--fill-0, #5F93AB)" fillOpacity="0.3" />
          <path d={svgPaths.p2bdf42c0} fill="var(--stroke-0, #5E92AB)" mask="url(#path-1-inside-1_2_132)" />
        </g>
      </svg>
      <div className="absolute inset-[7.64%_7%_1.74%_10.15%]" data-name="Vector">
        <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 341.438 172.875">
          <g id="Vector">
            <text
              x="171"
              y="86"
              fill="white"
              fontFamily="Inter, Arial, sans-serif"
              fontSize="84"
              fontWeight="800"
              stroke="#5F93AB"
              strokeWidth="1.8"
              paintOrder="stroke fill"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {speedText}
            </text>
            <path d={svgPaths.p5e28e70} fill="var(--fill-0, white)" />
            <path d={svgPaths.p3ab49ef0} fill="var(--fill-0, white)" />
            <path d={svgPaths.p33c92100} fill="var(--fill-0, white)" />
            <path d={svgPaths.p20742500} fill="var(--fill-0, white)" />
            <path d={svgPaths.p35246880} fill="var(--fill-0, white)" />
            <path d={svgPaths.p17047200} fill="var(--fill-0, white)" />
            <path d={svgPaths.p3b8e9f00} fill="var(--fill-0, white)" />
            <path d={svgPaths.p1cc1f880} fill="var(--fill-0, white)" />
            <path d={svgPaths.p3cb98b00} fill="var(--fill-0, white)" />
            <path d={svgPaths.p38e51400} fill="var(--fill-0, white)" />
            <text
              x="30"
              y="126"
              fill="white"
              fontFamily="Inter, Arial, sans-serif"
              fontSize="42"
              fontWeight="800"
              stroke="#5F93AB"
              strokeWidth="1.4"
              paintOrder="stroke fill"
              textAnchor="middle"
            >
              {maxSpeedText}
            </text>
            <text
              x="315"
              y="126"
              fill="white"
              fontFamily="Inter, Arial, sans-serif"
              fontSize="42"
              fontWeight="800"
              stroke="#5F93AB"
              strokeWidth="1.4"
              paintOrder="stroke fill"
              textAnchor="middle"
            >
              {avgSpeedText}
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
}

export function ComponentWeather({
  className,
  ambText = "--",
  corpText = "--",
}: {
  className?: string;
  ambText?: string;
  corpText?: string;
}) {
  return (
    <div className={className || "absolute h-[190.781px] left-[607.66px] top-[724.92px] w-[412.125px]"} data-name="Component Weather">
      <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 412.125 190.781">
        <g id="Subtract">
          <mask fill="white" id="path-1-inside-1_weather">
            <path d={svgPaths.p26107ff2} />
          </mask>
          <path d={svgPaths.p26107ff2} fill="var(--fill-0, #5F93AB)" fillOpacity="0.3" />
          <path d={svgPaths.p2bdf42c0} fill="var(--stroke-0, #5E92AB)" mask="url(#path-1-inside-1_weather)" />
        </g>
      </svg>
      <div className="absolute inset-[7.64%_7%_1.74%_10.15%]">
        <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 341.438 172.875">
          <g>
            <circle cx="171" cy="68" r="18" fill="white" fillOpacity="0.9" />
            <line x1="171" y1="34" x2="171" y2="44" stroke="white" strokeWidth="3" strokeLinecap="round" />
            <line x1="171" y1="92" x2="171" y2="102" stroke="white" strokeWidth="3" strokeLinecap="round" />
            <line x1="137" y1="68" x2="147" y2="68" stroke="white" strokeWidth="3" strokeLinecap="round" />
            <line x1="195" y1="68" x2="205" y2="68" stroke="white" strokeWidth="3" strokeLinecap="round" />
            <line x1="147" y1="44" x2="154" y2="51" stroke="white" strokeWidth="3" strokeLinecap="round" />
            <line x1="188" y1="85" x2="195" y2="92" stroke="white" strokeWidth="3" strokeLinecap="round" />
            <line x1="147" y1="92" x2="154" y2="85" stroke="white" strokeWidth="3" strokeLinecap="round" />
            <line x1="188" y1="51" x2="195" y2="44" stroke="white" strokeWidth="3" strokeLinecap="round" />
            <text
              x="44"
              y="126"
              fill="white"
              fontFamily="Inter, Arial, sans-serif"
              fontSize="34"
              fontWeight="800"
              stroke="#5F93AB"
              strokeWidth="1.4"
              paintOrder="stroke fill"
              textAnchor="middle"
            >
              {ambText}
            </text>
            <text
              x="298"
              y="126"
              fill="white"
              fontFamily="Inter, Arial, sans-serif"
              fontSize="34"
              fontWeight="800"
              stroke="#5F93AB"
              strokeWidth="1.4"
              paintOrder="stroke fill"
              textAnchor="middle"
            >
              {corpText}
            </text>
            <text
              x="44"
              y="156"
              fill="white"
              fontFamily="Inter, Arial, sans-serif"
              fontSize="20"
              fontWeight="800"
              stroke="#5F93AB"
              strokeWidth="1.2"
              paintOrder="stroke fill"
              textAnchor="middle"
            >
              AMB °C
            </text>
            <text
              x="298"
              y="156"
              fill="white"
              fontFamily="Inter, Arial, sans-serif"
              fontSize="20"
              fontWeight="800"
              stroke="#5F93AB"
              strokeWidth="1.2"
              paintOrder="stroke fill"
              textAnchor="middle"
            >
              CORP °C
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
}

export function Component({ className, mapSrc }: { className?: string; mapSrc?: string }) {
  return (
    <div className={className || "absolute left-[47.55px] size-[168.891px] top-[54.66px]"} data-name="Component 1">
      <div className="absolute inset-[-9.58%_-9.55%_-9.55%_-9.58%]">
        <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 201.188 201.188">
          <circle cx="100.594" cy="100.594" fill="var(--fill-0, #80BCD9)" id="Ellipse 4" r="100.594" />
        </svg>
      </div>
      <div className="absolute inset-[1.86%_1.89%_1.89%_1.86%]">
        <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 162.562 162.562">
          <circle cx="81.2812" cy="81.2812" fill="url(#paint0_radial_2_118)" fillOpacity="0.62" id="Ellipse 2" r="81.2812" />
          <defs>
            <radialGradient cx="0" cy="0" gradientTransform="translate(81.2812 81.2812) rotate(90) scale(59.8359)" gradientUnits="userSpaceOnUse" id="paint0_radial_2_118" r="1">
              <stop stopColor="#FFFEFE" />
              <stop offset="0.490385" stopColor="#4A798F" />
            </radialGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute flex h-[165.953px] items-center justify-center left-[54.71px] top-[-2.97px] w-[74.486px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
        <div className="flex-none rotate-[-105.76deg]">
          <div className="h-[31.213px] relative w-[163.627px]">
            <div className="absolute inset-[-14.18%_-1.94%_-12.35%_-1.33%]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 168.993 39.4924">
                <path d={svgPaths.p25565e80} id="Line 1" stroke="var(--stroke-0, #75FA8C)" strokeWidth="8.85938" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      {mapSrc ? (
        <div className="absolute inset-0 overflow-hidden rounded-full">
          <iframe
            title="hud-map-circle"
            src={mapSrc}
            className="absolute border-0"
            style={{
              inset: "-48%",
              width: "196%",
              height: "196%",
              pointerEvents: "none",
            }}
          />
        </div>
      ) : null}
      <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 168.891 168.891">
        <path d={svgPaths.p65ae500} fill="none" id="Subtract" stroke="white" strokeWidth="3" />
      </svg>
      <div className="absolute flex inset-[95.7%_41.13%_-8.91%_41.13%] items-center justify-center">
        <div className="flex-none h-[22.313px] rotate-180 w-[29.953px]">
          <div className="relative size-full">
            <div className="absolute bottom-1/4 left-[6.7%] right-[6.7%] top-0">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 25.9402 16.7344">
                <path d={svgPaths.p1843200} fill="var(--fill-0, white)" id="Polygon 3" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute flex inset-[41.13%_95.78%_41.13%_-8.99%] items-center justify-center">
        <div className="-rotate-90 flex-none h-[22.313px] w-[29.953px]">
          <div className="relative size-full">
            <div className="absolute bottom-1/4 left-[6.7%] right-[6.7%] top-0">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 25.9402 16.7344">
                <path d={svgPaths.p1843200} fill="var(--fill-0, white)" id="Polygon 3" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute flex inset-[41.13%_-8.6%_41.13%_95.39%] items-center justify-center">
        <div className="flex-none h-[22.313px] rotate-90 w-[29.953px]">
          <div className="relative size-full">
            <div className="absolute bottom-1/4 left-[6.7%] right-[6.7%] top-0">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 25.9402 16.7344">
                <path d={svgPaths.p1843200} fill="var(--fill-0, #C1364D)" fillOpacity="0.91" id="Polygon 2" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute inset-[-9.05%_41.13%_95.84%_41.13%]">
        <div className="absolute bottom-1/4 left-[6.7%] right-[6.7%] top-0">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 25.9402 16.7344">
            <path d={svgPaths.p1843200} fill="var(--fill-0, white)" id="Polygon 1" />
          </svg>
        </div>
      </div>
      <div className="absolute h-[27.866px] left-[70.59px] top-[71.58px] w-[27.697px]" data-name="Subtract">
        <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 27.6977 27.865">
          <path d={svgPaths.p20c22c00} fill="#5E92AB" id="Subtract" />
        </svg>
      </div>
      <p className="absolute font-['Inter:Extra_Bold',sans-serif] font-extrabold h-[15.375px] leading-[normal] left-[78.98px] not-italic text-[14.063px] text-white top-[3.14px] w-[10.922px] whitespace-pre-wrap">N</p>
      <p className="absolute font-['Inter:Extra_Bold',sans-serif] font-extrabold h-[15.375px] leading-[normal] left-[7.13px] not-italic text-[14.063px] text-white top-[77.81px] w-[10.922px] whitespace-pre-wrap">E</p>
      <p className="absolute font-['Inter:Extra_Bold',sans-serif] font-extrabold h-[15.375px] leading-[normal] left-[78.98px] not-italic text-[14.063px] text-white top-[147.98px] w-[10.922px] whitespace-pre-wrap">S</p>
      <p className="absolute font-['Inter:Extra_Bold',sans-serif] font-extrabold h-[15.375px] leading-[normal] left-[150.19px] not-italic text-[14.063px] text-white top-[77.81px] w-[10.922px] whitespace-pre-wrap">W</p>
    </div>
  );
}

export default function Frame() {
  return (
    <div className="relative size-full">
      <div className="absolute h-[915.75px] left-0 top-0 w-[1628.063px]" data-name="Capture d’écran 2026-02-14 à 18.01.54 1">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute h-[100.36%] left-0 max-w-none top-[-0.2%] w-full" src={imgCaptureDecran20260214A1801541} />
        </div>
      </div>
      <Component2 />
      <Component3 />
      <Vector />
      <Component1 />
      <Component />
    </div>
  );
}
