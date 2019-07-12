const router = require("express").Router();

router.get("/profile", (req, res) => {
    if(req.isAuthenticated()){
        res.render('profile')
    }else{
        res.send("not authenticated")
    }
})

module.exports = router;