import type Agent from './agent';
export type AgentType = 'Clippy' | 'Bonzi' | 'F1' | 'Genie' | 'Genius' | 'Links' | 'Merlin' | 'Peedy' | 'Rocky' | 'Rover';
export interface ClippyBranch {
    branches?: Array<string>;
    frameIndex: number;
    weight: number;
}
export interface ClippyFrame {
    images?: Array<Array<number>>;
    duration?: number;
    branching?: {
        branches: Array<ClippyBranch>;
    };
    useExitBranching?: boolean;
    exitBranch?: number;
    sound?: any;
}
export interface ClippyAnimation {
    useExitBranching?: boolean;
    frames: Array<ClippyFrame>;
}
export interface AgentConfig {
    overlayCount: number;
    framesize: Array<number>;
    sounds: Array<string>;
    animations: Record<string, ClippyAnimation>;
}
export interface AgentWrapper {
    name: string;
    image: string;
    config: AgentConfig;
    sounds: Record<string, string>;
}
export interface LoadOptions {
    name: string;
    rootClass?: string;
    allowDrag?: boolean;
    allowDoubleClick?: boolean;
    onSuccess?: (agent: Agent) => void;
    onFail?: (error: any) => void;
}
export interface Clippy {
    load: (data: LoadOptions) => void;
    agents: Record<AgentType, AgentWrapper>;
}
declare global {
    interface Window {
        clippy: Clippy;
    }
}
//# sourceMappingURL=types.d.ts.map