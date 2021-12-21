import { NodeData, BinaryTree, MultibranchNode } from './utils/data_structure';
import MermaidUtils from './utils/mermaid_content';
import PopupContentUtils from './utils/popup_content';

export default class ExplainedDataParser {
  /**
   * @param {Object} data: JSON data
   * @param {String} idPrefix: Prefix string
   * @param {NodeData} nodeData: Data from materializing or subquery
   */
  constructor(data, idPrefix = null, nodeData = null) {
    this.binaryTree = new BinaryTree(nodeData);
    this.data = data;
    this.currentDataLevel = null;
    this.idPrefix = idPrefix ? `${idPrefix}#` : '';
  }

  build() {
    const root = this._parseQueryBlockNode();
    let latestNode = this._parseUnion(root) || root;
    latestNode = this._parseDuplicatesRemoval(latestNode) || latestNode;
    latestNode = this._parseOrderingNode(latestNode) || latestNode;
    latestNode = this._parseNestedLoopNodes(latestNode) || latestNode;
    latestNode = this._parseTableNode(latestNode) || latestNode;
  }

  /**
   * @returns {Node}
   */
  _parseQueryBlockNode() {
    const { query_block: queryBlockData } = this.data;
    console.log(queryBlockData);
    const queryBlockIdentifier = MermaidUtils.getQueryBlockIdentifier(this.idPrefix, queryBlockData.select_id);
    const { id } = queryBlockIdentifier;
    let { name } = queryBlockIdentifier;
    if (this.binaryTree.getNodeData()?.type === 'subquery') {
      name = this.binaryTree.getNodeData().displayName;
    }
    const nodeData = new NodeData(id, name, 'query_block', {
      select_id: queryBlockData.select_id,
      cost_info: queryBlockData.cost_info,
    });
    const rootNode = this.binaryTree.setRoot(nodeData);
    this.currentDataLevel = queryBlockData;

    return rootNode;
  }

  /**
   * @param {Node} parentNode
   */
  _parseOrderingNode(parentNode) {
    const { ordering_operation: orderingOperation } = this.currentDataLevel;

    if (orderingOperation) {
      const { id, name } = MermaidUtils.getOrderingIdentifier(this.idPrefix);
      const nodeData = new NodeData(id, name, 'ordering', {
        using_filesort: orderingOperation.using_filesort,
      });
      const currentNode = this.binaryTree.insert(nodeData, parentNode, 'left');
      this.currentDataLevel = orderingOperation;

      return currentNode;
    }
    return null;
  }

  /**
   * @param {Node} parentNode
   * @returns {null|*}
   * @private
   */
  _parseNestedLoopNodes(parentNode) {
    const { nested_loop: nestedLoop } = this.currentDataLevel;

    if (!nestedLoop) {
      return null;
    }
    nestedLoop.reverse();
    nestedLoop.forEach((query, index) => {
      const tableNodeData = this._parseTableData(query);
      const { id, name } = MermaidUtils.getNestedLoopNodeIdentifier(this.idPrefix);
      const nestedLoopNodeData = new NodeData(id, name, 'nested_loop', {
        cost_info: tableNodeData.additionalData.cost_info,
        rows_produced_per_join: tableNodeData.additionalData.rows_produced_per_join,
      });
      // last table connects with the previous nested loop diamond
      if (index !== nestedLoop.length - 1) {
        parentNode = this.binaryTree.insert(nestedLoopNodeData, parentNode, 'left');
      }
      const tableNode = this.binaryTree.insert(tableNodeData, parentNode, 'right');
      this._parseAttachedSubqueriesNodes(tableNode, query.table);
      this._parseMaterializedFromSubquery(tableNode, query.table);
    });

    return parentNode;
  }


  /**
   * @param {Node} parentNode
   * @private
   */
  _parseDuplicatesRemoval(parentNode) {
    const { duplicates_removal: duplicatesRemoval } = this.currentDataLevel;

    if (duplicatesRemoval) {
      const { id, name } = MermaidUtils.getDuplicateRemovalsIdentifier(this.idPrefix);
      const nodeData = new NodeData(id, name, 'duplicate_removals', {
        using_temporary_table: duplicatesRemoval.using_temporary_table,
        using_filesort: duplicatesRemoval.using_filesort,
      });
      const currentNode = this.binaryTree.insert(nodeData, parentNode, 'left');
      this.currentDataLevel = duplicatesRemoval;

      return currentNode;
    }

    return null;
  }

  /**
   * @param {Node} parentNode
   * @private
   */
  _parseUnion(parentNode) {
    const { union_result: unionResult } = this.currentDataLevel;

    if (unionResult) {
      const idPrefix = `${this.idPrefix}${parentNode.data.id}#union`;
      const multibranchNodeData = new NodeData(idPrefix, 'Union', 'union');
      const trees = unionResult.query_specifications.map((subqueryData, index) => {
        const dataParser = new ExplainedDataParser(subqueryData, `${idPrefix}#${index}`);
        dataParser.build();

        return dataParser.binaryTree;
      });
      this.binaryTree.insertMultibranchNode(multibranchNodeData, trees, parentNode);

      return multibranchNodeData;
    }

    return null;
  }

  /**
   * Because this method is used dynamically, we shouldn't insert anything to the tree
   * @param {NodeData} data
   */
  _parseTableData(data) {
    const { table: tableData } = data;
    const { id, name } = MermaidUtils.getTableIdentifier(this.idPrefix, tableData.table_name);
    const nodeData = new NodeData(id, name, 'table', { ...tableData });

    return nodeData;
  }

  /**
   * @param {Node} parentNode
   * @returns {Node?}
   */
  _parseTableNode(parentNode) {
    const { table } = this.currentDataLevel;

    if (table) {
      const nodeData = this._parseTableData(this.currentDataLevel);
      const currentNode = this.binaryTree.insert(nodeData, parentNode, 'left');
      this.currentDataLevel = table;
      this._parseAttachedSubqueriesNodes(currentNode, table);
      this._parseMaterializedFromSubquery(currentNode, table);

      return currentNode;
    }
    return null;
  }

  /**
   *
   * @param {Node|MultibranchNode} parentNode
   * @param {object} tableData
   * @returns
   */
  _parseAttachedSubqueriesNodes(parentNode, tableData) {
    const { attached_subqueries: attachedSubqueries } = tableData;

    if (attachedSubqueries) {
      const idPrefix = `${this.idPrefix}${parentNode.data.id}#subqueries`;
      const multibranchNodeData = new NodeData(idPrefix, 'Attached Subqueries', 'attached_subqueries');
      const trees = attachedSubqueries.map((subqueryData, index) => {
        const subqueryId = `${idPrefix}#${index}`;
        const { name } = MermaidUtils.getSubqueryIdentifier(subqueryId, subqueryData.query_block.select_id);
        const nodeData = new NodeData(subqueryId, name, 'subquery');
        const dataParser = new ExplainedDataParser(subqueryData, subqueryId, nodeData);
        dataParser.build();

        return dataParser.binaryTree;
      });
      this.binaryTree.insertMultibranchNode(multibranchNodeData, trees, parentNode);

      return multibranchNodeData;
    }
    return null;
  }

  /**
   * @param {Node} parentNode
   * @param {object} tableData
   * @returns
   */
  _parseMaterializedFromSubquery(parentNode, tableData) {
    const { materialized_from_subquery: materializedFromSubquery } = tableData;

    if (materializedFromSubquery) {
      const idPrefix = `${this.idPrefix}${parentNode.data.id}#materialized_from_subquery`;
      const nodeData = new NodeData(idPrefix, `Materialized - ${parentNode.data.displayName}`, 'materialized_from_subquery');

      const dataParser = new ExplainedDataParser(materializedFromSubquery, idPrefix, nodeData);
      dataParser.build();
      this.binaryTree.insertTree(dataParser.binaryTree, parentNode, 'left');

      return dataParser.binaryTree;
    }
    return null;
  }

  /**
   * @param {string} id
   * @returns
   */
  getExplainContentById(id) {
    let node;
    let { nodesMap } = this.binaryTree;
    const segments = id.split('#');
    const newSegments = [];

    segments.forEach((segment) => {
      if (segment === 'subqueries' || segment === 'materialized_from_subquery') { // put materialized... here
        newSegments[newSegments.length - 1] += `#${segment}`;
      } else if (newSegments[newSegments.length - 1]) {
        newSegments.push(`${newSegments[newSegments.length - 1]}#${segment}`);
      } else {
        newSegments.push(segment);
      }
    });
    newSegments.forEach((segment, index) => {
      if (index === newSegments.length - 1) {
        node = nodesMap[id];
        return;
      }
      if (nodesMap[segment]) {
        node = nodesMap[segment];
      }
      if (node && node.nodesMap) {
        nodesMap = node.nodesMap;
      }
      if (node && node.children) {
        const branchIndex = parseInt(segment.slice(-2).replace('#', ''), 10);
        if (Number.isInteger(branchIndex)) {
          nodesMap = node.children[branchIndex].nodesMap;
        }
      }
    });
    let content;

    switch (node.data.type) {
      case 'nested_loop':
        content = PopupContentUtils.getNestedLoopContent(node.data);
        break;
      case 'ordering':
        content = PopupContentUtils.getOrderingContent(node.data);
        break;
      case 'query_block':
        content = PopupContentUtils.getQueryBlockContent(node.data);
        break;
      case 'table':
        content = PopupContentUtils.getTableContent(node.data);
        break;
      default:
    }
    content = content ? content.trim() : null;

    return content;
  }

  /**
   * @returns {String}
   */
  buildMermaidContent(binaryTree = null) {
    binaryTree = binaryTree || this.binaryTree;

    let content = '';
    let style = '';
    const nodes = binaryTree.getNodes();
    nodes.reverse();

    for (let i = 0; i < nodes.length; i += 1) {
      const currentNode = nodes[i];
      if (!currentNode.parentId) {
        continue;
      }
      if (currentNode instanceof BinaryTree) {
        const previousNode = binaryTree.getNodeById(nodes[i].parentId);
        const [currentNodeBox,] = MermaidUtils.getBoxContent(previousNode.data);
        const [rootSubTree,] = MermaidUtils.getBoxContent(currentNode.getNodes()[0].data);

        let content2 = this.buildMermaidContent(currentNode);
        content2 = `\nsubgraph ${currentNode.nodeData.displayName}\n${content2}end\n`;
        content += `\n${content2}`;
        content += `${rootSubTree}-->${currentNodeBox}\n`;
      } else {
        const previousNode = binaryTree.getNodeById(nodes[i].parentId);
        const [prevNodeBox, prevNodeStyle] = MermaidUtils.getBoxContent(previousNode.data);
        const [currentNodeBox, currentNodeStyle] = MermaidUtils.getBoxContent(currentNode.data);

        content += `${currentNodeBox}-->${prevNodeBox}\n`;
        style += prevNodeStyle ? `${prevNodeStyle}\n` : '';
        style += currentNodeStyle ? `${currentNodeStyle}\n` : '';

        if (currentNode instanceof MultibranchNode) {
          currentNode.children.forEach((subTree) => {
            const content2 = this.buildMermaidContent(subTree);
            const [rootSubTree, _] = MermaidUtils.getBoxContent(subTree.getNodes()[0].data);

            content += `\n${content2}`;
            content += `${rootSubTree}-->${currentNodeBox}\n`;
          });
        }
      }
    }
    return `${content}\n${style}`;
  }
}
