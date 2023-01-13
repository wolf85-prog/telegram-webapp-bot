class ProjectController {
    
    async getProjects(req, res) {
        const secret =  Math.floor(Math.random()*100)
        res.json({secret})
    }

    async getProjects2(req, res) {
        const secret =  Math.floor(Math.random()*100)
        res.json({secret})
    }
}

module.exports = new ProjectController()