import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { DoubleSide, type Group } from "three";
import { Alloy, Board, Fan, MemoryStick } from "./CoreVisualParts";
import GpuAsset from "./GpuAsset";
import CorePeripheralAsset from "./CorePeripheralAsset";
import CoreCoolingAssembly from "./CoreCoolingAssembly";
import CoreCableHarness from "./CoreCableHarness";
import { DesktopScreen, EngravedLabel, PerforatedMesh } from "./CoreSurfaceDetails";
import { PART_BY_ID } from "./coreModel";
import type { Build } from "./coreModel";
import type { CoreModule } from "./CoreScene";

type Props = {
  build: Build;
  module: CoreModule;
  onChoose: (module: Exclude<CoreModule,"hub">) => void;
  accent: string;
  secondary: string;
  animated: boolean;
};

const FASTENERS = [-1, 1];
const GPU_FINS = Array.from({length: 12}, (_, i) => -0.57 + i * 0.103);

/** Premium procedural concept model, not a licensed GLB nor a replica of the user's unverified case. */
export default function DetailedComputer({ build, module, onChoose, accent, secondary, animated }: Props) {
  const floating = useRef<Group>(null);
  const gpuName = build.gpu ? PART_BY_ID[build.gpu]?.name || "GPU demonstrativa" : "Não instalada";
  const cpuName = build.cpu ? PART_BY_ID[build.cpu]?.name || "CPU demonstrativa" : "Não instalada";
  const boardSocket = build.motherboard ? PART_BY_ID[build.motherboard]?.socket || "Sem soquete" : "Sem placa";
  useFrame((state, dt) => {
    if (!floating.current || !animated) return;
    floating.current.position.y +=
      (-0.12 + Math.sin(state.clock.elapsedTime * 0.72) * 0.030 - floating.current.position.y)
      * Math.min(dt * 2, 1);
    floating.current.rotation.y +=
      (-0.20 + Math.sin(state.clock.elapsedTime * 0.28) * 0.048 - floating.current.rotation.y)
      * Math.min(dt * 1.1, 1);
  });

  return (
    <group ref={floating} position={[-0.53,-0.12,0.03]} rotation={[0,-0.20,0]}>
      <group>
        {/* Open cutaway chassis: the closed GLB hid educational internals. */}
        {/* Chassis: rounded corners, lower chamber, open glass side and front mesh strips. */}
        <Alloy position={[0, 0, -0.61]} size={[1.72, 2.48, 0.13]} color="#28323d" radius={0.045} />
        <Alloy position={[-0.84, 0, -0.02]} size={[0.11, 2.48, 1.30]} color="#27313e" radius={0.035} />
        <Alloy position={[0.84, 0, -0.02]} size={[0.11, 2.48, 1.30]} color="#252e39" radius={0.035} />
        {/* Open top cage: the previous solid roof covered the 360mm radiator. */}
        {[-0.78, 0.78].map(x => (
          <Alloy key={"top-x-rail-" + x} position={[x,1.245,-0.02]}
            size={[0.08,0.115,1.29]} color="#414d59" radius={0.024}/>
        ))}
        {[-0.59, 0.59].map(z => (
          <Alloy key={"top-z-rail-" + z} position={[0,1.245,z]}
            size={[1.55,0.115,0.08]} color="#414d59" radius={0.024}/>
        ))}
        <Alloy position={[0, -1.24, -0.02]} size={[1.78, 0.12, 1.30]} color="#202933" radius={0.035}/>
        {/* PSU chamber shields the bright generic PSU material from the main showcase. */}
        <Alloy position={[0, -0.99, 0.03]} size={[1.60, 0.39, 1.06]} color="#151b24"/>
        <Alloy position={[0,-0.77,0.54]} size={[1.55,0.018,0.08]} color="#566778" radius={0.007}/>
        <Alloy position={[0, -1.14, 0.41]} size={[1.60, 0.026, 0.20]} color="#73818d" radius={0.004}/>
        {[-0.61, 0.61].map(x => <Alloy key={"foot-"+x} position={[x, -1.34, -0.31]}
          size={[0.24,0.11,0.42]} color="#161d28" />)}

        {/* Structural gaskets and polished rails, without hiding hardware. */}
        {[-0.73,0.73].map(x=>
          <Alloy key={"case-gasket-"+x} position={[x,0,0.545]} size={[0.025,2.18,0.022]}
            color="#171e29" radius={0.005} roughness={0.8}/>)}
        {[-1.15,1.15].map(y=>
          <Alloy key={"case-gasket-end-"+y} position={[0,y,0.548]}
            size={[1.49,0.023,0.025]} color="#1b2732" radius={0.004}/>)}
        {/* Curved vertical rails and tinted glass; no hit-test on glass to preserve direct selection. */}
        {[-0.77, 0.77].map(x => (
          <group key={"side-"+x}>
            <Alloy position={[x, 0, 0.57]} size={[0.053,2.32,0.085]} color="#778995" radius={0.021}/>
            <Alloy position={[x, 0, 0.615]} size={[0.017,2.24,0.013]}
              color="#bbc4ce" radius={0.004} metalness={0.92}/>
          </group>
        ))}
        {[1.15, -1.15].map(y => (
          <Alloy key={"edge-"+y} position={[0,y,0.57]} size={[1.58,0.045,0.09]}
            color="#6e7e8b" radius={0.012}/>
        ))}
        <mesh position={[0, 0, 0.628]} raycast={() => {}}>
          <planeGeometry args={[1.50, 2.24]}/>
          <meshPhysicalMaterial color="#90a9b9" transparent opacity={0.09}
            roughness={0.08} metalness={0.15} depthWrite={false} side={DoubleSide}/>
        </mesh>
        <mesh position={[-0.47, 0.06, 0.635]} rotation={[0,0,-0.13]} raycast={()=>{}}>
          <planeGeometry args={[0.018, 2.0]}/>
          <meshBasicMaterial color="#cedce4" transparent opacity={0.27} depthWrite={false}/>
        </mesh>
        {FASTENERS.flatMap(x => FASTENERS.map(y => (
          <mesh key={"glass-screw-"+x+"-"+y} position={[x*0.735,y*1.10,0.636]}>
            <circleGeometry args={[0.022, 12]}/>
            <meshStandardMaterial color="#c6d0d5" metalness={0.9} roughness={0.25}/>
          </mesh>
        )))}

        {/* Rear plate remains comprehensible when rotating behind the computer. */}
        <group position={[0,0,-0.692]}>
          <Alloy position={[-0.46,0.79,-0.013]} size={[0.56,0.48,0.027]} color="#3c4954"/>
          {Array.from({length:6},(_,i)=>
            <Alloy key={"io-"+i} position={[-0.67+(i%2)*.22,0.96-Math.floor(i/2)*.135,-0.038]}
              size={[0.125,0.056,0.018]} color={i===5?"#8db2b6":"#101a25"} radius={0.006}/>)}
          {Array.from({length:8},(_,i) =>
            <Alloy key={"rear-grill-"+i} position={[0.37,0.96-i*.064,-0.028]}
              size={[0.47,0.022,0.016]} color="#74818b" radius={0.006}/>)}
          <Alloy position={[0.27,-0.37,-0.015]} size={[0.87,0.67,0.036]} color="#313d49"/>
          {Array.from({length:7},(_,i)=>
            <Alloy key={"pci-"+i} position={[0.27,-0.08-i*.086,-0.041]}
              size={[0.69,0.027,0.012]} color={i%2?"#88929a":"#586876"} radius={0.006}/>)}
          <Alloy position={[-0.38,-0.90,-0.015]} size={[0.69,0.36,0.030]} color="#3b4651" />
          {Array.from({length:9},(_,i)=>
            <Alloy key={"power-grill-"+i} position={[-0.65+(i%3)*.27,-0.78-Math.floor(i/3)*.09,-0.044]}
              size={[0.11,0.025,0.015]} color="#111c29" radius={0.005}/>)}
          {[-.72,.72].flatMap(x=>[-1.12,1.12].map(y=>
            <Alloy key={"rear-bolt-"+x+"-"+y} position={[x,y,-0.02]}
              size={[0.054,0.054,0.018]} color="#9babb2" radius={0.02}/>))}
        </group>

        {/* Front-face intake: 3 real impellers, filtered mesh and status line. */}
        <group position={[0.91,0,-0.09]} rotation={[0,Math.PI/2,0]}>
          <Alloy position={[0,0,-0.035]} size={[1.12,2.19,0.07]} color="#101923" radius={0.06}/>
          {[0.72,0,-0.72].map((y,i) => (
            <Fan key={"front-fan-"+i} position={[0,y,0.057]} radius={0.286}
              accent={i===1?secondary:accent} animated={animated} speed={0.53}/>
          ))}
          {[0.06,0.56,-0.56,1.07,-1.07].map(y=>
            <Alloy key={"front-divider-"+y} position={[0,y,0.130]} size={[1.03,0.020,0.025]}
              color="#8e9da4" radius={0.006}/>)}
          <Alloy position={[0.41,0,0.133]} size={[0.026,2.06,0.027]} color="#7f8f9b" radius={0.007}/>
          <Alloy position={[-0.41,0,0.133]} size={[0.026,2.06,0.027]} color="#7f8f9b" radius={0.007}/>
          <PerforatedMesh position={[0,0,0.155]} size={[1.02,2.05]} opacity={0.58}/>
          <EngravedLabel position={[0,-1.12,0.15]} size={[0.52,0.092]}
            title="ENGINEERING" subtitle="CORE / AIO-360" accent={secondary}/>
        </group>
        {/* Filtered steel top grille: image-backed mesh, not hundreds of extra polygons. */}
        <PerforatedMesh position={[0,1.315,-0.38]} rotation={[-Math.PI/2,0,0]}
          size={[1.31,0.40]} opacity={0.72}/>
                {/* Power button and case top I/O details. */}
        <mesh position={[0.55,1.306,0.29]} rotation={[-Math.PI/2,0,0]}>
          <torusGeometry args={[0.046,0.010,6,25]}/>
          <meshBasicMaterial color={secondary}/>
        </mesh>
        {[-0.36,-0.15,0.08].map(x=>
          <Alloy key={"top-port-"+x} position={[x,1.305,0.39]}
            size={[0.12,0.012,0.055]} color="#0c1825" radius={0.01}/>)}

        {/* Extra real-world construction cues without creating dynamic simulations. */}
        <EngravedLabel position={[-0.49,1.136,0.63]} size={[0.52,0.10]}
          title="THE CORE" subtitle="ENGINEERING LAB" accent={accent}/>
        {/* Fully detailed, top-mounted 360 mm AIO, independent of the generic case GLB. */}
        <CoreCoolingAssembly accent={accent} secondary={secondary} animated={animated}
          installed={Boolean(build.cpu)} onInspect={() => onChoose("overclock")}/>

                {/* Motherboard mounting points, traces and heatsink assembly. */}
        {build.motherboard && (
          <group position={[-0.22,0.13,-0.44]} onClick={event=>{event.stopPropagation();onChoose("assembly");}}>
            {/* Visible educational AM board instead of generic LGA/DDR5 GLB. */}
            <Board accent={secondary}/>
            {/* Printed identifiers remain part of the board, not a floating UI overlay. */}
            <EngravedLabel position={[-0.28,-0.07,0.16]} size={[0.36,0.09]}
              title={boardSocket+" BOARD"} subtitle="DEMO PLATFORM" accent={accent}/>
            <Alloy position={[0.18,0.56,0.138]} size={[0.16,0.60,0.12]} color="#4e6271"/>
            <Alloy position={[-0.24,-0.62,0.14]} size={[0.32,0.24,0.12]} color="#5b6975"/>
          </group>
        )}

        {/* DDR modules with cutouts and metal edge contacts. */}
        {build.memory && (
          <group onClick={event=>{event.stopPropagation();onChoose("assembly");}}>
            <CorePeripheralAsset kind="ram" enabled={build.memory === "ddr5"} position={[0.24,0.46,-0.23]}>
            {[0.16,0.32].map((x,i) =>
              <MemoryStick key={"ram-"+i} position={[x,0.46,-0.23]}
                accent={accent} secondary={secondary}/>)}
            </CorePeripheralAsset>
          </group>
        )}

        {/* GPU: layered shroud, dual fans, fin stack, PCB, heat pipes, backplate and power connector. */}
        {build.gpu && (
          <group position={[0.02,-0.39,0.05]}
            onClick={event=>{event.stopPropagation();onChoose("overclock");}}>
            <GpuAsset>
            <Alloy position={[0,0,-0.21]} size={[1.43,0.51,0.045]} color="#1b3638" radius={0.025}/>
            <Alloy position={[0,0,-0.16]} size={[1.48,0.56,0.038]} color="#83909a" radius={0.03}/>
            <Alloy position={[0,0,-0.09]} size={[1.48,0.47,0.18]} color="#667681" radius={0.026}/>
            {GPU_FINS.map(x=>
              <Alloy key={"heatsink-fin-"+x} position={[x,-0.11,0.034]}
                size={[0.025,0.35,0.15]} color="#aab5bc" radius={0.005}/>)}
            <Alloy position={[0,0,0.126]} size={[1.55,0.48,0.20]} color="#101a25" radius={0.06}/>
            <Alloy position={[0,0.23,0.165]} size={[1.42,0.035,0.12]} color="#a6abb0"/>
            <Alloy position={[0,-0.235,0.15]} size={[1.42,0.028,0.14]} color="#87929d"/>
            {[-0.39,0.39].map(x=>
              <Fan key={"gpu-fan-"+x} position={[x,0,0.252]} radius={0.192}
                accent={secondary} animated={animated} speed={0.45} variant="gpu"/>)}
            <Alloy position={[0,0.31,0.13]} size={[1.31,0.028,0.02]} color={accent} radius={0.005} emissive={accent}/>
            <EngravedLabel position={[0,0.325,0.245]} size={[0.82,0.16]}
              title={gpuName} subtitle="GDDR / PCI EXPRESS" accent={secondary}/>
            <Alloy position={[0,-0.29,-0.16]} size={[1.34,0.018,0.032]} color="#c3c6cb" radius={0.005}/>
            {[-0.54,-0.32,-0.10,0.12,0.34,0.55].map((x) => (
              <Alloy key={"gpu-backplate-slot-"+x} position={[x,-0.13,-0.242]}
                size={[0.035,0.15,0.010]} color="#53616a" radius={0.006}/>
            ))}
            {[-0.63,0.63].flatMap(x=>[-0.17,0.17].map(y=>(
              <Alloy key={"gpu-fastener-"+x+"-"+y} position={[x,y,0.242]}
                size={[0.037,0.037,0.015]} color="#b6bfc6" radius={0.013}/>
            )))}
            <Alloy position={[0.62,0.3,-0.14]} size={[0.18,0.15,0.17]} color="#151d29"/>
            {Array.from({length:6},(_,i)=>
              <Alloy key={"gpu-pin-"+i} position={[0.55+i*0.025,0.38,-0.12]}
                size={[0.013,0.025,0.03]} color="#b99d68" radius={0.003}/>)}
            <Alloy position={[-0.72,0,-0.11]} size={[0.045,0.59,0.24]} color="#8e969b"/>
            <Alloy position={[0.70,0,-0.11]} size={[0.04,0.59,0.24]} color="#8e969b"/>
            </GpuAsset>
            {/* External anodized trim stays visible around the self-hosted GLB. */}
            <Alloy position={[0,0.266,0.072]} size={[1.36,0.021,0.048]}
              color="#8696a1" radius={0.005} metalness={0.84}/>
            <Alloy position={[0,0.277,0.088]} size={[0.79,0.009,0.041]}
              color={accent} radius={0.003} emissive={accent}/>
            {[-0.65,0.65].map(x=>
              <Alloy key={"gpu-corner-trim-"+x} position={[x,-0.012,0.165]}
                size={[0.035,0.48,0.020]} color="#637381" radius={0.009}/>)}
            <EngravedLabel position={[0,-0.258,0.227]} size={[0.72,0.075]}
              title={gpuName} subtitle="GRAPHICS / CONCEPT" accent={secondary}/>
          </group>
        )}
        {/* The GPU power cable is now routed behind the motherboard. */}
        {/* PSU is nested into the shroud rather than floating in front of the glass. */}
        {build.psu && (
          <group onClick={event=>{event.stopPropagation();onChoose("assembly");}}>
            <CorePeripheralAsset kind="psu" position={[-0.29,-0.95,-0.26]}>
            <Alloy position={[-0.29,-0.95,-0.26]} size={[0.90,0.42,0.50]} color="#222b35"/>
            <Alloy position={[-0.29,-0.95,0.015]} size={[0.78,0.30,0.021]} color="#303d49"/>
            {Array.from({length:9},(_,i)=>
              <Alloy key={"psu-grille-"+i} position={[-0.59+(i%3)*0.29,-0.83-Math.floor(i/3)*0.11,0.029]}
                size={[0.14,0.022,0.012]} color="#8897a0" radius={0.004}/>)}
            <Alloy position={[-0.29,-1.15,0.020]} size={[0.73,0.018,0.016]} color="#a7b2ba" radius={0.003}/>
            <EngravedLabel position={[-0.29,-0.95,0.037]} size={[0.59,0.12]}
              title="GX / 700W" subtitle="PSU  /  DEMO" accent={secondary}/>
            </CorePeripheralAsset>
          </group>
        )}
        {/* Individually sleeved power cables, combs and illustrative plugs. */}
        <CoreCableHarness installed={Boolean(build.psu)} accent={secondary}/>

        {/* Three small shields and indicators make the system recognizable even at overview scale. */}
        <Alloy position={[0.61,-0.88,0.14]} size={[0.23,0.13,0.28]} color="#35414b"/>
        <Alloy position={[0.63,-1.01,0.17]} size={[0.19,0.02,0.11]} color={secondary} radius={0.008}/>
      </group>

      {/* The monitor base now meets an actual support rather than floating above the stage. */}
      <Alloy position={[1.56,-1.39,-0.25]} size={[1.27,0.12,0.68]}
        color="#202b37" radius={0.037}/>
      <Alloy position={[1.65,-1.322,-0.25]} size={[1.00,0.018,0.59]}
        color="#647381" radius={0.006}/>
      {/* Main interactive monitor: detailed rear + layered front screen and Hyprland mini-desktop. */}
      <group position={module === "linux" ? [1.88,-0.32,-0.16] : [1.83,-0.34,-0.22]}
        rotation={[0,-0.11,0]} onClick={event=>{event.stopPropagation();onChoose("linux");}}>
        <Alloy position={[0,0,-0.055]} size={[1.94,1.16,0.12]} color="#283442" radius={0.055}/>
        <Alloy position={[0,0,-0.132]} size={[1.81,1.02,0.03]} color="#3d4956" radius={0.025}/>
        <Alloy position={[0,-0.03,-0.152]} size={[0.25,0.25,0.018]} color="#71808c" radius={0.025}/>
        {Array.from({length:10},(_,i)=>
          <Alloy key={"display-vents-"+i} position={[-0.67+i*.149,0.38,-0.152]}
            size={[0.075,0.014,0.012]} color="#8d9aa5" radius={0.005}/>)}
        <Alloy position={[0,0,0.028]} size={[1.85,1.07,0.024]} color="#080e18" radius={0.019}/>
        <DesktopScreen position={[0,0,0.052]} size={[1.78,1.006]}
          accent={accent} secondary={secondary} gpuName={gpuName} cpuName={cpuName}/>
        <EngravedLabel position={[0,-0.545,0.067]} size={[0.42,0.064]}
          title="HYPRLAND" accent={secondary}/>
        <Alloy position={[0,-0.50,0.046]} size={[1.78,0.04,0.011]} color="#333b49" radius={0.005}/>
        <Alloy position={[0,-0.76,-0.055]} size={[0.11,0.43,0.12]} color="#818c99"/>
        <Alloy position={[0,-0.98,0.00]} size={[0.72,0.045,0.40]} color="#8c97a3"/>
        <Alloy position={[0,-0.995,0.17]} size={[0.61,0.017,0.015]} color="#657887" radius={0.005}/>
        <EngravedLabel position={[0,-0.02,-0.158]} size={[0.48,0.095]}
          title="DISPLAY UNIT" subtitle="REV / DEMO" accent={accent}/>

      </group>
    </group>
  );
}
