import { SimulationNodeDatum, SimulationLinkDatum } from 'd3';

export interface SimulationNode {
  id: string;
  index?: number;
  /**
   * Node’s current x-position
   */
  x?: number;
  /**
   * Node’s current y-position
   */
  y?: number;
  /**
   * Node’s current x-velocity
   */
  vx?: number;
  /**
   * Node’s current y-velocity
   */
  vy?: number;
  /**
   * Node’s fixed x-position (if position was fixed)
   */
  fx?: number | null;
  /**
   * Node’s fixed y-position (if position was fixed)
   */
  fy?: number | null;
}

export interface SimulationLink<NodeDatum extends SimulationNodeDatum> {
  source: NodeDatum;
  target: NodeDatum;
  value: number;
}

// export interface SimulationGraph {
//   nodes: SimulationNode[];
//   links: SimulationLink[];
// }
