const express = require('express');
const { checkAdmin } = require('../middleware/auth');
const router = express.Router();
const Category = require('../models/categories.model');

//관리자만
router.get('/add-category', checkAdmin, function (req, res) {
    res.render('admin/add-category');
})


router.post('/add-category', checkAdmin, async (req, res,next)=>{
    try{
        const title=req.body.title;
        const slug=title.replace(/\s+/g, '-' ).toLowerCase();  // \s: 공백, +:하나이상의 공백 , g:전역검색
        const category=await Category.findOne({slug: slug})
        if(category){
            req.flash('error', '이미 존재하는 카테고리입니다.');
            res.redirect('back');
        }

        //새로운 카테고리생성
        const newCategory=new Category({
            title: title,
            slug: slug
        })
        await newCategory.save();
        req.flash('success', '새로운 카테고리가 생성되었습니다.');
        res.redirect('/admin/categories');

    }catch(err){
        console.error(err);
        next(err);
    }
})


router.get('/',checkAdmin, async (req, res,next) => {
    try{
        const categories=await Category.find();
        res.render('admin/categories',{
            categories:categories
        })
    }catch(err){
        console.error(err);
        next(err);
    }
})

router.delete('/:id',checkAdmin, async (req, res, next) => {
    try{
        await Category.findByIdAndDelete(req.params.id);
        req.flash('success','카테고리가 삭제되었습니다.');
        res.redirect('/admin/categories');
    }catch(err){
        console.log(err);
        netx(err);
    }
})

module.exports = router; 