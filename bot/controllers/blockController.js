require("dotenv").config();
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_API_KEY });

//получить id блока "Основной состав" заданной страницы по id
async function getBlocks(blockId) {
    try {
        const response = await notion.blocks.children.list({
            block_id: blockId,
        });

        let count = 0;
        let res;

        const responseResults = response.results.map((block) => {
            if (block.child_database?.title === "Основной состав"){
               res = block.id 
            }
        });     

        return res;
    } catch (error) {
        console.error(error.message)
    }
}

//получить id блока "Претенденты" заданной страницы по id
async function getBlocksP(blockId) {
    try {
        const response = await notion.blocks.children.list({
            block_id: blockId,
        });

        let count = 0;
        let res;

        const responseResults = response.results.map((block) => {
            if (block.child_database?.title === "Претенденты"){
               res = block.id 
            }
        });     

        return res;
    } catch (error) {
        console.error(error.message)
    }
}

//получить все блоки заданной страницы по id
async function getBlocks2(blockId) {
    try {
        const response = await notion.blocks.children.list({
            block_id: blockId,
        });

        return response;
    } catch (error) {
        console.error(error.message)
    }
}

//получить данные блока по заданному ID
async function getBlockId(blockId) {
    try {
        const response = await notion.blocks.retrieve({
            block_id: blockId,
        });

        return response;
    } catch (error) {
        console.error(error.message)
    }
}


//получить данные дочерних блоков по заданному ID
async function getBlocksChildrenId(blockId) {
    try {

        const response = await notion.blocks.children.list({
            block_id: blockId,
            page_size: 50,
        });

        return response;
    } catch (error) {
        console.error(error.message)
    }
}

async function createBlock(blockId) {
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
                        "table_width": 2,
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
                                          "content": "column 1 content",
                                          "link": null
                                        },
                                        "annotations": {
                                          "bold": false,
                                          "italic": false,
                                          "strikethrough": false,
                                          "underline": false,
                                          "code": false,
                                          "color": "default"
                                        },
                                        "plain_text": "column 1 content",
                                        "href": null
                                      }
                                    ],
                                    [
                                      {
                                        "type": "text",
                                        "text": {
                                          "content": "column 2 content",
                                          "link": null
                                        },
                                        "annotations": {
                                          "bold": false,
                                          "italic": false,
                                          "strikethrough": false,
                                          "underline": false,
                                          "code": false,
                                          "color": "default"
                                        },
                                        "plain_text": "column 2 content",
                                        "href": null
                                      }
                                    ],
                                    [
                                      {
                                        "type": "text",
                                        "text": {
                                          "content": "column 3 content",
                                          "link": null
                                        },
                                        "annotations": {
                                          "bold": false,
                                          "italic": false,
                                          "strikethrough": false,
                                          "underline": false,
                                          "code": false,
                                          "color": "default"
                                        },
                                        "plain_text": "column 3 content",
                                        "href": null
                                      }
                                    ]
                                  ]
                                }
                            }
                        ]
                    }
                }
            ],
        })
        //console.log(response)
        const res_id = response.id;

        return response;
    } catch (error) {
        console.error(error.message)
    }
}

//получить данные страницы по заданному ID
async function getPage(pageId) {
    try {
        const response = await notion.pages.retrieve({
            page_id: pageId,
        });

        return response;
    } catch (error) {
        console.error(error.message)
    }
}


class BlockController {

    async blocksId(req, res) {
        const id = req.params.id; // получаем id
        const blocks = await getBlocks(id);
        if(blocks){
            res.json(blocks);
        }
        else{
            res.json({});
        }
    }

    async blocksPId(req, res) {
        const id = req.params.id; // получаем id
        const blocks = await getBlocksP(id);
        if(blocks){
            res.json(blocks);
        }
        else{
            res.json({});
        }
    }

    async blocksId2(req, res) {
        const id = req.params.id; // получаем id
        const blocks = await getBlocks2(id);
        if(blocks){
            res.json(blocks);
        }
        else{
            res.json({});
        }
    }

    async blockId(req, res) {
        const id = req.params.id; // получаем id
        const blocks = await getBlockId(id);
        res.json(blocks);
    }

    async blocksChildrenId(req, res) {
        const id = req.params.id; // получаем id
        const blocks = await getBlocksChildrenId(id);
        res.json(blocks);
    }

    async appendBlock(req, res) {
        const id = req.params.id; // получаем id
        try {
            const block = await createBlock(id);
            res.status(200).json(block);
        } catch (error) {
            console.error(error.message)
            res.status(500).json(error);
        }
    }

    async pageId(req, res) {
        const id = req.params.id; // получаем id
        const page = await getPage(id);
        res.json(page);
    }
}

module.exports = new BlockController()