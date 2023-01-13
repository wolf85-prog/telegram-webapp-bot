class SecretController {
    
    async secretInfo(req, res) {
        const secret =  Math.floor(Math.random()*100)
        res.json({secret})
    }
}

module.exports = new SecretController()