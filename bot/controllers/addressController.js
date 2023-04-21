require("dotenv").config();
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseAddressId = process.env.NOTION_DATABASE_ADDRESS_ID

//получить данные таблицы Площадки
async function getAddress() {
    try {
        const response = await notion.databases.query({
            database_id: databaseAddressId
        });

        const responseResults = response.results.map((page) => {
            return {
               id: page.id,
               title: '',

            };
        });

        //console.log(responseResults);
        return response;
    } catch (error) {
        console.error(error.message)
    }
}


class AddressController {

    async address(req, res) {
        const address = await getAddress();
        res.json(address);
    }
}

module.exports = new AddressController()