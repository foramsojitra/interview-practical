var router = require('express').Router()
var Product = require('../models/product')

/*
To Add 
API : http://localhost:3000/add_prduct
method : POST
example input params : {
"name":"Abc",
"description":"abc",
"amount":1,
"in_stock":true
}*/
router.post('/add_prduct', (req, res, next) => {
    console.log("req.requestTime"+req.requestTime);
    if(typeof req.body.name == "string" && typeof req.body.description == "string" && 
        typeof req.body.amount == "number" && typeof req.body.in_stock == "boolean"){
        Product.findOne({},(err,data) => {

            if (data) {
                c = data.id + 1;
            }else{
                c =1;
            }

            var product = new Product({
                id:c,
                name : req.body.name,
                description: req.body.description,
                amount: req.body.amount,
                image_url : "https://www.w3schools.com/w3css/img_lights.jpg",
                in_stock :req.body.in_stock
            })

            product.save((err,succ) => {
                if (err) {
                    res.json({success : false});
                }else{
                    res.json({success : true});
                }
            })
        }).sort({_id: -1}).limit(1);

}else{
    res.json({success : false, message : "Incorrect param"});
}
});


/*
To Delete
API : http://localhost:3000/delete_prduct
method : POST
example input params : {
"_id":"5c430a9248244d1facc4d27e" //_id of product which is added
}*/
router.post('/delete_prduct', (req, res, next) => {

    Product.findOneAndRemove({_id : req.body._id}, (err,data) => {
        if (err) {
            res.json({success : false});
        }else{
            res.json({success : true});
        }
    })
});

/*
To Update
API : http://localhost:3000/update_prduct
method : POST
example input params : {
"_id":"5c430bc648244d1facc4d280", //_id of the product of which you want to upadate
"name":"bcd",
"description":"1",
"amount":1,
"in_stock":true
}*/
router.post('/update_prduct', (req, res, next) => {
 if(typeof req.body.name == "string" && typeof req.body.description == "string" &&  typeof req.body.amount == "number" && typeof req.body.in_stock == "boolean"){
    Product.findByIdAndUpdate(req.body._id, req.body, (err, product) => {
        if (err) {
            res.json({success : false});
        }else{
            res.json({success : true});
        }
    })
}else{
    res.json({success : false, message : "Incorrect param"});
}
});

/*
This is for pagination
API : http://localhost:3000/products_page
method : POST
example input params : {
"page":1 // wahtever page you want
}*/
router.post('/products_page', (req, res, next) => {
    var perPage = 5
    var page = req.body.page || 1
    
    Product.find({"in_stock" : true}).skip((perPage * page) - perPage).limit(perPage)
    .exec((err, product) => {
        Product.count({"in_stock" : true}).exec( (err, count) => {
            if (err) return next(err)
                res.json({
                    product: product,
                    current_page: page,
                    pages: Math.ceil(count / perPage)
                })
        })
    })
})

module.exports = router