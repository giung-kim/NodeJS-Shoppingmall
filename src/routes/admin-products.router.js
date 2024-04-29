const express = require('express');
const router = express.Router();
const Category=require('../models/categories.model');
const { checkAdmin } = require('../middleware/auth');
const Product = require('../models/products.model');
const fs=require('fs-extra');
const ResizeImg=require('resize-img');


//#region  Add Product list
router.get('/',checkAdmin,async(req,res,next)=>{
    try{
        const products=await Product.find();
        res.render('admin/products',{
            products
        })
    }catch(err){
        console.log(err);
        next(err);
    }
})
//#endregion


//#region Add Product page
router.get('/add-product',checkAdmin,async(req,res,next)=>{

    try{
        const categories=await Category.find();
        res.render('admin/add-product',{
            categories
        })
    }catch(err){
        console.error(err);
        next(err);
    }
});
//#endregion


//region Create Product
router.post('/', checkAdmin, async (req, res, next) => {
    console.log(req.files)

    const imageFile = req.files.image.name;
    const { title, desc, price, category } = req.body;
    const slug = title.replace(/\s+/g, '-').toLowerCase();

    try {
        // 데이터를 데이터베이스에 저장해주기
        const newProduct = new Product({
            title, desc, price, slug, category, image: imageFile
        })

        await newProduct.save();

        // 이미지를 담을 폴더를 생성하기
        await fs.mkdirp('src/public/product-images/' + newProduct._id);
        await fs.mkdirp('src/public/product-images/' + newProduct._id + '/gallery');
        await fs.mkdirp('src/public/product-images/' + newProduct._id + '/gallery/thumbs');

        // 이미지 파일을 폴더에 넣어주기
        const productImage = req.files.image;
        const path = 'src/public/product-images/' + newProduct._id + '/' + imageFile;
        await productImage.mv(path);

        req.flash('success', '상품이 추가되었습니다.');
        res.redirect('/admin/products');

    } catch (error) {
        console.error(error);
        next(error);
    }
})
//#endregion


//region Delete Product
router.delete('/:id',checkAdmin,async(req,res,next)=>{
    const id =req.params.id;
    const path='src/public/product-images/' +id;

    try{
        await fs.remove(path)

        await Product.findByIdAndDelete(id);
        req.flash('success','상품이 삭제되었습니다.')
        res.redirect('back');
    }catch(err){
        console.log(err);
        next(err);
    }
})
//#endregion


//region Edit Product
router.get('/:id/edit',checkAdmin,async(req,res,next)=>{
    try{
        const categories = await Category.find();

        const {
            _id,
            title,
            category,
            desc,
            price,
            image
        }=await Product.findById(req.params.id);

        const galleryDir ='src/public/product-images/' + _id + '/gallery'
        const galleryImages=await fs.readdir(galleryDir);

        res.render('admin/edit-product',{
            title,
            desc,
            categories,
            category: category.replace(/\s+/g, '-').toLowerCase(),
            price,
            image,
            galleryImages,
            id:_id
        })
    }catch(err){
        console.error(err)
        next(err)
    }
})
//#endregion


router.post('/product-gallery/:id',async(req,res,next)=>{
    const productImage = req.files.file;
    const id = req.params.id;
    const path = 'src/public/product-images/' + id + '/gallery/' + req.files.file.name;
    const thumbsPath = 'src/public/product-images/' + id + '/gallery/thumbs/' + req.files.file.name;

    try {

        // 원본 이미지를 gallery 폴더에 넣어주기
        await productImage.mv(path);

        // 이미지를 리사이즈.
        const buf = await ResizeImg(fs.readFileSync(path), { width: 80, height: 50 });

        fs.writeFileSync(thumbsPath, buf);

        res.sendStatus(200);
    } catch (error) {
        console.error(error);
        next(error);
    }

})


router.delete('/:id/image/:imageId',checkAdmin,async(req,res,next)=>{
    const originalImage='src/public/product-images/' +req.params.id+'/gallery/' +req.params.imageId;

    const thumbsImage='src/public/product-images/' +req.params.id+'/gallery/thumbs/' +req.params.imageId;

    try{
        await fs.remove(originalImage);
        await fs.remove(thumbsImage);

        req.flash('success','이미지가 삭제되었습니다.');
        res.redirect('/admin/products/'+req.params.id+'/edit');
    }catch(err){
        console.error(err);
        next(err);
    }
})


module.exports = router;