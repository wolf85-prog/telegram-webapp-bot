require("dotenv").config();
//notion api
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_API_KEY });

//send data to notion
module.exports = async function addTable(blockId) {
    try {
        const response = await notion.blocks.children.append({
            block_id: blockId,
            children: [              
                {
                    "object": "block",
                    "type": "column_list",
                    "column_list": {
                      "children": [
                        {
                          "object": "block",
                          "type": "column",
                          "column": {
                            "children": [
                                {
                                    "object": "block",
                                    "type": "to_do",
                                    "to_do": {
                                      "rich_text": [{
                                        "type": "text",
                                        "text": {
                                          "content": "Предварительная смета",
                                          "link": null
                                        }
                                      }],
                                      "checked": false,
                                      "color": "green",
                                    }
                                },
                                {
                                    "object": "block",
                                    "type": "to_do",
                                    "to_do": {
                                      "rich_text": [{
                                        "type": "text",
                                        "text": {
                                          "content": "Постер",
                                          "link": null
                                        }
                                      }],
                                      "checked": false,
                                      "color": "purple",
                                    }
                                },
                            ]
                          }
                        },
                        {
                          "object": "block",
                          "type": "column",
                          "column": {
                            "children": [
                                {
                                    "object": "block",
                                    "type": "to_do",
                                    "to_do": {
                                      "rich_text": [{
                                        "type": "text",
                                        "text": {
                                          "content": "Калькулятор",
                                          "link": null
                                        }
                                      }],
                                      "checked": false,
                                      "color": "blue",
                                    }
                                },
                                {
                                    "object": "block",
                                    "type": "to_do",
                                    "to_do": {
                                      "rich_text": [{
                                        "type": "text",
                                        "text": {
                                          "content": "Финальная смета",
                                          "link": null
                                        }
                                      }],
                                      "checked": false,
                                      "color": "pink",
                                    }
                                },
                            ]
                          }
                        }
                    ]
                    }
                },
                {
                    "type": "table",
                    "table": {
                        "table_width": 5,
                        "has_column_header": false,
                        "has_row_header": true,
                        "children": [
                            {
                                //...other keys excluded
                                "type": "table_row",
                                "table_row": {
                                    "cells": [
                                        [
                                            {
                                                "type": "text",
                                                "text": {
                                                    "content": "Тех. Задание",
                                                    "link": null
                                                },
                                                "annotations": {
                                                    "bold": true,
                                                    "italic": false,
                                                    "strikethrough": false,
                                                    "underline": false,
                                                    "code": false,
                                                    "color": "green"
                                                },
                                                "plain_text": "Тех. Задание",
                                                "href": null
                                            }
                                        ],
                                        [
                                            {
                                                "type": "text",
                                                "text": {
                                                    "content": "Данные | Данные | Данные",
                                                    "link": null
                                                },
                                                "annotations": {
                                                    "bold": false,
                                                    "italic": false,
                                                    "strikethrough": false,
                                                    "underline": false,
                                                    "code": false,
                                                    "color": "purple"
                                                },
                                                "plain_text": "Данные | Данные | Данные",
                                                "href": null
                                            }
                                        ],
                                        [
                                            {
                                                "type": "text",
                                                "text": {
                                                    "content": "Смена",
                                                    "link": null
                                                },
                                                "annotations": {
                                                    "bold": false,
                                                    "italic": false,
                                                    "strikethrough": false,
                                                    "underline": false,
                                                    "code": false,
                                                    "color": "green"
                                                },
                                                "plain_text": "Смена",
                                                "href": null
                                            }
                                        ],
                                        [
                                            {
                                                "type": "text",
                                                "text": {
                                                    "content": "10",
                                                    "link": null
                                                },
                                                "annotations": {
                                                    "bold": false,
                                                    "italic": false,
                                                    "strikethrough": false,
                                                    "underline": false,
                                                    "code": false,
                                                    "color": "purple"
                                                },
                                                "plain_text": "10",
                                                "href": null
                                            }
                                        ]
                                    ]
                                }
                            },
                            {
                                //...other keys excluded
                                "type": "table_row",
                                "table_row": {
                                    "cells": [
                                        [
                                            {
                                                "type": "text",
                                                "text": {
                                                    "content": "Ставка",
                                                    "link": null
                                                },
                                                "annotations": {
                                                    "bold": true,
                                                    "italic": false,
                                                    "strikethrough": false,
                                                    "underline": false,
                                                    "code": false,
                                                    "color": "green"
                                                },
                                                "plain_text": "Ставка",
                                                "href": null
                                            }
                                        ],
                                        [
                                            {
                                                "type": "text",
                                                "text": {
                                                    "content": "1 400.00 | 5 000.00",
                                                    "link": null
                                                },
                                                "annotations": {
                                                    "bold": false,
                                                    "italic": false,
                                                    "strikethrough": false,
                                                    "underline": false,
                                                    "code": false,
                                                    "color": "purple"
                                                },
                                                "plain_text": "1 400.00 | 5 000.00",
                                                "href": null
                                            }
                                        ],
                                        [
                                            {
                                                "type": "text",
                                                "text": {
                                                    "content": "Переработка",
                                                    "link": null
                                                },
                                                "annotations": {
                                                    "bold": false,
                                                    "italic": false,
                                                    "strikethrough": false,
                                                    "underline": false,
                                                    "code": false,
                                                    "color": "green"
                                                },
                                                "plain_text": "Переработка",
                                                "href": null
                                            }
                                        ],
                                        [
                                            {
                                                "type": "text",
                                                "text": {
                                                    "content": "350.00 | 500.00",
                                                    "link": null
                                                },
                                                "annotations": {
                                                    "bold": false,
                                                    "italic": false,
                                                    "strikethrough": false,
                                                    "underline": false,
                                                    "code": false,
                                                    "color": "purple"
                                                },
                                                "plain_text": "350.00 | 500.00",
                                                "href": null
                                            }
                                        ],
                                    ]
                                }
                            }
                        ]
                    }
                }
            ],
        })
        //console.log(response)
        //const res_id = response.id;

        //return response;
        //console.log(response)
        console.log("Верхний блок добавлен! Data: "  + response.results[0].id)//+ JSON.stringify(response))
        console.log("Верхний блок2 добавлен! Data: "  + response.results[1].id)//+ JSON.stringify(response))
        return response;
    } catch (error) {
        console.error(error.message)
    }
}