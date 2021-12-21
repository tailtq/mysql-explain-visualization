import { NodeData } from './data_structure';
import CommonUtils from './common';

export default class MermaidUtils {
  static ACCESS_TYPES = {
    SYSTEM: 'Single row: system constant',
    CONST: 'Single row: constant',
    EQ_REF: 'Unique Key Lookup',
    REF: 'Non-Unique Key Lookup',
    REF_OR_NULL: 'Key Lookup + Fetch NULL Values',
    INDEX_MERGE: 'Index Merge',
    FULLTEXT: 'Fulltext Index Search',
    UNIQUE_SUBQUERY: 'Unique Key Lookup into table of subquery',
    INDEX_SUBQUERY: 'Non-Unique Key Lookup into table of subquery',
    RANGE: 'Index Range Scan',
    INDEX: 'Full Index Scan',
    ALL: 'Full Table Scan',
    UNKNOWN: 'unknown',
  };

  /**
   * @param {NodeData} nodeData
   * @returns
   */
  static getBoxContent({ id, type, displayName, additionalData }) {
    let content;
    const style = MermaidUtils._getBoxStyle(type, id, additionalData);

    switch (type) {
      case 'table':
        content = `${id}["<b>${displayName}</b><br>${MermaidUtils._getTableAccessType(additionalData)}<br>${MermaidUtils._getPrefixCostContent(additionalData, 'read_cost')}<br>${MermaidUtils._getIndexContent(additionalData)}"]`;
        break;
      case 'nested_loop':
        content = `${id}{"<b>${displayName}</b>"}`;
        break;
      case 'query_block':
        content = `${id}[<b>${displayName}</b>${additionalData.cost_info ? `<br>${MermaidUtils._getPrefixCostContent(additionalData, 'query_cost')}<br>` : ''}]`;
        break;
      // case 'attached_subqueries':
      //   content = `${id}[<b>${displayName}</b>]`;
      //   break;
      // case 'union':
      //   content = `${id}[<b>${displayName}</b>]`;
      //   break;
      case 'ordering':
      case 'duplicate_removals':
        content = `${id}(<b>${displayName}</b>)`;
        break;
      default:
        content = `${id}[<b>${displayName}</b>]`;
    }

    return [content, style];
  }

  static _getBoxStyle(type, id, additionalData = {}) {
    let style;

    switch (type) {
      case 'nested_loop':
        style = `style ${id} fill:#fff, stroke:#b3b3b3, stroke-width:2px`;
        break;
      case 'query_block':
      case 'union':
        style = `style ${id} fill:#b3b3b3, stroke:#000, stroke-width:2px`;
        break;
      case 'attached_subqueries':
        style = `style ${id} fill:#fff, stroke:#000, stroke-width:2px, stroke-dasharray: 5 5`;
        break;
      case 'ordering':
        style = `style ${id} fill:#fff, stroke:#bf4040, stroke-width:2px`;
        break;
      case 'duplicate_removals':
        style = `style ${id} fill:#fff, stroke:#bbba06, stroke-width:2px`;
        break;
      case 'table':
        style = MermaidUtils._getTableStyle(id, additionalData);
        break;
      default:
        style = '';
    }

    return style
  }

  /**
   * @Docs https://dev.mysql.com/doc/workbench/en/wb-performance-explain.html
   * @param id
   * @param accessType
   * @returns {string}
   * @private
   */
  static _getTableStyle(id, { access_type: accessType }) {
    let style;

    switch (accessType.toUpperCase()) {
      case 'SYSTEM':
      case 'CONST':
        style = `style ${id} fill:#4080c0`;
        break;
      case 'EQ_REF':
      case 'REF':
      case 'REF_OR_NULL':
      case 'INDEX_MERGE':
        style = `style ${id} fill:#008000`;
        break;
      case 'FULLTEXT':
        style = `style ${id} fill:#bbba06`;
        break;
      case 'UNIQUE_SUBQUERY':
      case 'INDEX_SUBQUERY':
      case 'RANGE':
        style = `style ${id} fill:#b97301`;
        break;
      case 'INDEX':
      case 'ALL':
        style = `style ${id} fill:#b93236`;
        break;
      case 'UNKNOWN':
        style = `style ${id} fill:#000`;
        break;
      default:
    }
    style += ',stroke:#000,color:#fff';

    return style;
  }

  static _getTableAccessType({ access_type: accessType }) {
    return `<i>Access type:</i> <b>${MermaidUtils.ACCESS_TYPES[accessType.toUpperCase()]}</b>`;
  }

  /**
   * @param {Object} additionalData
   * @param key
   * @returns
   */
  static _getPrefixCostContent(additionalData, key = 'prefix_cost') {
    return `<i>Query cost:</i> ${additionalData.cost_info[key]}`;
  }

  /**
   * @param {Object} additionalData
   * @returns
   */
  static _getIndexContent(additionalData) {
    return additionalData.key ? `<i>Index:</i> ${additionalData.key.replace('<', '').replace('>', '')}` : '';
  }

  /**
   * @param {Object} additionalData
   * @returns
   */
  static _getTotalRows(additionalData) {
    return `<i>Total rows:</i> ${additionalData.rows_produced_per_join}`;
  }

  /**
   * @param {String} idPrefix
   * @param {String} selectId
   * @param {String} selectId
   * @returns
   */
  static getQueryBlockIdentifier(idPrefix, selectId) {
    return {
      id: `${idPrefix}query_block${selectId || ''}-${CommonUtils.randomString()}`,
      name: `Query Block ${selectId ? `#${selectId}` : ''}`,
    };
  }

  /**
   * @param {String} idPrefix
   * @returns
   */
  static getOrderingIdentifier(idPrefix) {
    return {
      id: `${idPrefix}ordering-${CommonUtils.randomString()}`,
      name: `Ordering`,
    };
  }

  /**
   * @param {String} idPrefix
   * @returns
   */
  static getDuplicateRemovalsIdentifier(idPrefix) {
    return {
      id: `${idPrefix}duplicate_removals-${CommonUtils.randomString()}`,
      name: `Ordering`,
    };
  }

  /**
   * @param {String} idPrefix
   * @returns
   */
  static getNestedLoopNodeIdentifier(idPrefix) {
    return {
      id: `${idPrefix}nested_loop-${CommonUtils.randomString()}`,
      name: `Nested Loop`,
    };
  }

  /**
   * @param {String} idPrefix
   * @param {String} tableName
   * @returns
   */
  static getTableIdentifier(idPrefix, tableName) {
    return {
      id: `${idPrefix}${tableName}-${CommonUtils.randomString()}`,
      name: tableName,
    };
  }

  /**
   * @param {String} id
   * @param {String} selectId
   * @returns {{name: string, id}}
   */
  static getSubqueryIdentifier(id, selectId) {
    return {
      id,
      name: `Subquery ${selectId ? `#${selectId}` : ''}`,
    };
  }
}
