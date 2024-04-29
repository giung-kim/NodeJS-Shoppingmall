const Category=require('../models/categories.model');

async function getAllCategories(req,res,next){
    try{
        const categories=await Category.find();
        res.locals.categories=categories
        next();
    }catch(err){
        console.error(err);
        next(err);
    }
}

module.exports=getAllCategories;