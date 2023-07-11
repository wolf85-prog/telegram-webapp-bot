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

    async pageId(req, res) {
        const id = req.params.id; // получаем id
        const page = await getPage(id);
        res.json(page);
    }
}

module.exports = new BlockController()