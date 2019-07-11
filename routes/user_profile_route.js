const router = require("express").Router();

router.get("/profile", (req, res) => {
    if(req.isAuthenticated()){
        console.log('profile')
        res.render('profile')
    }else{
        res.send("not authenticated")
    }
})

module.exports = router;