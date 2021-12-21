export default class PopupContentUtils {
  /**
   * @param {NodeData} nodeData
   * @return {String}
   */
  static getTableContent(nodeData) {
    const { additionalData, displayName } = nodeData;

    return `
      <h6 class='node__title'>${displayName}</h6>
      <p>- Access Type: ${additionalData.access_type}</p>
      ${additionalData.used_columns ? `<p>- Used Columns: ${additionalData.used_columns.join(', ')}</p>` : ''}
      
      ${additionalData.key ? `<br>` : ''}
      ${additionalData.key ? `<h6 class='node__title'>Key/Index: ${additionalData.key}</h6>` : ''}
      ${additionalData.ref ? `<p>- Ref: ${additionalData.ref.join(', ')}</p>` : ''}
      ${additionalData.used_key_parts ? `<p>- Used Key Parts: ${additionalData.used_key_parts.join(', ')}</p>` : ''}
      ${additionalData.possible_keys ? `<p>- Possible Keys: ${additionalData.possible_keys.join(', ')}</p>` : ''}

      <br>
      <p>- Rows Examined Per Scan: ${additionalData.rows_examined_per_scan}</p>
      <p>- Rows Produced Per Scan: ${additionalData.rows_produced_per_join}</p>
      <p>- Filtered: ${additionalData.filtered}%</p>

      <br>
      <h6 class='node__title'>Cost Info</h6>
      <p>- Read: ${additionalData.cost_info.read_cost}</p>
      <p>- Eval: ${additionalData.cost_info.eval_cost}</p>
      <p>- Prefix: ${additionalData.cost_info.prefix_cost}</p>
      <p>- Data Read: ${additionalData.cost_info.data_read_per_join}</p>
    `;
  }


  /**
   * @param {NodeData} nodeData
   * @return {String}
   */
  static getQueryBlockContent(nodeData) {
    const { additionalData } = nodeData;

    return `
      <h6 class='node__title'>Query Block</h6>
      ${additionalData.select_id ? `<p>- Select ID: ${additionalData.select_id}</p>` : ''}
      ${additionalData.cost_info ? `<p>- Query cost: ${additionalData.cost_info.query_cost}</p>` : ''}
    `;
  }

  /**
   * @param {NodeData} nodeData
   * @return {String}
   */
  static getOrderingContent(nodeData) {
    return `
      <h6 class='node__title'>Ordering Operation</h6>
      <p>Using Filesort: ${nodeData.additionalData.using_filesort ? 'True' : 'False'}</p>
    `;
  }

  /**
   * @param {NodeData} nodeData
   * @return {String}
   */
  static getNestedLoopContent(nodeData) {
    return `
      <h6 class='node__title'>Nested Loop</h6>
      <p>Prefix cost: ${nodeData.additionalData.cost_info.prefix_cost}</p>
    `;
  }
}
