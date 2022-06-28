# MySQL Explain Visualization

![Image](public/introduction.png)

Turn MySQL Explain JSON into vector UML sequence diagrams

[https://tailtq.github.io/mysql-explain-visualization](https://tailtq.github.io/mysql-explain-visualization)


## Example

We can turn
```json
{
  "query_block": {
    "select_id": 1,
    "cost_info": {
      "query_cost": "1.26"
    },
    "ordering_operation": {
      "using_filesort": false,
      "nested_loop": [
        {
          "table": {
            "table_name": "A",
            "access_type": "ref",
            "possible_keys": [
              "idx_a",
              "idx_b",
              "idx_c"
            ],
            "key": "idx_b",
            "used_key_parts": [
              "..."
            ],
            "key_length": "4",
            "ref": [
              "const"
            ],
            "rows_examined_per_scan": 1,
            "rows_produced_per_join": 0,
            "filtered": "5.00",
            "cost_info": {
              "read_cost": "1.00",
              "eval_cost": "0.01",
              "prefix_cost": "1.20",
              "data_read_per_join": "1K"
            },
            "used_columns": [
              "updated_at",
              "id",
              "name",
              "status"
            ],
            "attached_condition": "",
            "attached_subqueries": [
              {
                "dependent": true,
                "cacheable": false,
                "query_block": {
                  "select_id": 3,
                  "cost_info": {
                    "query_cost": "1.20"
                  },
                  "table": {
                    "table_name": "B",
                    "access_type": "ref",
                    "possible_keys": [
                      "idx_ba",
                      "idx_bb"
                    ],
                    "key": "idx_bb",
                    "used_key_parts": [
                      "user_id"
                    ],
                    "key_length": "6",
                    "ref": [
                      "const"
                    ],
                    "rows_examined_per_scan": 1,
                    "rows_produced_per_join": 1,
                    "filtered": "100.00",
                    "using_index": true,
                    "cost_info": {
                      "read_cost": "1.00",
                      "eval_cost": "0.20",
                      "prefix_cost": "1.20",
                      "data_read_per_join": "333"
                    },
                    "used_columns": [
                      "user_id",
                      "for_test"
                    ]
                  }
                }
              }
            ]
          }
        },
        {
          "table": {
            "table_name": "C",
            "access_type": "ref",
            "possible_keys": [
              "idx_ca",
              "idx_cb",
              "idx_cc"
            ],
            "key": "idx_ca",
            "used_key_parts": [
              "user_id"
            ],
            "key_length": "4",
            "ref": [
              "const"
            ],
            "rows_examined_per_scan": 1,
            "rows_produced_per_join": 0,
            "filtered": "5.00",
            "cost_info": {
              "read_cost": "0.05",
              "eval_cost": "0.00",
              "prefix_cost": "1.26",
              "data_read_per_join": "0"
            },
            "used_columns": [
              "id",
              "user_id"
            ],
            "attached_condition": ""
          }
        },
        {
          "table": {
            "table_name": "D",
            "access_type": "eq_ref",
            "possible_keys": [
              "idx_da",
              "idx_db"
            ],
            "key": "idx_da",
            "used_key_parts": [
              "user_id"
            ],
            "key_length": "4",
            "ref": [
              "rc.A.id"
            ],
            "rows_examined_per_scan": 1,
            "rows_produced_per_join": 0,
            "filtered": "99.00",
            "cost_info": {
              "read_cost": "0.00",
              "eval_cost": "0.00",
              "prefix_cost": "1.26",
              "data_read_per_join": "3"
            },
            "used_columns": [
              "id",
              "user_id",
              "status",
              "state"
            ]
          }
        }
      ]
    }
  }
}
```

into

<p align="center">
  <img src="public/visualization.png">
</p>


## Thanks

Heavily inspired by [Workbench](https://www.mysql.com/products/workbench/) and [js-sequence-diagrams](https://bramp.github.io/js-sequence-diagrams/).
