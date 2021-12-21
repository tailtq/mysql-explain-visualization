// eslint-disable-next-line max-classes-per-file
export class NodeData {
  /**
   * @param {String} id
   * @param {String} displayName
   * @param {String} type
   * @param {Object} additionalData
   */
  constructor(id, displayName, type, additionalData = {}) {
    this.id = id;
    this.displayName = displayName;
    this.type = type;
    this.additionalData = additionalData;
  }
}

export class Node {
  /**
   * @param {NodeData} data
   * @param {Node} parent
   */
  constructor(data, parent = null) {
    this.data = data;
    this.parentId = parent ? parent.data.id : null;
    this.left = null;
    this.right = null;
  }

  /**
   * @param {Node|BinaryTree} leftNode
   */
  setLeft(leftNode) {
    this.left = leftNode;
  }

  /**
   * @param {Node} rightNode
   */
  setRight(rightNode) {
    this.right = rightNode;
  }
}

export class MultibranchNode {
  /**
   * @param {NodeData} data
   * @param {Node} parent
   * @param {BinaryTree[]} children
   */
  constructor(data, children, parent = null) {
    this.data = data;
    this.parentId = parent?.data?.id;
    this.children = children;
  }
}

export class BinaryTree {
  /**
   * @param {NodeData} nodeData
   */
  constructor(nodeData) {
    this.root = null;
    this.nodesMap = {};
    this.nodeData = nodeData;
    this.parentId = null;
  }

  /**
   * @param {NodeData} rootData
   */
  setRoot(rootData) {
    this.root = new Node(rootData);
    this.setMap(this.root);
    return this.root;
  }

  /**
   * @param {NodeData} data
   * @param {Node} parent
   * @param {String} direction
   */
  insert(data, parent, direction) {
    const newNode = new Node(data, parent);
    this.setMap(newNode);

    if (direction === 'left') {
      parent.setLeft(newNode);
    } else if (direction === 'right') {
      parent.setRight(newNode);
    }

    return newNode;
  }

  /**
   * @param {BinaryTree} tree
   * @param {Node} parent
   * @param {String} direction
   */
  insertTree(tree, parent, direction) {
    tree.parentId = parent.data.id;
    this.setMap(tree);

    if (direction === 'left') {
      parent.setLeft(tree);
    } else if (direction === 'right') {
      parent.setRight(tree);
    }

    return tree;
  }

  /**
   * @param {NodeData} data
   * @param {BinaryTree[]} children
   * @param {Node} parent
   */
  insertMultibranchNode(data, children, parent) {
    const newNode = new MultibranchNode(data, children, parent);
    this.setMap(newNode);

    return newNode;
  }

  /**
   * @param {Node|MultibranchNode|BinaryTree} node
   */
  setMap(node) {
    if (node instanceof BinaryTree && node.nodeData) {
      this.nodesMap[node.nodeData.id] = node;
    } else {
      this.nodesMap[node.data.id] = node;
    }
  }

  /**
   * @returns {Array[Node]}
   */
  getNodes() {
    return Object.values(this.nodesMap);
  }

  /**
   * Get stack for traversing
   * @returns {Node?}
   */
  getNodeById(id) {
    return this.nodesMap[id];
  }

  /**
   * @returns {NodeData}
   */
  getNodeData() {
    return this.nodeData;
  }
}
