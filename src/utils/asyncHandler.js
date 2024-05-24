const asyncHandler = (requesthandler) =>{
  return  (req,res,next) =>{
        Promise.resolve(requesthandler(req,res,next))
        .catch((err)=> next(err))
    }
}


export default asyncHandler;

// const asyncHandler = (fn)=> async(req,res,next)=>{        //higher order function taking funciton as a parameter
//    try{
//        await fn(req,res,next)
//    }
//    catch (error){
//         res.status(err.code || 500).json({
//             success : false,
//             message : err.message
//         })
//    }
// }