import * as d3 from 'd3';
import * as d3types from '../types/d3types';

interface INode {
  name: string;
  attributes?: string[];
  methods?: string[];
  group?: number;
}

interface IEdge {
  source: number;
  target: number;
}

const fontSize = '1rem';

interface INodeForce extends INode, d3.SimulationNodeDatum {}
interface IEdgeForce extends d3types.SimulationLink<INodeForce> {}

const cssMultiplier = (multiplicand: string) => {
  return (multiplier: number) => {
    return `calc(${multiplicand}*${multiplier})`;
  };
};

const createSvgElements = (
  svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>,
  nodesData: INode[],
  linksData: IEdge[]
) => {
  const lengthByFontsize = cssMultiplier(fontSize);

  const edges = svg
    .selectAll('line')
    .data(linksData)
    .enter()
    .append('line')
    .attr('stroke-width', 1)
    .attr('stroke', 'black');

  // クラス
  const nodes = svg
    .selectAll('svg')
    .data(nodesData)
    .enter()
    .append('svg')
    .attr('width', 100)
    .attr('height', (d) =>
      lengthByFontsize(
        2.1 + (d.attributes?.length || 0) + (d.methods?.length || 0)
      )
    );

  // クラス背景
  nodes
    .append('rect')
    .attr('width', 100)
    .attr('height', (d) =>
      lengthByFontsize(
        2.1 + (d.attributes?.length || 0) + (d.methods?.length || 0)
      )
    )
    .attr('stroke', 'black')
    .attr('stroke-width', 1.5)
    .attr('fill', 'antiquewhite')
    .append('title')
    .text((d) => d.name);

  // クラス名
  nodes
    .append('text')
    .attr('x', '50%')
    .attr('y', lengthByFontsize(1.3))
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'auto')
    .style('fill', 'black')
    .style('font-size', lengthByFontsize(1.2))
    .text((d) => d.name);

  // クラス名 罫線
  nodes
    .append('line')
    .attr('x1', 10)
    .attr('x2', 90)
    .attr('y1', lengthByFontsize(1.6))
    .attr('y2', lengthByFontsize(1.6))
    .attr('stroke-width', 1)
    .attr('stroke', 'black');

  // クラス変数
  nodes
    .selectAll('.class-attribute')
    .data((d) => d.attributes || [])
    .enter()
    .append('text')
    .attr('class', 'class-attribute')
    .attr('x', '50%')
    .attr('y', (_, i) => lengthByFontsize(1.7 + i))
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'hanging')
    .style('fill', 'dimgray')
    .style('font-size', fontSize)
    .text((d) => d);

  // クラス変数 罫線
  nodes
    .append('line')
    .attr('x1', 10)
    .attr('x2', 90)
    .attr('y1', (d) =>
      lengthByFontsize(1.7 + (d.attributes?.length || 0) + 0.2)
    )
    .attr('y2', (d) =>
      lengthByFontsize(1.7 + (d.attributes?.length || 0) + 0.2)
    )
    .attr('stroke-width', 1)
    .attr('stroke', 'black');

  // クラスメソッド
  nodes
    .selectAll('.class-method')
    .data(
      (d) =>
        d.methods?.map((v) => ({
          method: v,
          len: d.attributes?.length || 0,
        })) || []
    )
    .enter()
    .append('text')
    .attr('class', 'class-method')
    .attr('x', '50%')
    .attr('y', (d, i) => lengthByFontsize(2 + d.len + i))
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'hanging')
    .style('fill', 'gray')
    .style('font-size', fontSize)
    .text((d) => d.method);

  return { nodes, edges };
};

const createSimulation = (
  nodes: d3.Selection<SVGSVGElement, INodeForce, HTMLElement, any>,
  edges: d3.Selection<SVGLineElement, IEdgeForce, d3.BaseType, unknown>,
  width: number,
  height: number,
  nodesData: INode[],
  linksData: IEdge[]
) => {
  function ticked() {
    edges
      .attr('x1', (d) => d.source.x || 0)
      .attr('y1', (d) => d.source.y || 0)
      .attr('x2', (d) => d.target.x || 0)
      .attr('y2', (d) => d.target.y || 0);

    nodes.attr('x', (d) => d.x || 0).attr('y', (d) => d.y || 0);
  }

  const result = d3
    .forceSimulation()
    .nodes(nodesData as INodeForce[])
    .force('charge', d3.forceManyBody().strength(-200))
    .force('link', d3.forceLink(linksData).distance(300))
    .force('center', d3.forceCenter(width / 2, height / 2).strength(0.1))
    .force('collide', d3.forceCollide().radius(100))
    .on('tick', ticked)
    .velocityDecay(0.6)
    .alpha(0.7);

  return result;
};

const addDragEvent = (
  simulation: d3.Simulation<d3.SimulationNodeDatum, undefined>,
  svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>
) => {
  const dragstarted = (
    event: d3.D3DragEvent<SVGGElement, any, any>,
    d: any
  ) => {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  };

  const dragged = (event: d3.D3DragEvent<SVGGElement, any, any>, d: any) => {
    d.fx = event.x;
    d.fy = event.y;
  };

  const dragended = (event: d3.D3DragEvent<SVGGElement, any, any>, d: any) => {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  };

  svg
    .selectAll('svg')
    .call(
      (d3 as any)
        .drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended)
    );
};

const drawClassDiagram = (
  svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>,
  width: number,
  height: number,
  nodesData: INode[],
  linksData: IEdge[]
) => {
  console.log('start creating svg elements.');
  const { nodes, edges } = createSvgElements(svg, nodesData, linksData);

  console.log('start creating simulation.');
  const simulation = createSimulation(
    nodes as any,
    edges as any,
    width,
    height,
    nodesData,
    linksData
  );

  console.log('add drag events.');
  addDragEvent(simulation, svg);
};

export const draw = (elementID: string, width: number, height: number) => {
  const nodesData: INode[] = [
    {
      name: '会社',
      attributes: ['社名', '所在地'],
    },
    {
      name: '部署',
      attributes: ['部署名',],
    },
    {
      name: '社員',
      attributes: ['社員名', '入社年月日'],
    },
    {
      name: 'アカウント',
      attributes: ['ユーザーID', 'パスワード'],
      methods: ['ログイン機能'],
    },
    {
      name: '案件',
      attributes: ['案件名', '規模'],
      methods: [],
    },
  ];

  const linksData = [
    { source: 0, target: 1 },
    { source: 1, target: 2 },
    { source: 2, target: 3 },
    { source: 2, target: 4 },
  ];

  const svg = d3
    .select(`#${elementID}`)
    .append('svg')
    .attr('width', '1200')
    .attr('height', '900');
  drawClassDiagram(svg, width, height, nodesData, linksData);
  console.log('end');
};
