module.exports.isLoggedin=(req,res,next)=>{
if(!req.isAuthenticated()){
    req.flash('error','Sign in first');
    return res.redirect('/login');
}
next();
}
module.exports.isAdmin=(req,res,next)=>{
    if(req.user.username!=='admin'){
    req.flash('error','You are not authorized');
    return res.redirect('/login');
    }
    next();
}
module.exports.isUser=(req,res,next)=>{
    if(req.user.username==='admin'){
    req.flash('error','You are not authorized');
    return res.redirect('/login');
    }
    next();
}














